export type PriceInput = {
  unitPrice: number;
  qty: number;
  discount: number;
  taxRate: number;
};

export type PriceBreakdown = {
  subtotal: number;
  taxAmount: number;
  total: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const normalizedQty = Number.isFinite(input.qty) ? Math.max(1, input.qty) : 1;
  const normalizedUnit = Number.isFinite(input.unitPrice)
    ? Math.max(0, input.unitPrice)
    : 0;
  const normalizedDiscount = Number.isFinite(input.discount)
    ? Math.max(0, input.discount)
    : 0;
  const normalizedTaxRate = Number.isFinite(input.taxRate)
    ? Math.max(0, input.taxRate)
    : 0;

  const beforeDiscount = normalizedUnit * normalizedQty;
  const subtotal = round2(Math.max(0, beforeDiscount - normalizedDiscount));
  const taxAmount = round2((subtotal * normalizedTaxRate) / 100);
  const total = round2(subtotal + taxAmount);

  return { subtotal, taxAmount, total };
}
