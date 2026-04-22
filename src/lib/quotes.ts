import { randomBytes } from "node:crypto";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type {
  Quote,
  QuoteLineItem,
  QuoteRecord,
  QuoteStatus,
  Signature,
} from "@/lib/types";
import type { QuoteSigningSnapshot } from "@/lib/quote-snapshots";

type QuoteRow = {
  id: string;
  quote_no: string;
  plan_id: string;
  status: QuoteStatus;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  billing_address: string | null;
  currency: string;
  unit_price: string | number;
  qty: number;
  discount: string | number;
  tax_rate: string | number;
  subtotal: string | number;
  tax_amount: string | number;
  total: string | number;
  agreed_to_terms: boolean;
  signing_token: string;
  signing_token_expires_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

type SignatureRow = {
  id: string;
  quote_id: string;
  signer_name: string;
  signature_data: string;
  signer_ip: string | null;
  signer_user_agent: string | null;
  signed_document_hash: string | null;
  created_at: string;
};

type QuoteSnapshotRow = {
  id: string;
  quote_id: string;
  snapshot_json: QuoteSigningSnapshot;
  document_hash: string;
  created_at: string;
};

type QuoteLineItemRow = {
  id: string;
  quote_id: string;
  title: string;
  qty: number;
  unit_price: string | number;
  amount: string | number;
  sort_order: number;
  created_at: string;
};

function num(v: string | number): number {
  return typeof v === "number" ? v : Number(v);
}

function mapQuoteRow(row: QuoteRow): Quote {
  return {
    id: row.id,
    quoteNo: row.quote_no,
    planId: row.plan_id,
    status: row.status,
    companyName: row.company_name,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? "",
    billingAddress: row.billing_address ?? "",
    currency: row.currency,
    unitPrice: num(row.unit_price),
    qty: row.qty,
    discount: num(row.discount),
    taxRate: num(row.tax_rate),
    subtotal: num(row.subtotal),
    taxAmount: num(row.tax_amount),
    total: num(row.total),
    agreedToTerms: row.agreed_to_terms,
    signedAt: row.signed_at,
    signingToken: row.signing_token,
    signingTokenExpiresAt: row.signing_token_expires_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSignatureRow(row: SignatureRow): Signature {
  return {
    id: row.id,
    quoteId: row.quote_id,
    signerName: row.signer_name,
    signatureData: row.signature_data,
    ip: row.signer_ip ?? undefined,
    userAgent: row.signer_user_agent ?? undefined,
    signerIp: row.signer_ip ?? undefined,
    signerUserAgent: row.signer_user_agent ?? undefined,
    signedDocumentHash: row.signed_document_hash,
    createdAt: row.created_at,
  };
}

function mapQuoteLineItemRow(row: QuoteLineItemRow): QuoteLineItem {
  return {
    id: row.id,
    quoteId: row.quote_id,
    title: row.title,
    qty: row.qty,
    unitPrice: num(row.unit_price),
    amount: num(row.amount),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

async function fetchSignatureForQuote(
  quoteId: string,
): Promise<Signature | null> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("quote_signatures")
    .select("*")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (error || !data) return null;
  return mapSignatureRow(data as SignatureRow);
}

async function fetchLineItemsForQuote(quoteId: string): Promise<QuoteLineItem[]> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return (data as QuoteLineItemRow[]).map(mapQuoteLineItemRow);
}

function toRecord(
  quote: Quote,
  signature: Signature | null,
  lineItems: QuoteLineItem[],
): QuoteRecord {
  return { quote, signature, lineItems };
}

export async function getQuoteSnapshotByQuoteId(
  quoteId: string,
): Promise<QuoteSigningSnapshot | null> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("quote_snapshots")
    .select("*")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (error || !data) return null;
  return (data as QuoteSnapshotRow).snapshot_json;
}

export async function createQuoteRecord(
  quote: Omit<
    Quote,
    | "id"
    | "quoteNo"
    | "createdAt"
    | "updatedAt"
    | "signingToken"
    | "signingTokenExpiresAt"
    | "sentAt"
    | "viewedAt"
    | "signedAt"
    | "agreedToTerms"
  > & { signingTokenExpiresAt?: string | null; lineItems?: QuoteLineItem[] },
): Promise<QuoteRecord> {
  const supabase = getSupabaseServiceRole();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const signingToken = randomBytes(32).toString("base64url");
  const datePart = now.slice(0, 10).replace(/-/g, "");
  const quoteNo = `Q-${datePart}-${randomBytes(3).toString("hex").toUpperCase()}`;

  const row = {
    id,
    quote_no: quoteNo,
    plan_id: quote.planId,
    status: quote.status,
    company_name: quote.companyName,
    contact_name: quote.contactName,
    contact_email: quote.contactEmail,
    contact_phone: quote.contactPhone,
    billing_address: quote.billingAddress,
    currency: quote.currency,
    unit_price: quote.unitPrice,
    qty: quote.qty,
    discount: quote.discount,
    tax_rate: quote.taxRate,
    subtotal: quote.subtotal,
    tax_amount: quote.taxAmount,
    total: quote.total,
    agreed_to_terms: false,
    signing_token: signingToken,
    signing_token_expires_at: quote.signingTokenExpiresAt ?? null,
    sent_at: null,
    viewed_at: null,
    signed_at: null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("quotes")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    console.error("createQuoteRecord", error);
    throw new Error(error?.message ?? "Failed to create quote");
  }

  const mapped = mapQuoteRow(data as QuoteRow);

  const lineRows = (quote.lineItems ?? [])
    .map((row, index) => ({
      quote_id: mapped.id,
      title: row.title.trim() || `Item ${index + 1}`,
      qty: Math.max(0, Math.floor(row.qty)),
      unit_price: Math.max(0, row.unitPrice),
      amount: Math.max(0, row.amount),
      sort_order: Number.isFinite(row.sortOrder) ? row.sortOrder : index,
    }))
    .filter((row) => row.qty > 0 || row.amount > 0);

  if (lineRows.length > 0) {
    const { error: lineError } = await supabase
      .from("quote_line_items")
      .insert(lineRows);
    if (lineError) {
      console.error("createQuoteRecord lineItems", lineError);
      throw new Error(lineError.message ?? "Failed to save quote line items");
    }
  }

  const lineItems = await fetchLineItemsForQuote(mapped.id);
  return toRecord(mapped, null, lineItems);
}

export async function getQuoteRecord(id: string): Promise<QuoteRecord | null> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const quote = mapQuoteRow(data as QuoteRow);
  const signature = await fetchSignatureForQuote(quote.id);
  const lineItems = await fetchLineItemsForQuote(quote.id);
  return toRecord(quote, signature, lineItems);
}

export const getQuoteRecordById = getQuoteRecord;

export async function getQuoteRecordBySigningToken(
  token: string,
): Promise<QuoteRecord | null> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("signing_token", token)
    .maybeSingle();

  if (error || !data) return null;
  const quote = mapQuoteRow(data as QuoteRow);
  const signature = await fetchSignatureForQuote(quote.id);
  const lineItems = await fetchLineItemsForQuote(quote.id);
  return toRecord(quote, signature, lineItems);
}

