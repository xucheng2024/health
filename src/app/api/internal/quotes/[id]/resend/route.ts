import { NextResponse } from "next/server";
import { sendQuoteSigningLinkEmail } from "@/lib/email";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { rotateQuoteSigningToken } from "@/lib/quotes";

export const dynamic = "force-dynamic";

const DEFAULT_VALID_DAYS = 7;

type ResendBody = {
  validDays?: number;
};

function expiresAfterDays(days: number): string {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(90, Math.floor(days))) : DEFAULT_VALID_DAYS;
  const date = new Date();
  date.setDate(date.getDate() + safeDays);
  return date.toISOString();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isInternalAuthConfigured() || !(await hasInternalAccessOrCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as ResendBody;
  const expiresAtIso = expiresAfterDays(body.validDays ?? DEFAULT_VALID_DAYS);

  const result = await rotateQuoteSigningToken({ quoteId: id, expiresAtIso });
  if (!result.ok) {
    if (result.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    if (result.code === "ALREADY_SIGNED") {
      return NextResponse.json({ error: "Quote already signed" }, { status: 409 });
    }
    if (result.code === "CANCELLED") {
      return NextResponse.json({ error: "Quote is cancelled" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to resend link" }, { status: 400 });
  }

  try {
    await sendQuoteSigningLinkEmail(result.record);
  } catch (error) {
    console.error("sendQuoteSigningLinkEmail failed", error);
    return NextResponse.json(
      { error: "Token refreshed but email sending failed." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    quoteId: result.record.quote.id,
    signingTokenExpiresAt: result.record.quote.signingTokenExpiresAt,
  });
}
