import { NextResponse } from "next/server";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { getQuoteRecordForAdmin } from "@/lib/quotes";
import { isZohoInvoiceConfigured, recordZohoInvoicePayment } from "@/lib/zoho-invoice";

export const dynamic = "force-dynamic";

type PaymentBody = {
  amount?: number;
  date?: string;
  paymentMode?:
    | "cash"
    | "banktransfer"
    | "bankremittance"
    | "creditcard"
    | "check"
    | "others";
  referenceNumber?: string;
  description?: string;
};

function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isInternalAuthConfigured() || !(await hasInternalAccessOrCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isZohoInvoiceConfigured()) {
    return NextResponse.json(
      {
        error:
          "Zoho Invoice is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ORGANIZATION_ID.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as PaymentBody;
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Payment amount must be greater than 0." }, { status: 400 });
  }
  if (!isIsoDate(body.date)) {
    return NextResponse.json({ error: "Payment date must be in YYYY-MM-DD format." }, { status: 400 });
  }
  if (!body.paymentMode) {
    return NextResponse.json({ error: "Payment mode is required." }, { status: 400 });
  }

  const { id } = await context.params;
  const record = await getQuoteRecordForAdmin(id);
  if (!record) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  try {
    const result = await recordZohoInvoicePayment(record, {
      amount,
      date: body.date,
      paymentMode: body.paymentMode,
      referenceNumber: body.referenceNumber,
      description: body.description,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("recordZohoInvoicePayment failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record payment." },
      { status: 502 },
    );
  }
}
