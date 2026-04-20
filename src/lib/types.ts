export type Plan = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  suitableFor: string;
  currency: string;
  unitPrice: number;
  features: string[];
  exclusions: string[];
  optionalAddons: { name: string; price: number }[];
  termsSummary: string[];
};

export type QuoteStatus = "draft" | "signed";

export type Quote = {
  id: string;
  quoteNo: string;
  planId: string;
  status: QuoteStatus;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  currency: string;
  unitPrice: number;
  qty: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  agreedToTerms: boolean;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Signature = {
  id: string;
  quoteId: string;
  signerName: string;
  signatureData: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
};

export type QuoteRecord = {
  quote: Quote;
  signature: Signature | null;
};
