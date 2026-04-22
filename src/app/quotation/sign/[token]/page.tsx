import type { Metadata } from "next";
import { QuotationSignClient } from "../quotation-sign-client";

export const metadata: Metadata = {
  title: "Sign quotation | HealthOptix",
  robots: { index: false, follow: false },
};

export default async function QuotationSignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <QuotationSignClient token={decodeURIComponent(token)} />;
}
