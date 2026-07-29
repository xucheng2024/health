import { NextResponse } from "next/server";
import { sendSignedQuoteEmailToInternal } from "@/lib/email";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { getQuoteRecordForAdmin } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isInternalAuthConfigured() || !(await hasInternalAccessOrCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const record = await getQuoteRecordForAdmin(id);
  if (!record) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  if (record.quote.status !== "signed") {
    return NextResponse.json(
      { error: "Only signed quotations can be sent to the administrator." },
      { status: 409 },
    );
  }

  try {
    const sentTo = await sendSignedQuoteEmailToInternal(record);
    return NextResponse.json({ ok: true, sentTo });
  } catch (error) {
    console.error("send signed contract to administrator failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to send signed contract to administrator.",
      },
      { status: 502 },
    );
  }
}
