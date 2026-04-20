import type { Viewport } from "next";

/** Safe-area + notch friendly when viewing quotation on phones. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function QuotationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
