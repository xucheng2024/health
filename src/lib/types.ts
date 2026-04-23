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

export type QuoteStatus =
  | "draft"
  | "sent"
  | "signed"
  | "expired"
  | "cancelled";

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
  signingToken: string;
  quoteValidUntil: string | null;
  signingTokenExpiresAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Signature = {
  id: string;
  quoteId: string;
  signerName: string;
  signatureData: string;
  /** @deprecated use signerIp — kept for older responses */
  ip?: string;
  /** @deprecated use signerUserAgent */
  userAgent?: string;
  signerIp?: string;
  signerUserAgent?: string;
  signedDocumentHash?: string | null;
  createdAt: string;
};

export type QuoteLineItem = {
  id?: string;
  quoteId?: string;
  title: string;
  qty: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
  createdAt?: string;
};

export type QuoteRecord = {
  quote: Quote;
  signature: Signature | null;
  lineItems: QuoteLineItem[];
};
