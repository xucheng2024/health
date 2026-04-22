import { NextResponse } from "next/server";
import {
  expireQuoteIfTokenElapsed,
  getQuoteRecordBySigningToken,
  getQuoteSnapshotByQuoteId,
} from "@/lib/quotes";
import { getPlanById } from "@/data/plans";
import type { Plan } from "@/lib/types";
import { generateSignedQuotePdfBuffer } from "@/lib/quote-pdf";

export const dynamic = "force-dynamic";

function humanizePlanId(planId: string): string {
  return planId
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function resolvePlanForQuote(planId: string, currency: string, amount: number): Plan {
  const predefined = getPlanById(planId);
  if (predefined) return predefined;
  return {
    id: planId,
    name: humanizePlanId(planId) || "Custom Quotation",
    tagline: "Custom package from quotation table",
    description: "Package selected from quotation table.",
    suitableFor: "Custom quotation flow",
    currency,
    unitPrice: amount,
    features: [],
    exclusions: [],
    optionalAddons: [],
    termsSummary: [],
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const decoded = decodeURIComponent(token);

  let record = await getQuoteRecordBySigningToken(decoded);
  if (!record) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  record = await expireQuoteIfTokenElapsed(record);

  if (record.quote.status !== "signed" || !record.signature) {
    return NextResponse.json(
      { error: "NOT_SIGNED", message: "Signed PDF is available after signing." },
      { status: 409 },
    );
  }

  const plan = resolvePlanForQuote(
    record.quote.planId,
    record.quote.currency,
    record.quote.unitPrice,
  );
  const snapshot = await getQuoteSnapshotByQuoteId(record.quote.id);
  const pdfBytes = await generateSignedQuotePdfBuffer({ record, plan, snapshot });
  const body = Buffer.from(pdfBytes);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${record.quote.quoteNo}-signed.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