/**
 * First client view of the signing link: records viewed_at and moves draft → sent.
 */
export async function markQuoteViewed(token: string): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const { data: row } = await supabase
    .from("quotes")
    .select("id, viewed_at, status")
    .eq("signing_token", token)
    .maybeSingle();

  if (!row || row.viewed_at) return;

  const now = new Date().toISOString();
  const patch: Record<string, string> = { viewed_at: now };
  if (row.status === "draft") {
    patch.status = "sent";
    patch.sent_at = now;
  }

  await supabase.from("quotes").update(patch).eq("id", row.id);
}

export async function expireQuoteIfTokenElapsed(
  record: QuoteRecord,
): Promise<QuoteRecord> {
  const { quote } = record;
  if (
    quote.status === "signed" ||
    quote.status === "cancelled" ||
    !quote.signingTokenExpiresAt
  ) {
    return record;
  }

  if (new Date(quote.signingTokenExpiresAt) < new Date()) {
    const supabase = getSupabaseServiceRole();
    await supabase
      .from("quotes")
      .update({ status: "expired" })
      .eq("id", quote.id)
      .in("status", ["draft", "sent"]);

    return toRecord({ ...quote, status: "expired" }, record.signature, record.lineItems);
  }

  return record;
}

export type SignQuoteByTokenResult =
  | { ok: true; record: QuoteRecord }
  | {
      ok: false;
      code:
        | "NOT_FOUND"
        | "ALREADY_SIGNED"
        | "EXPIRED"
        | "INVALID_STATUS"
        | "CONFLICT"
        | "RPC_ERROR";
      message?: string;
    };

