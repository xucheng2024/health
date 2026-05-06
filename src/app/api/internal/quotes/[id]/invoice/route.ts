import { NextResponse } from "next/server";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { getQuoteRecordForAdmin } from "@/lib/quotes";
import {
  createAndSendZohoInvoice,
  isZohoInvoiceConfigured,
  previewZohoInvoice,
} from "@/lib/zoho-invoice";

export const dynamic = "force-dynamic";

type InvoiceBody = {
  preview?: boolean;
};

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

  const { id } = await context.params;
  const record = await getQuoteRecordForAdmin(id);
  if (!record) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as InvoiceBody;
    const result = body.preview
      ? await previewZohoInvoice(record)
      : await createAndSendZohoInvoice(record);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("createAndSendZohoInvoice failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send invoice." },
      { status: 502 },
    );
  }
}
