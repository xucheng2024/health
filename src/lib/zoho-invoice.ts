import { getPlanById } from "@/data/plans";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { QuoteLineItem, QuoteRecord } from "@/lib/types";

type ZohoConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  organizationId: string;
  accountsUrl: string;
  apiBaseUrl: string;
  adminEmail?: string;
  taxId?: string;
  paymentTerms?: number;
};

type ZohoContact = {
  contact_id: string | number;
  primary_contact_id?: string | number;
};

type ZohoInvoice = {
  invoice_id: string | number;
  invoice_number?: string;
  invoice_url?: string;
  status?: string;
  created_time?: string;
  customer_id?: string | number;
  payment_made?: string | number;
  balance?: string | number;
};

type ZohoPayment = {
  payment_id: string | number;
};

export type SendZohoInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  sentTo: string;
  cc: string[];
  reusedExisting: boolean;
};

export type PreviewZohoInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  reusedExisting: boolean;
};

export type ReissueZohoInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
};

export type VoidZohoInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string | null;
  alreadyVoided: boolean;
};

export type RecordZohoPaymentResult = {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string | null;
  paidAmount: number | null;
  balanceDue: number | null;
  invoiceStatus: "sent" | "paid" | "void";
};

export function isZohoInvoiceConfigured(): boolean {
  return Boolean(
    process.env.ZOHO_CLIENT_ID?.trim() &&
      process.env.ZOHO_CLIENT_SECRET?.trim() &&
      process.env.ZOHO_REFRESH_TOKEN?.trim() &&
      process.env.ZOHO_ORGANIZATION_ID?.trim(),
  );
}

