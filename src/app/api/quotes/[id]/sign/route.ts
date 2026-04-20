import { NextResponse } from "next/server";
import { getQuoteRecord, signQuoteRecord } from "@/lib/quote-store";
import { calculatePrice } from "@/lib/pricing";
import { sendQuoteSignedEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

type SignBody = {
  signerName: string;
  signatureData: string;
  agreedToTerms: boolean;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as SignBody;

  if (!body.agreedToTerms) {
    return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 });
  }

  if (!body.signerName?.trim()) {
    return NextResponse.json({ error: "Signer name is required" }, { status: 400 });
  }

  if (!body.signatureData?.startsWith("data:image/png;base64,")) {
    return NextResponse.json({ error: "Signature is required" }, { status: 400 });
  }

  const current = await getQuoteRecord(id);
  if (!current) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const serverPrice = calculatePrice({
    unitPrice: current.quote.unitPrice,
    qty: current.quote.qty,
    discount: current.quote.discount,
    taxRate: current.quote.taxRate,
  });

  if (
    current.quote.subtotal !== serverPrice.subtotal ||
    current.quote.taxAmount !== serverPrice.taxAmount ||
    current.quote.total !== serverPrice.total
  ) {
    return NextResponse.json({ error: "Price verification failed" }, { status: 409 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const signed = await signQuoteRecord({
    quoteId: id,
    signerName: body.signerName.trim(),
    signatureData: body.signatureData,
    ip,
    userAgent,
  });

  if (!signed) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  try {
    await sendQuoteSignedEmails(signed);
  } catch (error) {
    console.error("sendQuoteSignedEmails failed", error);
  }

  return NextResponse.json(signed);
}
