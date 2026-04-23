import { NextResponse } from "next/server";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { getQuoteRecord } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isInternalAuthConfigured() || !(await hasInternalAccessOrCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const record = await getQuoteRecord(id);
  if (!record) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
