import { NextResponse } from "next/server";
import { isQuotationSigningLinkEmailConfigured, sendQuoteSigningLinkEmail } from "@/lib/email";
import { getQuoteRecord } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const expectedPassword = process.env.QUOTATION_CREATE_PASSWORD?.trim();
  if (!expectedPassword) {
    return NextResponse.json(
      { error: "Server config missing QUOTATION_CREATE_PASSWORD" },
      { status: 500 },
    );
  }

  const providedPassword = request.headers.get("x-create-password")?.trim();
  if (!providedPassword || providedPassword !== expectedPassword) {
    return NextResponse.json({ error: "Invalid create password" }, { status: 401 });
  }

  const { id } = await context.params;
  const record = await getQuoteRecord(id);
  if (!record) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const { quote } = record;
  if (quote.status === "signed") {
    return NextResponse.json({ error: "This quotation is already signed." }, { status: 409 });
  }
  if (quote.status === "cancelled") {
    return NextResponse.json({ error: "This quotation is cancelled." }, { status: 409 });
  }

  try {
    await sendQuoteSigningLinkEmail(record);
  } catch (error) {
    console.error("sendQuoteSigningLinkEmail", error);
    return NextResponse.json(
      { error: "Email could not be sent. Please try again or copy the link manually." },
      { status: 502 },
    );
  }

  const emailConfigured = isQuotationSigningLinkEmailConfigured();

  return NextResponse.json({
    ok: true,
    to: quote.contactEmail,
    emailConfigured,
    message: emailConfigured
      ? "Signing link has been sent to the contact email."
      : "Email service is not configured on the server; the link was not delivered by email. Copy the link and send it manually.",
  });
}
