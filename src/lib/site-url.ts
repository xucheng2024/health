/** Base URL for absolute links (emails, signing URLs). No trailing slash. */
export function getSiteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }
  return "";
}

export function signingPageUrl(signingToken: string): string {
  const base = getSiteBaseUrl();
  const path = `/quotation/sign/${encodeURIComponent(signingToken)}`;
  return base ? `${base}${path}` : path;
}

export function signedPdfUrl(signingToken: string): string {
  const base = getSiteBaseUrl();
  const path = `/api/public/quotes/sign/${encodeURIComponent(signingToken)}/pdf`;
  return base ? `${base}${path}` : path;
}
