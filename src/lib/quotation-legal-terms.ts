export function renderLegalTermsParagraphs(termsText: string): string[] {
  return termsText
    .split(/\n\s*\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

