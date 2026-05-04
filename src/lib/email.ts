import { customerUenIsProvided } from "@/lib/customer-uen";
import type { QuoteRecord } from "@/lib/types";
import { getPlanById } from "@/data/plans";
import { signingPageUrl } from "@/lib/site-url";
import { formatSingaporeDateTime } from "@/lib/datetime";

const SUPPORT_INFO_EMAIL = "info@health-optix.com";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  /** When set, overrides FROM_EMAIL for this message only (e.g. noreply). */
  from?: string;
};

/** Signing-link emails: `NOREPLY_FROM_EMAIL` (e.g. noreply@yourdomain.com), else `FROM_EMAIL`. */
function quotationSigningLinkFrom(): string | undefined {
  return process.env.NOREPLY_FROM_EMAIL?.trim() || process.env.FROM_EMAIL?.trim();
}

export function isQuotationSigningLinkEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && quotationSigningLinkFrom());
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = payload.from?.trim() || process.env.FROM_EMAIL?.trim();
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
  const signedAtDisplay = formatSingaporeDateTime(signedAt);
  const expiresAt = record.quote.signingTokenExpiresAt;
  const total = `${record.quote.currency} ${record.quote.total.toFixed(2)}`;
  const signerName =
    record.signature?.signerName ?? record.quote.contactName;
  const viewUrl = signingPageUrl(record.quote.signingToken);
  const expiryText = expiresAt
    ? `This secure link is valid until ${formatSingaporeDateTime(expiresAt)} (Singapore time).`
    : "This secure link has a limited validity period.";

  const customerHtml = `
    <h2>Your quotation has been signed</h2>
    <p>Dear ${escapeHtml(record.quote.contactName)},</p>
    <p>Thank you. Your quotation has been signed successfully.</p>
    <ul>
      <li>Quotation No: ${escapeHtml(record.quote.quoteNo)}</li>
      <li>Plan: ${escapeHtml(plan?.name ?? record.quote.planId)}</li>
      <li>Total: ${escapeHtml(total)}</li>
      <li>Signer: ${escapeHtml(signerName)}</li>
      <li>Signed At: ${escapeHtml(signedAtDisplay)} (Singapore time)</li>
    </ul>
    <p><a href="${escapeHtml(viewUrl)}">View signed quotation</a></p>
    <p>${escapeHtml(expiryText)}</p>
    <p>Please download and save your PDF copy from the signed quotation page.</p>
    <p>If the link expires, please contact <a href="mailto:${escapeHtml(SUPPORT_INFO_EMAIL)}">${escapeHtml(SUPPORT_INFO_EMAIL)}</a> and we will resend a new link.</p>
  `;

  const uenLine = customerUenIsProvided(record.quote.companyUen)
    ? `<li>UEN: ${escapeHtml(record.quote.companyUen.trim())}</li>`
    : "";
  const internalHtml = `
    <h2>New signed quotation</h2>
    <ul>
      <li>Company: ${escapeHtml(record.quote.companyName)}</li>
      ${uenLine}
      <li>Contact: ${escapeHtml(record.quote.contactName)}</li>
      <li>Email: ${escapeHtml(record.quote.contactEmail)}</li>
      <li>Plan: ${escapeHtml(plan?.name ?? record.quote.planId)}</li>
      <li>Quotation No: ${escapeHtml(record.quote.quoteNo)}</li>
      <li>Total: ${escapeHtml(total)}</li>
      <li>Signer: ${escapeHtml(signerName)}</li>
      <li>Signed At: ${escapeHtml(signedAtDisplay)} (Singapore time)</li>
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

export async function sendQuoteSigningLinkEmail(record: QuoteRecord): Promise<void> {
  const plan = getPlanById(record.quote.planId);
  const expiresAt = record.quote.signingTokenExpiresAt;
  const total = `${record.quote.currency} ${record.quote.total.toFixed(2)}`;
  const viewUrl = signingPageUrl(record.quote.signingToken);
  const expiryDetailHtml = expiresAt
    ? `For your security, this link is only valid until <strong>${escapeHtml(formatSingaporeDateTime(expiresAt))}</strong> (Singapore time). After that moment it will stop working and you will need a new link from us.`
    : `For your security, this link is <strong>time-limited</strong> and will stop working after a short period. If it no longer opens, please request a new link from us.`;

  const signingLinkEmailFooter = `
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 20px" />
    <p style="font-size:13px;line-height:1.55;color:#475569;margin:0">
      This message was sent from a <strong>no-reply</strong> address; replies are not monitored.
      If you have any questions about this quotation, please email
      <a href="mailto:${escapeHtml(SUPPORT_INFO_EMAIL)}">${escapeHtml(SUPPORT_INFO_EMAIL)}</a>.
    </p>
  `;

  const customerHtml = `
    <h2>Your quotation is ready for signature</h2>
    <p>Dear ${escapeHtml(record.quote.contactName)},</p>
    <p>
      Please review the full quotation and complete your electronic signature when you are ready.
      The secure link below opens the official signing page in your browser.
    </p>
    <p style="margin:16px 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;line-height:1.55;color:#1e293b">
      <strong>Important — signing link is time-limited</strong><br />
      ${expiryDetailHtml}
    </p>
    <p>
      You may use any recent desktop or mobile browser. If you need changes to the quotation before signing,
      contact <a href="mailto:${escapeHtml(SUPPORT_INFO_EMAIL)}">${escapeHtml(SUPPORT_INFO_EMAIL)}</a>.
    </p>
    <ul>
      <li>Quotation No: ${escapeHtml(record.quote.quoteNo)}</li>
      <li>Plan: ${escapeHtml(plan?.name ?? record.quote.planId)}</li>
      <li>Total: ${escapeHtml(total)}</li>
    </ul>
    <p><a href="${escapeHtml(viewUrl)}">Open secure signing link</a></p>
    <p>Please complete signing before the expiry time described above.</p>
    <p>After you sign, please download and keep a PDF copy from the signed quotation page for your records.</p>
    <p>If the link has already expired, email <a href="mailto:${escapeHtml(SUPPORT_INFO_EMAIL)}">${escapeHtml(SUPPORT_INFO_EMAIL)}</a> and we will send a new link.</p>
    ${signingLinkEmailFooter}
  `;

  await sendViaResend({
    to: record.quote.contactEmail,
    subject: "Your quotation signing link",
    html: customerHtml,
    from: quotationSigningLinkFrom(),
  });
}