function getZohoConfig(): ZohoConfig {
  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN?.trim();
  const organizationId = process.env.ZOHO_ORGANIZATION_ID?.trim();

  if (!clientId || !clientSecret || !refreshToken || !organizationId) {
    throw new Error(
      "Zoho Invoice is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ORGANIZATION_ID.",
    );
  }

  const paymentTerms = Number(process.env.ZOHO_INVOICE_PAYMENT_TERMS_DAYS ?? 0);

  return {
    clientId,
    clientSecret,
    refreshToken,
    organizationId,
    accountsUrl: trimTrailingSlash(process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com"),
    apiBaseUrl: trimTrailingSlash(process.env.ZOHO_API_BASE_URL ?? "https://www.zohoapis.com"),
    adminEmail:
      process.env.ZOHO_INVOICE_ADMIN_EMAIL?.trim() ||
      process.env.INTERNAL_SALES_EMAIL?.trim() ||
      undefined,
    taxId: process.env.ZOHO_INVOICE_TAX_ID?.trim() || undefined,
    paymentTerms: Number.isFinite(paymentTerms) ? Math.max(0, Math.floor(paymentTerms)) : 0,
  };
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function num(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

async function readZohoJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

async function getAccessToken(config: ZohoConfig): Promise<string> {
  const params = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  });

  const response = await fetch(`${config.accountsUrl}/oauth/v2/token`, {
    method: "POST",
    body: params,
  });
  const data = await readZohoJson(response);

  if (!response.ok || typeof data.access_token !== "string") {
    throw new Error(`Zoho token refresh failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function zohoRequest(
  config: ZohoConfig,
  accessToken: string,
  path: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
  const response = await fetch(`${config.apiBaseUrl}/invoice/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "X-com-zoho-invoice-organizationid": config.organizationId,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await readZohoJson(response);

  if (!response.ok || (typeof data.code === "number" && data.code !== 0)) {
    throw new Error(`Zoho API failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Customer", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function invoiceNumberDatePart(date: Date): string {
  return toIsoDate(date).replace(/-/g, "");
}

function buildInvoiceNumber(datePart: string, sequence: number): string {
  return `INV-${datePart}-${String(sequence).padStart(4, "0")}`;
}

function parseInvoiceSequence(invoiceNumber: string, datePart: string): number | null {
  const match = invoiceNumber.match(new RegExp(`^INV-${datePart}-(\\d{4,})$`));
  if (!match) return null;
  return Number(match[1]);
}

function isDuplicateInvoiceNumberError(error: unknown): boolean {
  return error instanceof Error && /"code"\s*:\s*1001/.test(error.message);
}

async function getNextInvoiceSequenceForDate(datePart: string): Promise<number> {
  const supabase = getSupabaseServiceRole();
  const prefix = `INV-${datePart}-`;
  const { data, error } = await supabase
    .from("quotes")
    .select("zoho_invoice_number")
    .ilike("zoho_invoice_number", `${prefix}%`);

  if (error || !Array.isArray(data)) {
    if (error) {
      console.error("getNextInvoiceSequenceForDate", error);
    }
    return 1;
  }

  let maxSequence = 0;
  for (const row of data as Array<{ zoho_invoice_number: string | null }>) {
    if (!row.zoho_invoice_number) continue;
    const sequence = parseInvoiceSequence(row.zoho_invoice_number, datePart);
    if (sequence && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return maxSequence + 1;
}

function invoiceLineItems(record: QuoteRecord, config: ZohoConfig): Record<string, unknown>[] {
  const plan = getPlanById(record.quote.planId);
  const quoteItems =
    record.lineItems.length > 0
      ? record.lineItems
      : ([
          {
            title: plan?.name ?? record.quote.planId,
            qty: record.quote.qty,
            unitPrice: record.quote.unitPrice,
            amount: record.quote.subtotal,
            sortOrder: 0,
          },
        ] satisfies QuoteLineItem[]);

  return quoteItems.map((item) => {
    const line: Record<string, unknown> = {
      name: item.title.trim() || plan?.name || record.quote.planId,
      description: `From quotation ${record.quote.quoteNo}`,
      quantity: Math.max(1, item.qty || 1),
      rate: Math.max(0, item.unitPrice || item.amount || 0),
    };
    if (config.taxId && record.quote.taxAmount > 0) {
      line.tax_id = config.taxId;
    }
    return line;
  });
}

async function findContactByEmail(
  config: ZohoConfig,
  accessToken: string,
  email: string,
): Promise<ZohoContact | null> {
  const params = new URLSearchParams({
    email,
    per_page: "1",
  });
  const data = await zohoRequest(config, accessToken, `/contacts?${params.toString()}`);
  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  const first = contacts[0] as ZohoContact | undefined;
  return first?.contact_id ? first : null;
}

async function createContact(
  config: ZohoConfig,
  accessToken: string,
  record: QuoteRecord,
): Promise<ZohoContact> {
  const { firstName, lastName } = splitName(record.quote.contactName);
  const existing = await findContactByEmail(config, accessToken, record.quote.contactEmail);
  if (existing) return existing;

  const payload = {
    contact_name: record.quote.companyName || record.quote.contactName,
    company_name: record.quote.companyName || undefined,
    contact_type: "customer",
    currency_code: record.quote.currency,
    payment_terms: config.paymentTerms ?? 0,
    billing_address: {
      attention: record.quote.contactName,
      address: record.quote.billingAddress || undefined,
      phone: record.quote.contactPhone || undefined,
    },
    contact_persons: [
      {
        first_name: firstName,
        last_name: lastName,
        email: record.quote.contactEmail,
        phone: record.quote.contactPhone || undefined,
        is_primary_contact: true,
      },
    ],
  };

  const data = await zohoRequest(config, accessToken, "/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const contact = data.contact as ZohoContact | undefined;

  if (!contact?.contact_id) {
    throw new Error(`Zoho contact create returned no contact_id: ${JSON.stringify(data)}`);
  }

  return contact;
}

async function createInvoice(
  config: ZohoConfig,
  accessToken: string,
  record: QuoteRecord,
  contact: ZohoContact,
): Promise<ZohoInvoice> {
  const today = new Date();
  const datePart = invoiceNumberDatePart(today);
  const nextSequence = await getNextInvoiceSequenceForDate(datePart);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const payload: Record<string, unknown> = {
      customer_id: String(contact.contact_id),
      contact_persons: contact.primary_contact_id ? [String(contact.primary_contact_id)] : undefined,
      date: toIsoDate(today),
      due_date: toIsoDate(addDays(today, config.paymentTerms ?? 0)),
      payment_terms: config.paymentTerms ?? 0,
      invoice_number: buildInvoiceNumber(datePart, nextSequence + attempt),
      reference_number: record.quote.quoteNo,
      currency_code: record.quote.currency,
      line_items: invoiceLineItems(record, config),
      notes: `Generated from HealthOptix quotation ${record.quote.quoteNo}.`,
      terms: "Full payment must be made prior to system deployment unless otherwise agreed.",
    };

    if (record.quote.discount > 0) {
      payload.discount = record.quote.discount;
      payload.discount_type = "entity_level";
      payload.is_discount_before_tax = true;
    }

    try {
      const data = await zohoRequest(config, accessToken, "/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const invoice = data.invoice as ZohoInvoice | undefined;

      if (!invoice?.invoice_id) {
        throw new Error(`Zoho invoice create returned no invoice_id: ${JSON.stringify(data)}`);
      }

      return invoice;
    } catch (error) {
      if (isDuplicateInvoiceNumberError(error) && attempt < 9) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Unable to allocate a unique Zoho invoice number for ${datePart}.`);
}

async function getInvoiceById(
  config: ZohoConfig,
  accessToken: string,
  invoiceId: string,
): Promise<ZohoInvoice | null> {
  try {
    const data = await zohoRequest(config, accessToken, `/invoices/${encodeURIComponent(invoiceId)}`);
    const invoice = data.invoice as ZohoInvoice | undefined;
    return invoice?.invoice_id ? invoice : null;
  } catch {
    return null;
  }
}

async function findInvoiceByReferenceNumber(
  config: ZohoConfig,
  accessToken: string,
  referenceNumber: string,
): Promise<ZohoInvoice | null> {
  const params = new URLSearchParams({
    reference_number: referenceNumber,
    per_page: "200",
  });
  const data = await zohoRequest(config, accessToken, `/invoices?${params.toString()}`);
  const invoices = Array.isArray(data.invoices) ? data.invoices : [];
  const candidates = invoices.filter((invoice) => {
    const candidate = invoice as Record<string, unknown>;
    return candidate.reference_number === referenceNumber && candidate.invoice_id;
  }) as ZohoInvoice[];

  if (candidates.length === 0) return null;

  const timestamp = (value?: string): number => {
    if (!value) return 0;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const statusRank = (status?: string): number => {
    if (status === "void") return 0;
    if (status === "paid") return 3;
    if (
      status === "sent" ||
      status === "viewed" ||
      status === "overdue" ||
      status === "unpaid" ||
      status === "partially_paid"
    ) {
      return 2;
    }
    if (status === "draft") return 1;
    return 1;
  };

  candidates.sort((a, b) => {
    const rankDiff = statusRank(b.status) - statusRank(a.status);
    if (rankDiff !== 0) return rankDiff;
    const timeDiff = timestamp(b.created_time) - timestamp(a.created_time);
    if (timeDiff !== 0) return timeDiff;
    return Number(b.invoice_id) - Number(a.invoice_id);
  });

  return candidates[0] ?? null;
}

async function persistInvoiceReference(
  quoteId: string,
  invoice: ZohoInvoice,
  options?: {
    markSent?: boolean;
    forceStatus?: "draft" | "sent" | "paid" | "void";
  },
): Promise<void> {
  const normalizedStatus =
    options?.forceStatus ??
    (invoice.status === "void"
      ? "void"
      : invoice.status === "paid"
        ? "paid"
        : invoice.status === "draft"
          ? "draft"
          : "sent");
  const supabase = getSupabaseServiceRole();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("quotes")
    .update({
      zoho_invoice_id: String(invoice.invoice_id),
      zoho_invoice_number: invoice.invoice_number ?? null,
      zoho_invoice_url: invoice.invoice_url ?? null,
      zoho_invoice_sent_at: options?.markSent ? now : undefined,
      zoho_invoice_status: normalizedStatus,
      zoho_invoice_paid_amount: num(invoice.payment_made),
      zoho_invoice_balance_due: num(invoice.balance),
      updated_at: now,
    })
    .eq("id", quoteId);

  if (error) {
    console.error("persistInvoiceReference", error);
  }
}

async function getOrCreateInvoice(
  config: ZohoConfig,
  accessToken: string,
  record: QuoteRecord,
  contact: ZohoContact,
): Promise<{ invoice: ZohoInvoice; reusedExisting: boolean }> {
  if (record.quote.zohoInvoiceId) {
    const stored = await getInvoiceById(config, accessToken, record.quote.zohoInvoiceId);
    if (stored) {
      return { invoice: stored, reusedExisting: true };
    }
  }

  const existing = await findInvoiceByReferenceNumber(
    config,
    accessToken,
    record.quote.quoteNo,
  );
  if (existing) {
    await persistInvoiceReference(record.quote.id, existing);
    return { invoice: existing, reusedExisting: true };
  }

  const created = await createInvoice(config, accessToken, record, contact);
  await persistInvoiceReference(record.quote.id, created);
  return { invoice: created, reusedExisting: false };
}

async function findExistingInvoiceForQuote(
  config: ZohoConfig,
  accessToken: string,
  record: QuoteRecord,
): Promise<ZohoInvoice | null> {
  if (record.quote.zohoInvoiceId) {
    const stored = await getInvoiceById(config, accessToken, record.quote.zohoInvoiceId);
    if (stored) {
      return stored;
    }
  }

  const existing = await findInvoiceByReferenceNumber(
    config,
    accessToken,
    record.quote.quoteNo,
  );
  if (existing) {
    await persistInvoiceReference(record.quote.id, existing);
    return existing;
  }

  return null;
}

async function emailInvoice(
  config: ZohoConfig,
  accessToken: string,
  record: QuoteRecord,
  invoice: ZohoInvoice,
  options?: {
    toEmail?: string;
    cc?: string[];
  },
): Promise<string[]> {
  const toEmail = options?.toEmail ?? record.quote.contactEmail;
  const cc = options?.cc ?? (config.adminEmail ? [config.adminEmail] : []);
  const payload = {
    send_from_org_email_id: true,
    to_mail_ids: [toEmail],
    cc_mail_ids: cc,
    subject: `HealthOptix Invoice for ${record.quote.quoteNo}`,
    body: `Dear ${record.quote.contactName},<br><br>Please find attached the invoice for quotation ${record.quote.quoteNo}.<br><br>Thank you,<br>HealthOptix`,
  };

  await zohoRequest(config, accessToken, `/invoices/${invoice.invoice_id}/email?send_attachment=true`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return cc;
}

export async function createAndSendZohoInvoice(
  record: QuoteRecord,
  options?: {
    toEmail?: string;
    cc?: string[];
  },
): Promise<SendZohoInvoiceResult> {
  const config = getZohoConfig();
  const accessToken = await getAccessToken(config);
  const contact = await createContact(config, accessToken, record);
  const { invoice, reusedExisting } = await getOrCreateInvoice(
    config,
    accessToken,
    record,
    contact,
  );
  if (invoice.status === "void") {
    throw new Error(
      `Zoho invoice ${invoice.invoice_number ?? invoice.invoice_id} is voided and cannot be sent.`,
    );
  }
  const cc = await emailInvoice(config, accessToken, record, invoice, options);
  await persistInvoiceReference(record.quote.id, invoice, {
    markSent: true,
    forceStatus: invoice.status === "paid" ? "paid" : "sent",
  });

  return {
    invoiceId: String(invoice.invoice_id),
    invoiceNumber: invoice.invoice_number ?? null,
    invoiceUrl: invoice.invoice_url ?? null,
    sentTo: options?.toEmail ?? record.quote.contactEmail,
    cc,
    reusedExisting,
  };
}

export async function previewZohoInvoice(
  record: QuoteRecord,
): Promise<PreviewZohoInvoiceResult> {
  const config = getZohoConfig();
  const accessToken = await getAccessToken(config);
  const contact = await createContact(config, accessToken, record);
  const { invoice, reusedExisting } = await getOrCreateInvoice(
    config,
    accessToken,
    record,
    contact,
  );

  if (invoice.status === "void") {
    throw new Error(
      `Zoho invoice ${invoice.invoice_number ?? invoice.invoice_id} is voided and cannot be previewed.`,
    );
  }

  await persistInvoiceReference(record.quote.id, invoice);

  return {
    invoiceId: String(invoice.invoice_id),
    invoiceNumber: invoice.invoice_number ?? null,
    invoiceUrl: invoice.invoice_url ?? null,
    reusedExisting,
  };
}

export async function reissueZohoInvoice(
  record: QuoteRecord,
): Promise<ReissueZohoInvoiceResult> {
  const config = getZohoConfig();
  const accessToken = await getAccessToken(config);
  const existingInvoice = await findExistingInvoiceForQuote(config, accessToken, record);

  if (!existingInvoice) {
    throw new Error(`No Zoho invoice found for quotation ${record.quote.quoteNo}.`);
  }
  if (existingInvoice.status !== "void") {
    throw new Error(
      `Zoho invoice ${existingInvoice.invoice_number ?? existingInvoice.invoice_id} must be voided before reissuing.`,
    );
  }

  const contact = await createContact(config, accessToken, record);
  const replacementInvoice = await createInvoice(config, accessToken, record, contact);
  await persistInvoiceReference(record.quote.id, replacementInvoice, {
    forceStatus: replacementInvoice.status === "paid" ? "paid" : "draft",
  });

  return {
    invoiceId: String(replacementInvoice.invoice_id),
    invoiceNumber: replacementInvoice.invoice_number ?? null,
    invoiceUrl: replacementInvoice.invoice_url ?? null,
  };
}

export async function voidZohoInvoice(
  record: QuoteRecord,
): Promise<VoidZohoInvoiceResult> {
  const config = getZohoConfig();
  const accessToken = await getAccessToken(config);
  const invoice = await findExistingInvoiceForQuote(config, accessToken, record);

  if (!invoice) {
    throw new Error(`No Zoho invoice found for quotation ${record.quote.quoteNo}.`);
  }

  if (invoice.status === "void") {
    return {
      invoiceId: String(invoice.invoice_id),
      invoiceNumber: invoice.invoice_number ?? null,
      alreadyVoided: true,
    };
  }

  await zohoRequest(
    config,
    accessToken,
    `/invoices/${encodeURIComponent(String(invoice.invoice_id))}/status/void`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  await persistInvoiceReference(record.quote.id, {
    ...invoice,
    status: "void",
  });

  return {
    invoiceId: String(invoice.invoice_id),
    invoiceNumber: invoice.invoice_number ?? null,
    alreadyVoided: false,
  };
}

export async function recordZohoInvoicePayment(
  record: QuoteRecord,
  input: {
    amount: number;
    date: string;
    paymentMode: "cash" | "banktransfer" | "bankremittance" | "creditcard" | "check" | "others";
    referenceNumber?: string;
    description?: string;
  },
): Promise<RecordZohoPaymentResult> {
  const config = getZohoConfig();
  const accessToken = await getAccessToken(config);
  const invoice = await findExistingInvoiceForQuote(config, accessToken, record);

  if (!invoice) {
    throw new Error(`No Zoho invoice found for quotation ${record.quote.quoteNo}.`);
  }
  if (invoice.status === "void") {
    throw new Error(`Zoho invoice ${invoice.invoice_number ?? invoice.invoice_id} is voided.`);
  }
  if (!invoice.customer_id) {
    throw new Error(`Zoho invoice ${invoice.invoice_number ?? invoice.invoice_id} is missing customer details.`);
  }

  const paymentPayload = {
    customer_id: String(invoice.customer_id),
    payment_mode: input.paymentMode,
    amount: input.amount,
    date: input.date,
    reference_number: input.referenceNumber || undefined,
    description:
      input.description?.trim() || `Payment recorded for quotation ${record.quote.quoteNo}.`,
    invoices: [
      {
        invoice_id: String(invoice.invoice_id),
        amount_applied: input.amount,
      },
    ],
  };

  const paymentResponse = await zohoRequest(config, accessToken, "/customerpayments", {
    method: "POST",
    body: JSON.stringify(paymentPayload),
  });

  const payment = paymentResponse.payment as ZohoPayment | undefined;
  if (!payment?.payment_id) {
    throw new Error(`Zoho payment create returned no payment_id: ${JSON.stringify(paymentResponse)}`);
  }

  const refreshedInvoice = await getInvoiceById(
    config,
    accessToken,
    String(invoice.invoice_id),
  );
  if (!refreshedInvoice) {
    throw new Error(`Unable to refresh Zoho invoice ${invoice.invoice_number ?? invoice.invoice_id}.`);
  }

  await persistInvoiceReference(record.quote.id, refreshedInvoice);

  return {
    paymentId: String(payment.payment_id),
    invoiceId: String(refreshedInvoice.invoice_id),
    invoiceNumber: refreshedInvoice.invoice_number ?? null,
    paidAmount: num(refreshedInvoice.payment_made),
    balanceDue: num(refreshedInvoice.balance),
    invoiceStatus:
      refreshedInvoice.status === "void"
        ? "void"
        : refreshedInvoice.status === "paid"
          ? "paid"
          : "sent",
  };
}
