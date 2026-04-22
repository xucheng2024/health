import { createHash } from "node:crypto";
import type { Plan, Quote, QuoteLineItem } from "@/lib/types";
import {
  QUOTATION_LEGAL_TERMS_BUNDLE_ID,
  QUOTATION_LEGAL_TERMS_FOR_SNAPSHOT,
} from "@/lib/quotation-legal-terms-source";

export type QuoteSigningSnapshot = {
  bundleVersion: string;
  quoteId: string;
  quoteNo: string;
  planId: string;
  planName: string;
  planDescription: string;
  planFeatures: string[];
  planTermsSummary: string[];
  legalTermsBundleId: string;
  legalTermsText: string;
  customer: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    billingAddress: string;
  };
  monetary: {
    currency: string;
    unitPrice: number;
    qty: number;
    discount: number;
    taxRate: number;
    subtotal: number;
    taxAmount: number;
    total: number;
  };
  lineItems: {
    title: string;
    qty: number;
    unitPrice: number;
    amount: number;
    sortOrder: number;
  }[];
  quoteCreatedAt: string;
  signerName: string;
  signedAt: string;
};

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}

export function hashDocumentSnapshot(snapshot: QuoteSigningSnapshot): string {
  return createHash("sha256").update(stableStringify(snapshot)).digest("hex");
}

export function buildSigningSnapshot(params: {
  quote: Quote;
  plan: Plan;
  lineItems?: QuoteLineItem[];
  signerName: string;
  signedAtIso: string;
}): { snapshot: QuoteSigningSnapshot; documentHash: string } {
  const snapshot: QuoteSigningSnapshot = {
    bundleVersion: "1",
    quoteId: params.quote.id,
    quoteNo: params.quote.quoteNo,
    planId: params.plan.id,
    planName: params.plan.name,
    planDescription: params.plan.description,
    planFeatures: [...params.plan.features],
    planTermsSummary: [...params.plan.termsSummary],
    legalTermsBundleId: QUOTATION_LEGAL_TERMS_BUNDLE_ID,
    legalTermsText: QUOTATION_LEGAL_TERMS_FOR_SNAPSHOT,
    customer: {
      companyName: params.quote.companyName,
      contactName: params.quote.contactName,
      contactEmail: params.quote.contactEmail,
      contactPhone: params.quote.contactPhone,
      billingAddress: params.quote.billingAddress,
    },
    monetary: {
      currency: params.quote.currency,
      unitPrice: params.quote.unitPrice,
      qty: params.quote.qty,
      discount: params.quote.discount,
      taxRate: params.quote.taxRate,
      subtotal: params.quote.subtotal,
      taxAmount: params.quote.taxAmount,
      total: params.quote.total,
    },
    lineItems: (params.lineItems ?? []).map((row) => ({
      title: row.title,
      qty: row.qty,
      unitPrice: row.unitPrice,
      amount: row.amount,
      sortOrder: row.sortOrder,
    })),
    quoteCreatedAt: params.quote.createdAt,
    signerName: params.signerName.trim(),
    signedAt: params.signedAtIso,
  };
  return {
    snapshot,
    documentHash: hashDocumentSnapshot(snapshot),
  };
}
