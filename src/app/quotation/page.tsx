import type { Metadata } from "next";
import { QuotationEditor } from "./quotation-editor";

export const metadata: Metadata = {
  title: "Quotation — HealthOptix System",
  description:
    "Standard quotation template for HealthOptix System — bilingual English / 中文.",
  alternates: { canonical: "/quotation" },
};

export default async function QuotationPage() {
  return <QuotationEditor />;
}
