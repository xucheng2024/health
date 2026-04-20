import type { QuoteRecord } from "@/lib/types";
import { getPlanById } from "@/data/plans";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

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

  const customerHtml = `
    <h2>Your quotation has been signed</h2>
    <p>Dear ${record.quote.contactName},</p>
    <p>Thank you. Your quotation has been signed successfully.</p>
    <ul>
      <li>Quotation No: ${record.quote.quoteNo}</li>
      <li>Plan: ${plan?.name ?? record.quote.planId}</li>
      <li>Total: ${total}</li>
      <li>Signed At: ${signedAt}</li>
    </ul>
  `;

  const internalHtml = `
    <h2>New signed quotation</h2>
    <ul>
      <li>Company: ${record.quote.companyName}</li>
      <li>Contact: ${record.quote.contactName}</li>
      <li>Email: ${record.quote.contactEmail}</li>
      <li>Plan: ${plan?.name ?? record.quote.planId}</li>
      <li>Total: ${total}</li>
      <li>Signed At: ${signedAt}</li>
      <li>Quote ID: ${record.quote.id}</li>
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
