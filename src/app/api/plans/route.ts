import { NextResponse } from "next/server";
import { plans } from "@/data/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ plans });
}
