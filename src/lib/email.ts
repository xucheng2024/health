import type { QuoteRecord } from "@/lib/types";
import { getPlanById } from "@/data/plans";
import { signingPageUrl } from "@/lib/site-url";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    console.log("[email:fallback]", payload.subject, payload.to);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} ${errorText}`);
  }
}

export async function sendQuoteSignedEmails(record: QuoteRecord): Promise<void> {
  const plan = getPlanById(record.quote.planId);
  const signedAt = record.quote.signedAt ?? record.quote.updatedAt;
  const total = `${record.quote.currency} ${record.quote.total.toFixed(2)}`;
  const signerName =
    record.signature?.signerName ?? record.quote.contactName;
  const viewUrl = signingPageUrl(record.quote.signingToken);

  const customerHtml = `
    <h2>Your quotation has been signed</h2>
    <p>Dear ${escapeHtml(record.quote.contactName)},</p>
    <p>Thank you. Your quotation has been signed successfully.</p>
    <ul>
      <li>Quotation No: ${escapeHtml(record.quote.quoteNo)}</li>
      <li>Plan: ${escapeHtml(plan?.name ?? record.quote.planId)}</li>
      <li>Total: ${escapeHtml(total)}</li>
      <li>Signer: ${escapeHtml(signerName)}</li>
      <li>Signed At: ${escapeHtml(signedAt)}</li>
    </ul>
    <p><a href="${escapeHtml(viewUrl)}">View signed quotation</a></p>
    <p>Download the signed PDF directly on the signed quotation page.</p>
  `;

  const internalHtml = `
    <h2>New signed quotation</h2>
    <ul>
      <li>Company: ${escapeHtml(record.quote.companyName)}</li>
      <li>Contact: ${escapeHtml(record.quote.contactName)}</li>
      <li>Email: ${escapeHtml(record.quote.contactEmail)}</li>
      <li>Plan: ${escapeHtml(plan?.name ?? record.quote.planId)}</li>
      <li>Quotation No: ${escapeHtml(record.quote.quoteNo)}</li>
      <li>Total: ${escapeHtml(total)}</li>
      <li>Signer: ${escapeHtml(signerName)}</li>
      <li>Signed At: ${escapeHtml(signedAt)}</li>
      <li>Quote ID: ${escapeHtml(record.quote.id)}</li>
      <li>Signing page: <a href="${escapeHtml(viewUrl)}">${escapeHtml(viewUrl)}</a></li>
      <li>Signed PDF: available from the signing page after opening the link above.</li>
    </ul>
  `;

  await sendViaResend({
    to: record.quote.contactEmail,
    subject: "Your quotation has been signed",
    html: customerHtml,
  });

  const internalEmail = process.env.INTERNAL_SALES_EMAIL;
  if (internalEmail) {
    await sendViaResend({
      to: internalEmail,
      subject: "New signed quotation",
      html: internalHtml,
    });
  } else {
    console.log("[email:fallback] missing INTERNAL_SALES_EMAIL");
  }
}
