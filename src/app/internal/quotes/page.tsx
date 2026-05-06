import Link from "next/link";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { listQuotesForAdmin } from "@/lib/quotes";
import { formatSingaporeDateTime } from "@/lib/datetime";
import { CopySignLinkButton } from "./copy-sign-link-button";
import { RecordPaymentButton } from "./record-payment-button";
import { ReissueInvoiceButton } from "./reissue-invoice-button";
import { ResendButton } from "./resend-button";
import { SendInvoiceButton } from "./send-invoice-button";
import { VoidInvoiceButton } from "./void-invoice-button";

function formatTtl(expiresAt: string | null): string {
  if (!expiresAt) return "No expiry";
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const totalMinutes = Math.floor(absMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    days === 0 && hours === 0 ? `${minutes}m` : null,
  ].filter(Boolean) as string[];
  const text = parts.join(" ");
  return diffMs >= 0 ? `${text} left` : `expired ${text} ago`;
}

function zohoInvoiceStatusLabel(status: "none" | "draft" | "sent" | "paid" | "void"): string {
  if (status === "draft") return "Invoice draft";
  if (status === "sent") return "Invoice sent";
  if (status === "paid") return "Paid";
  if (status === "void") return "Invoice voided";
  return "No invoice";
}

function zohoInvoiceStatusClass(status: "none" | "draft" | "sent" | "paid" | "void"): string {
  if (status === "draft") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }
  if (status === "sent") {
    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  }
  if (status === "paid") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }
  if (status === "void") {
    return "bg-rose-50 text-rose-800 ring-1 ring-rose-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export const metadata = {
  title: "Quotations | HealthOptix",
  robots: { index: false, follow: false },
};

export default async function InternalQuotesPage() {
  if (!isInternalAuthConfigured() || !(await hasInternalAccessOrCookie())) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 px-4 py-10 text-[#303030] sm:px-8">
        <div className="mx-auto max-w-lg">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Unauthorized. Valid internal credentials are required.
          </p>
          <p className="mt-4 text-center">
            <Link className="text-sm text-[#003F73] underline" href="/internal/login">
              Go to internal login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  let rows: Awaited<ReturnType<typeof listQuotesForAdmin>> = [];
  let configError: string | null = null;
  try {
    rows = await listQuotesForAdmin();
  } catch {
    configError =
      "Could not load quotations. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 px-4 py-10 text-[#303030] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#003F73]">
            Quotations
          </h1>
          <p className="mt-2 max-w-prose text-sm text-[#303030]/80">
            Internal list of quotations stored in Supabase. Copy the customer signing link to
            share for e-signature.
          </p>
        </header>

        {configError ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {configError}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-[#003F73]">
                  <th className="px-3 py-3">Quote no</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Invoice</th>
                  <th className="px-3 py-3">Paid</th>
                  <th className="px-3 py-3">Balance</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Signed</th>
                  <th className="px-3 py-3">Expires</th>
                  <th className="px-3 py-3">TTL</th>
                  <th className="px-3 py-3">Quote actions</th>
                  <th className="px-3 py-3">Invoice actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const linkExpired =
                    r.status === "expired" ||
                    (r.signingTokenExpiresAt
                      ? new Date(r.signingTokenExpiresAt) < new Date()
                      : false);
                  return (
                  <tr key={r.id} className="align-top hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-mono text-xs">
                      <Link href={`/internal/quotes/${r.id}`} className="underline">
                        {r.quoteNo}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{r.companyName}</td>
                    <td className="max-w-[14rem] truncate px-3 py-3 text-xs">{r.contactEmail}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {r.currency} {r.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#003F73]">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${zohoInvoiceStatusClass(r.zohoInvoiceStatus)}`}
                        >
                          {zohoInvoiceStatusLabel(r.zohoInvoiceStatus)}
                        </span>
                        {r.zohoInvoiceNumber ? (
                          <p className="text-[11px] text-[#303030]/70">{r.zohoInvoiceNumber}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs tabular-nums text-[#303030]/85">
                      {r.zohoInvoicePaidAmount === null ? "—" : `${r.currency} ${r.zohoInvoicePaidAmount.toFixed(2)}`}
                    </td>
                    <td className="px-3 py-3 text-xs tabular-nums text-[#303030]/85">
                      {r.zohoInvoiceBalanceDue === null ? "—" : `${r.currency} ${r.zohoInvoiceBalanceDue.toFixed(2)}`}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#303030]/85">
                      {formatSingaporeDateTime(r.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#303030]/85">
                      {r.signedAt ? formatSingaporeDateTime(r.signedAt) : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#303030]/85">
                      {r.signingTokenExpiresAt
                        ? formatSingaporeDateTime(r.signingTokenExpiresAt)
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#303030]/85">
                      {formatTtl(r.signingTokenExpiresAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-[10.5rem] space-y-2">
                        <Link
                          href={`/internal/quotes/${r.id}`}
                          className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-[#003F73]/20 bg-white px-3 py-2 text-xs font-semibold text-[#003F73] shadow-sm transition-colors hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <CopySignLinkButton
                          signingToken={r.signingToken}
                          disabled={linkExpired}
                          disabledReason="Signing link expired. Please resend first."
                        />
                        <ResendButton quoteId={r.id} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-[10.5rem] space-y-2">
                        <SendInvoiceButton
                          quoteId={r.id}
                          invoiceUrl={r.zohoInvoiceUrl}
                          disabled={r.zohoInvoiceStatus === "void"}
                          disabledReason="This Zoho invoice has been voided and cannot be sent again."
                        />
                        {r.zohoInvoiceStatus === "void" ? (
                          <ReissueInvoiceButton quoteId={r.id} />
                        ) : null}
                        <RecordPaymentButton
                          quoteId={r.id}
                          currency={r.currency}
                          maxAmount={r.zohoInvoiceBalanceDue ?? r.total}
                          disabled={
                            r.zohoInvoiceStatus === "void" ||
                            r.zohoInvoiceStatus === "none" ||
                            r.zohoInvoiceStatus === "draft"
                          }
                          disabledReason={
                            r.zohoInvoiceStatus === "none"
                              ? "Create and send a Zoho invoice before recording payment."
                              : r.zohoInvoiceStatus === "draft"
                                ? "Preview created a Zoho invoice draft. Send it before recording payment."
                                : "This Zoho invoice has been voided."
                          }
                        />
                        <VoidInvoiceButton
                          quoteId={r.id}
                          disabled={r.zohoInvoiceStatus === "none"}
                          disabledReason="Create a Zoho invoice before attempting to void it."
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#303030]/70">No quotations yet.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
