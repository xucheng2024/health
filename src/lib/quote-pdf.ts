import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { QuoteSigningSnapshot } from "@/lib/quote-snapshots";
import { renderLegalTermsParagraphs } from "@/lib/quotation-legal-terms";
import type { QuoteRecord } from "@/lib/types";

type PlanLike = {
  name: string;
  description: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 40;
const PAGE_TOP = 800;
const PAGE_BOTTOM = 52;
const TITLE_COLOR = rgb(0.0, 0.25, 0.45);
const BODY_COLOR = rgb(0.1, 0.14, 0.2);
const MUTED_COLOR = rgb(0.34, 0.39, 0.46);
const FOOTER_COLOR = rgb(0.4, 0.44, 0.5);
const ANNUAL_SUBSCRIPTION_FEE = 999;

function formatMoney(currency: string, value: number): string {
  return `${currency} ${value.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  const m = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!m) return null;
  return Uint8Array.from(Buffer.from(m[1], "base64"));
}

async function loadCjkFontBytes(): Promise<Uint8Array | null> {
  const fontFiles = [
    "k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FrY9HbczS.woff2",
    "k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FrYRHbczS.woff2",
    "k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYkldv7JjxkkgFsFSSOPMOkySAZ73y9ViAt3acb8NexQ2w.117.woff2",
  ];

  for (const file of fontFiles) {
    try {
      return await readFile(
        join(process.cwd(), "node_modules", "noto-sans-sc", "noto_sans_sc_regular", file),
      );
    } catch {
      // continue trying fallback files
    }
  }

  return null;
}

function collectLineItems(record: QuoteRecord, snapshot: QuoteSigningSnapshot | null) {
  return record.lineItems.length
    ? record.lineItems
    : (snapshot?.lineItems ?? []).map((row) => ({
        title: row.title,
        qty: row.qty,
        unitPrice: row.unitPrice,
        amount: row.amount,
        sortOrder: row.sortOrder,
      }));
}

export async function generateSignedQuotePdfBuffer(params: {
  record: QuoteRecord;
  plan: PlanLike;
  snapshot: QuoteSigningSnapshot | null;
}): Promise<Uint8Array> {
  const { record, plan, snapshot } = params;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const cjkFontBytes = await loadCjkFontBytes();
  const fontCjk = cjkFontBytes ? await doc.embedFont(cjkFontBytes) : null;

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_TOP;
  const maxWidth = page.getWidth() - MARGIN_X * 2;

  const pickFont = (text: string, bold = false) => {
    if (/[^\x00-\x7F]/.test(text) && fontCjk) return fontCjk;
    return bold ? fontBold : fontRegular;
  };

  const ensureSpace = (height: number) => {
    if (y - height < PAGE_BOTTOM) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_TOP;
    }
  };

  const writeLine = (
    text: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      gapAfter?: number;
    } = {},
  ) => {
    const size = options.size ?? 10;
    const lineHeight = options.lineHeight ?? size * 1.35;
    ensureSpace(lineHeight + 2);
    page.drawText(text, {
      x: MARGIN_X,
      y,
      size,
      font: pickFont(text, options.bold ?? false),
      color: options.color ?? BODY_COLOR,
    });
    y -= lineHeight + (options.gapAfter ?? 0);
  };

  const writeWrapped = (
    text: string,
    options: {
      size?: number;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      gapAfter?: number;
    } = {},
  ) => {
    const size = options.size ?? 10;
    const lineHeight = options.lineHeight ?? size * 1.35;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      y -= lineHeight;
      return;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const font = pickFont(candidate);
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current) {
        writeLine(current, { size, lineHeight, color: options.color });
      }
      current = word;
    }
    if (current) {
      writeLine(current, { size, lineHeight, color: options.color });
    }
    y -= options.gapAfter ?? 0;
  };

  const sectionTitle = (title: string) => {
    writeLine(title, { size: 12, bold: true, color: TITLE_COLOR, gapAfter: 3 });
  };

  const writeDivider = (gapTop = 4, gapBottom = 8) => {
    y -= gapTop;
    ensureSpace(8);
    page.drawLine({
      start: { x: MARGIN_X, y },
      end: { x: page.getWidth() - MARGIN_X, y },
      color: rgb(0.86, 0.89, 0.93),
      thickness: 1,
    });
    y -= gapBottom;
  };

  const writeKeyValue = (label: string, value: string) => {
    writeLine(`${label}: ${value}`, { size: 10, gapAfter: 1 });
  };

  writeLine("QUOTATION / 报价单", {
    size: 20,
    bold: true,
    color: TITLE_COLOR,
    gapAfter: 2,
  });
  writeLine("HealthOptix System", { size: 11, color: MUTED_COLOR, gapAfter: 4 });
  writeKeyValue("Quotation No", record.quote.quoteNo);
  writeKeyValue("Status", record.quote.status.toUpperCase());
  writeDivider();

  const signerName = record.signature?.signerName ?? record.quote.contactName;
  const signedAt = record.quote.signedAt ?? record.signature?.createdAt ?? "";
  const documentHash = record.signature?.signedDocumentHash ?? "";

  sectionTitle("Parties");
  writeKeyValue("Company", record.quote.companyName);
  writeKeyValue("Contact", record.quote.contactName);
  writeKeyValue("Email", record.quote.contactEmail);
  writeKeyValue("Phone", record.quote.contactPhone || "-");
  writeDivider();

  sectionTitle("PLAN & PRICING / 方案与价格");
  writeKeyValue("Plan ID", record.quote.planId);
  writeKeyValue("Plan Name", plan.name);
  writeWrapped(plan.description || "Custom package from quotation table.", {
    size: 10,
    color: MUTED_COLOR,
  });
  writeDivider();

  sectionTitle("Line Items");
  writeLine("Item | Qty | Unit | Amount", {
    size: 9,
    bold: true,
    color: MUTED_COLOR,
    gapAfter: 3,
  });
  for (const row of collectLineItems(record, snapshot)) {
    writeWrapped(
      `${row.title} | ${row.qty} | ${formatMoney(
        record.quote.currency,
        row.unitPrice,
      )} | ${formatMoney(record.quote.currency, row.amount)}`,
      { size: 10, gapAfter: 3 },
    );
  }
  writeDivider();

  sectionTitle("Financials");
  writeKeyValue("Subtotal", formatMoney(record.quote.currency, record.quote.subtotal));
  if (record.quote.taxRate > 0 || record.quote.taxAmount > 0) {
    writeKeyValue(
      `Tax (${record.quote.taxRate}%)`,
      formatMoney(record.quote.currency, record.quote.taxAmount),
    );
  }
  writeLine(`Total: ${formatMoney(record.quote.currency, record.quote.total)}`, {
    bold: true,
    size: 11,
    color: TITLE_COLOR,
  });
  writeDivider();

  sectionTitle("SUBSCRIPTION (IF APPLICABLE) / 系统订阅费用（如适用）");
  writeWrapped("Annual subscription fee — 每年系统订阅费", { size: 10, color: MUTED_COLOR });
  writeLine(`${formatMoney(record.quote.currency, ANNUAL_SUBSCRIPTION_FEE)} / year`, {
    size: 11,
    bold: true,
    color: TITLE_COLOR,
  });
  writeDivider();

  sectionTitle("Signature");
  writeKeyValue("Signer", signerName);
  writeKeyValue("Signed At", signedAt);
  writeWrapped(`Document Hash (SHA-256): ${documentHash || "-"}`, {
    size: 9,
    color: MUTED_COLOR,
    gapAfter: 6,
  });

  if (record.signature?.signatureData) {
    const bytes = dataUrlToBytes(record.signature.signatureData);
    if (bytes) {
      const png = await doc.embedPng(bytes);
      const maxSigW = 180;
      const ratio = png.height / png.width;
      const sigW = maxSigW;
      const sigH = maxSigW * ratio;
      ensureSpace(sigH + 22);
      page.drawRectangle({
        x: MARGIN_X,
        y: y - sigH - 12,
        width: sigW + 10,
        height: sigH + 10,
        borderColor: rgb(0.8, 0.84, 0.9),
        borderWidth: 1,
      });
      page.drawImage(png, {
        x: MARGIN_X + 5,
        y: y - sigH - 7,
        width: sigW,
        height: sigH,
      });
      y -= sigH + 24;
    }
  }
  writeDivider();

  sectionTitle("Terms Snapshot (full)");
  const legal = renderLegalTermsParagraphs(
    snapshot?.legalTermsText ?? "Terms snapshot not available in this document.",
  );
  for (const paragraph of legal) {
    writeWrapped(paragraph, {
      size: 8.5,
      lineHeight: 11.5,
      gapAfter: 4,
    });
  }

  const generatedAt = `Generated at ${new Date().toISOString()}`;
  for (const p of doc.getPages()) {
    p.drawText(generatedAt, {
      x: MARGIN_X,
      y: 32,
      size: 8,
      font: pickFont(generatedAt),
      color: FOOTER_COLOR,
    });
  }

  return await doc.save();
}
