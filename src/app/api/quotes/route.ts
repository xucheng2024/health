import { NextResponse } from "next/server";
import { createQuoteRecord } from "@/lib/quotes";
import { calculatePrice } from "@/lib/pricing";
import { signingPageUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type CreateQuoteBody = {
  planId: string;
  packageName?: string;
  validUntil?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  lineItems?: { title: string; qty?: number; unitPrice?: number }[];
  qty?: number;
  discount?: number;
  taxRate?: number;
};

function isEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}

function parseValidUntilToIso(validUntil?: string): string | null {
  const trimmed = validUntil?.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  // Treat date input as end-of-day Singapore time for contract validity.
  const iso = new Date(`${trimmed}T23:59:59+08:00`).toISOString();
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

export async function POST(request: Request) {
  const expectedPassword = process.env.QUOTATION_CREATE_PASSWORD?.trim();
  if (!expectedPassword) {
    return NextResponse.json(
      { error: "Server config missing QUOTATION_CREATE_PASSWORD" },
      { status: 500 },
    );
  }

  const providedPassword = request.headers.get("x-create-password")?.trim();
  if (!providedPassword || providedPassword !== expectedPassword) {
    return NextResponse.json(
      { error: "Invalid create password" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as CreateQuoteBody;

  if (
    !body.planId?.trim() ||
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

  const quoteValidUntil = parseValidUntilToIso(body.validUntil);
  if (body.validUntil && !quoteValidUntil) {
    return NextResponse.json(
      { error: "Invalid validUntil date. Use YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const normalizedLineItems = (body.lineItems ?? []).map((item) => ({
    title: item.title?.trim() || "Package",
    qty: Number.isFinite(item.qty) ? Math.max(0, Math.floor(Number(item.qty))) : 0,
    unitPrice: Number.isFinite(item.unitPrice) ? Math.max(0, Number(item.unitPrice)) : 0,
  }));

  const subtotalFromTable = Number(
    normalizedLineItems
      .reduce((sum, row) => sum + row.qty * row.unitPrice, 0)
      .toFixed(2),
  );

  if (subtotalFromTable <= 0) {
    return NextResponse.json(
      { error: "Please select at least one package quantity" },
      { status: 400 },
    );
  }

  const qty = 1;
  const discount = 0;
  const taxRate = 0;
  const price = calculatePrice({
    unitPrice: subtotalFromTable,
    qty,
    discount,
    taxRate,
  });

  const record = await createQuoteRecord({
    planId: body.planId.trim(),
    status: "draft",
    companyName: body.companyName.trim(),
    contactName: body.contactName.trim(),
    contactEmail: body.contactEmail.trim(),
    contactPhone: body.contactPhone?.trim() ?? "",
    billingAddress: body.billingAddress?.trim() ?? "",
    currency: "SGD",
    unitPrice: subtotalFromTable,
    qty,
    discount,
    taxRate,
    subtotal: price.subtotal,
    taxAmount: price.taxAmount,
    total: price.total,
    quoteValidUntil,
    lineItems: normalizedLineItems.map((row, index) => ({
      title: row.title,
      qty: row.qty,
      unitPrice: row.unitPrice,
      amount: Number((row.qty * row.unitPrice).toFixed(2)),
      sortOrder: index,
    })),
  });

  const { signingToken, ...quoteWithoutToken } = record.quote;
  const signingUrl = signingPageUrl(signingToken);

  return NextResponse.json(
    { quote: quoteWithoutToken, signingUrl },
    { status: 201 },
  );
}
