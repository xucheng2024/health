import { NextResponse } from "next/server";
import {
  applyViewedState,
  expireQuoteIfTokenElapsed,
  getQuoteRecordBySigningToken,
  getQuoteSnapshotByQuoteId,
  markQuoteViewed,
  signQuoteByToken,
} from "@/lib/quotes";
import { calculatePrice } from "@/lib/pricing";
import { getPlanById } from "@/data/plans";
import { buildSigningSnapshot } from "@/lib/quote-snapshots";
import { sendQuoteSignedEmails } from "@/lib/email";
import type { Plan } from "@/lib/types";

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

async function publicQuotePayload(
  record: NonNullable<Awaited<ReturnType<typeof getQuoteRecordBySigningToken>>>,
) {
  const { quote, signature } = record;
  const expired =
    !!quote.signingTokenExpiresAt &&
    new Date(quote.signingTokenExpiresAt) < new Date();
  const plan = resolvePlanForQuote(quote.planId, quote.currency, quote.unitPrice);
  const canSign =
    !expired && (quote.status === "draft" || quote.status === "sent");
  const snapshot =
    quote.status === "signed" ? await getQuoteSnapshotByQuoteId(quote.id) : null;
  const effectivePlan = snapshot
    ? {
        id: snapshot.planId,
        name: snapshot.planName,
        description: snapshot.planDescription,
        features: snapshot.planFeatures,
      }
    : {
        id: plan?.id ?? quote.planId,
        name: plan?.name ?? quote.planId,
        description: plan?.description ?? "",
        features: plan?.features ?? [],
      };

  return {
    status: quote.status,
    canSign,
    tokenExpired: expired && quote.status !== "signed",
    quote: {
      quoteNo: quote.quoteNo,
      planId: quote.planId,
      status: quote.status,
      companyName: quote.companyName,
      contactName: quote.contactName,
      contactEmail: quote.contactEmail,
      contactPhone: quote.contactPhone,
      currency: quote.currency,
      unitPrice: quote.unitPrice,
      qty: quote.qty,
      discount: quote.discount,
      taxRate: quote.taxRate,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      createdAt: quote.createdAt,
      quoteValidUntil: quote.quoteValidUntil,
      signingTokenExpiresAt: quote.signingTokenExpiresAt,
    },
    plan: effectivePlan,
    snapshot:
      snapshot && quote.status === "signed"
        ? {
            planTermsSummary: snapshot.planTermsSummary,
            legalTermsText: snapshot.legalTermsText,
            signerName: snapshot.signerName,
            signedAt: snapshot.signedAt,
          }
        : undefined,
    signed:
      quote.status === "signed" && signature
        ? {
            signerName: signature.signerName,
            signedAt: quote.signedAt ?? signature.createdAt,
            signatureImage: signature.signatureData,
            documentHash: signature.signedDocumentHash ?? null,
          }
        : undefined,
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

  const tokenPast =
    !!record.quote.signingTokenExpiresAt &&
    new Date(record.quote.signingTokenExpiresAt) < new Date();

  if (tokenPast) {
    return NextResponse.json(
      { error: "TOKEN_EXPIRED", message: "This signing link has expired." },
      { status: 410 },
    );
  }

  await markQuoteViewed(decoded);
  record = applyViewedState(record);

  return NextResponse.json(await publicQuotePayload(record));
}

type SignBody = {
  signerName: string;
  signatureData: string;
  agreedToTerms: boolean;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const decoded = decodeURIComponent(token);
  const body = (await request.json()) as SignBody;

  if (!body.agreedToTerms) {
    return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 });
  }

  if (!body.signerName?.trim()) {
    return NextResponse.json({ error: "Signer name is required" }, { status: 400 });
  }

  if (!body.signatureData?.startsWith("data:image/png;base64,")) {
    return NextResponse.json(
      { error: "A valid PNG signature image is required" },
      { status: 400 },
    );
  }

  let record = await getQuoteRecordBySigningToken(decoded);
  if (!record) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  record = await expireQuoteIfTokenElapsed(record);

  if (
    record.quote.signingTokenExpiresAt &&
    new Date(record.quote.signingTokenExpiresAt) < new Date() &&
    record.quote.status !== "signed"
  ) {
    return NextResponse.json(
      { error: "TOKEN_EXPIRED", message: "This signing link has expired." },
      { status: 410 },
    );
  }

  if (record.quote.status === "signed") {
    return NextResponse.json(
      { error: "ALREADY_SIGNED", message: "This quotation is already signed." },
      { status: 409 },
    );
  }

  if (record.quote.status === "expired" || record.quote.status === "cancelled") {
    return NextResponse.json(
      { error: "INVALID_STATUS", message: "This quotation cannot be signed." },
      { status: 400 },
    );
  }

  const plan = resolvePlanForQuote(
    record.quote.planId,
    record.quote.currency,
    record.quote.unitPrice,
  );

  const serverPrice = calculatePrice({
    unitPrice: record.quote.unitPrice,
    qty: record.quote.qty,
    discount: record.quote.discount,
    taxRate: record.quote.taxRate,
  });

  if (
    record.quote.subtotal !== serverPrice.subtotal ||
    record.quote.taxAmount !== serverPrice.taxAmount ||
    record.quote.total !== serverPrice.total
  ) {
    return NextResponse.json({ error: "Price verification failed" }, { status: 409 });
  }

  const signedAtIso = new Date().toISOString();
  const { snapshot, documentHash } = buildSigningSnapshot({
    quote: record.quote,
    plan,
    lineItems: record.lineItems,
    signerName: body.signerName.trim(),
    signedAtIso,
  });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const result = await signQuoteByToken({
    token: decoded,
    signerName: body.signerName.trim(),
    signatureData: body.signatureData,
    signerIp: ip,
    signerUserAgent: userAgent,
    snapshot,
    documentHash,
  });

  if (!result.ok) {
    if (result.code === "ALREADY_SIGNED") {
      return NextResponse.json(
        { error: "ALREADY_SIGNED", message: "This quotation is already signed." },
        { status: 409 },
      );
    }
    if (result.code === "EXPIRED") {
      return NextResponse.json(
        { error: "TOKEN_EXPIRED", message: "This signing link has expired." },
        { status: 410 },
      );
    }
    if (result.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: result.code, message: result.message ?? "Unable to sign" },
      { status: 400 },
    );
  }

  void sendQuoteSignedEmails(result.record).catch((error) => {
    console.error("sendQuoteSignedEmails failed", error);
  });

  return NextResponse.json(await publicQuotePayload(result.record));
}