export async function signQuoteByToken(params: {
  token: string;
  signerName: string;
  signatureData: string;
  signerIp?: string;
  signerUserAgent?: string;
  snapshot: QuoteSigningSnapshot;
  documentHash: string;
}): Promise<SignQuoteByTokenResult> {
  const supabase = getSupabaseServiceRole();

  const { data, error } = await supabase.rpc("sign_quote_by_token", {
    p_token: params.token,
    p_signer_name: params.signerName.trim(),
    p_signature_data: params.signatureData,
    p_signer_ip: params.signerIp ?? null,
    p_signer_user_agent: params.signerUserAgent ?? null,
    p_snapshot: params.snapshot as unknown as Record<string, unknown>,
    p_document_hash: params.documentHash,
  });

  if (error) {
    console.error("sign_quote_by_token rpc", error);
    return { ok: false, code: "RPC_ERROR", message: error.message };
  }

  const result = data as { ok: boolean; code?: string; quote_id?: string };
  if (!result.ok) {
    const c = result.code;
    if (c === "NOT_FOUND" || c === "ALREADY_SIGNED" || c === "EXPIRED") {
      return { ok: false, code: c };
    }
    if (c === "INVALID_STATUS" || c === "CONFLICT") {
      return { ok: false, code: c };
    }
    return { ok: false, code: "CONFLICT" };
  }

  const record = await getQuoteRecord(result.quote_id as string);
  if (!record) return { ok: false, code: "NOT_FOUND" };
  return { ok: true, record };
}

export async function signQuoteRecord(params: {
  quoteId: string;
  signerName: string;
  signatureData: string;
  signerIp?: string;
  signerUserAgent?: string;
  snapshot: QuoteSigningSnapshot;
  documentHash: string;
}): Promise<SignQuoteByTokenResult> {
  const rec = await getQuoteRecord(params.quoteId);
  if (!rec) return { ok: false, code: "NOT_FOUND" };
  if (rec.quote.status === "signed") {
    return { ok: false, code: "ALREADY_SIGNED" };
  }
  return signQuoteByToken({
    token: rec.quote.signingToken,
    signerName: params.signerName,
    signatureData: params.signatureData,
    signerIp: params.signerIp,
    signerUserAgent: params.signerUserAgent,
    snapshot: params.snapshot,
    documentHash: params.documentHash,
  });
}

export type AdminQuoteListItem = {
  id: string;
  quoteNo: string;
  companyName: string;
  contactEmail: string;
  total: number;
  currency: string;
  status: QuoteStatus;
  createdAt: string;
  signedAt: string | null;
  signingToken: string;
};

export async function listQuotesForAdmin(): Promise<AdminQuoteListItem[]> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, quote_no, company_name, contact_email, total, currency, status, created_at, signed_at, signing_token",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("listQuotesForAdmin", error);
    return [];
  }

  return (data as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    quoteNo: r.quote_no as string,
    companyName: r.company_name as string,
    contactEmail: r.contact_email as string,
    total: num(r.total as string | number),
    currency: r.currency as string,
    status: r.status as QuoteStatus,
    createdAt: r.created_at as string,
    signedAt: (r.signed_at as string | null) ?? null,
    signingToken: r.signing_token as string,
  }));
}
