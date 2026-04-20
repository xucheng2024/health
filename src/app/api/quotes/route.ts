import { NextResponse } from "next/server";
import { createQuoteRecord } from "@/lib/quote-store";
import { getPlanById } from "@/data/plans";
import { calculatePrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type CreateQuoteBody = {
  planId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  qty?: number;
  discount?: number;
  taxRate?: number;
};

function isEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateQuoteBody;
  const plan = getPlanById(body.planId);

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (
    !body.companyName?.trim() ||
    !body.contactName?.trim() ||
    !body.contactEmail?.trim() ||
    !isEmail(body.contactEmail)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required fields" },
      { status: 400 },
    );
  }

  const qty = body.qty ?? 1;
  const discount = body.discount ?? 0;
  const taxRate = body.taxRate ?? 9;
  const price = calculatePrice({
    unitPrice: plan.unitPrice,
    qty,
    discount,
    taxRate,
  });

  const record = await createQuoteRecord({
    planId: plan.id,
    status: "draft",
    companyName: body.companyName.trim(),
    contactName: body.contactName.trim(),
    contactEmail: body.contactEmail.trim(),
    contactPhone: body.contactPhone?.trim() ?? "",
    billingAddress: body.billingAddress?.trim() ?? "",
    currency: plan.currency,
    unitPrice: plan.unitPrice,
    qty,
    discount,
    taxRate,
    subtotal: price.subtotal,
    taxAmount: price.taxAmount,
    total: price.total,
    agreedToTerms: false,
    signedAt: null,
  });

  return NextResponse.json({ quote: record.quote }, { status: 201 });
}
