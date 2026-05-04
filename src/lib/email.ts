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
  const expiryOneLine = expiresAt
    ? `This link expires <strong>${escapeHtml(formatSingaporeDateTime(expiresAt))}</strong> (Singapore time).`
    : `This link is <strong>time-limited</strong> for security.`;

  const ctaHref = escapeHtml(viewUrl);
  const mailInfo = escapeHtml(SUPPORT_INFO_EMAIL);
  const planLabel = escapeHtml(plan?.name ?? record.quote.planId);

  const customerHtml = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background-color:#eef2f6">
  <tr>
    <td align="center" style="padding:28px 14px 36px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;border-collapse:separate;border-spacing:0;background-color:#ffffff;border:1px solid #dbe4ee;border-radius:14px;overflow:hidden">
        <tr>
          <td style="padding:22px 24px;background-color:#003F73">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;line-height:1.2">HealthOptix</p>
            <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.45;color:#ffffff;opacity:0.92">Quotation — ready for your signature</p>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 24px 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
            <p style="margin:0;font-size:16px;line-height:1.45;color:#0f172a;font-weight:600">Dear ${escapeHtml(record.quote.contactName)},</p>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#475569">Your quotation is ready. Use the button below to open the secure signing page.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:18px 24px 8px">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
              <tr>
                <td align="center" bgcolor="#003F73" style="border-radius:10px;background-color:#003F73">
                  <a href="${ctaHref}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;line-height:1.2">Open signing link</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
              <tr>
                <td style="padding:16px 18px">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#003F73;text-transform:uppercase;letter-spacing:0.08em">Summary</p>
                  <p style="margin:0;font-size:14px;line-height:1.55;color:#334155">
                    <strong style="color:#0f172a">${escapeHtml(record.quote.quoteNo)}</strong>
                    <span style="color:#cbd5e1">&nbsp;·&nbsp;</span>${planLabel}<span style="color:#cbd5e1">&nbsp;·&nbsp;</span><strong style="color:#0f172a">${escapeHtml(total)}</strong>
                  </p>
                  <p style="margin:14px 0 0;padding-top:14px;border-top:1px solid #e2e8f0;font-size:13px;line-height:1.55;color:#64748b">${expiryOneLine}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
            <p style="margin:0;font-size:12px;line-height:1.55;color:#94a3b8">If the button does not work, open this link in your browser:</p>
            <p style="margin:6px 0 0;font-size:12px;line-height:1.45;word-break:break-all"><a href="${ctaHref}" target="_blank" rel="noopener noreferrer" style="color:#003F73;text-decoration:underline">${ctaHref}</a></p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 20px;background-color:#f1f5f9;border-top:1px solid #e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">
              Sent from a <strong style="color:#475569">no-reply</strong> address; replies are not monitored.
              For questions, changes before signing, or an expired link:
              <a href="mailto:${mailInfo}" style="color:#003F73;font-weight:600;text-decoration:none">${mailInfo}</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:14px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.4;color:#94a3b8;text-align:center">HealthOptix Pte. Ltd.</p>
    </td>
  </tr>
</table>
  `;

  await sendViaResend({
    to: record.quote.contactEmail,
    subject: "HealthOptix — Your quotation signing link",
    html: customerHtml,
    from: quotationSigningLinkFrom(),
  });
}
