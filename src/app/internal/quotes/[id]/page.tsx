import Link from "next/link";
import { notFound } from "next/navigation";
import { CopySignLinkButton } from "@/app/internal/quotes/copy-sign-link-button";
import { ResendButton } from "@/app/internal/quotes/resend-button";
import { SendInvoiceButton } from "@/app/internal/quotes/send-invoice-button";
import { VoidInvoiceButton } from "@/app/internal/quotes/void-invoice-button";
import { QuotationDocument } from "@/components/quotation/quotation-document";
import { getPlanById } from "@/data/plans";
import { formatSingaporeDateTime } from "@/lib/datetime";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { getQuoteRecordForAdmin, getQuoteSnapshotByQuoteId } from "@/lib/quotes";
import type { ZohoInvoiceStatus } from "@/lib/types";

function zohoInvoiceStatusLabel(status: ZohoInvoiceStatus): string {
  if (status === "sent") return "Invoice sent";
  if (status === "void") return "Invoice voided";
  return "No invoice";
}

function zohoInvoiceStatusClass(status: ZohoInvoiceStatus): string {
  if (status === "sent") {
    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  }
  if (status === "void") {
    return "bg-rose-50 text-rose-800 ring-1 ring-rose-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export const metadata = {
  title: "Quotation Detail | HealthOptix",
  robots: { index: false, follow: false },
};

export default async function InternalQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const record = await getQuoteRecordForAdmin(id);
  if (!record) return notFound();

  const q = record.quote;
  const snapshot = q.status === "signed" ? await getQuoteSnapshotByQuoteId(q.id) : null;
  const plan = getPlanById(q.planId);
  const effectivePlan = snapshot
    ? {
        id: snapshot.planId,
        name: snapshot.planName,
        description: snapshot.planDescription,
        features: snapshot.planFeatures,
      }
    : {
        id: q.planId,
        name: plan?.name ?? q.planId,
        description: plan?.description ?? "",
        features: plan?.features ?? [],
      };
  const statusLabel =
    q.status === "draft"
      ? "Draft / 草稿"
      : q.status === "sent"
        ? "Sent — awaiting signature / 已发送，待签署"
        : q.status === "signed"
          ? "Signed / 已签署"
          : q.status === "expired"
            ? "Expired / 已过期"
            : "Cancelled / 已取消";
  const linkExpired =
    q.status === "expired" ||
    (q.signingTokenExpiresAt ? new Date(q.signingTokenExpiresAt) < new Date() : false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 px-4 py-10 text-[#303030] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 border-b border-slate-200 pb-5">
          <p className="text-xs text-[#303030]/70">
            <Link href="/internal/quotes" className="underline">
              Quotations
            </Link>
            {" / "}
            {q.quoteNo}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#003F73]">
            {q.quoteNo}
          </h1>
          <p className="mt-1 text-sm text-[#303030]/80">
            {q.companyName} · {q.contactName} ({q.contactEmail})
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#003F73]">Status</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Current status</dt>
                <dd className="font-medium">{q.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Created</dt>
                <dd>{formatSingaporeDateTime(q.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Sent</dt>
                <dd>{q.sentAt ? formatSingaporeDateTime(q.sentAt) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Viewed</dt>
                <dd>{q.viewedAt ? formatSingaporeDateTime(q.viewedAt) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Signed</dt>
                <dd>{q.signedAt ? formatSingaporeDateTime(q.signedAt) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Contract valid until</dt>
                <dd>
                  {q.quoteValidUntil ? formatSingaporeDateTime(q.quoteValidUntil) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Link expiry</dt>
                <dd>
                  {q.signingTokenExpiresAt
                    ? formatSingaporeDateTime(q.signingTokenExpiresAt)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Zoho invoice</dt>
                <dd className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${zohoInvoiceStatusClass(q.zohoInvoiceStatus)}`}
                  >
                    {zohoInvoiceStatusLabel(q.zohoInvoiceStatus)}
                  </span>
                  {q.zohoInvoiceNumber ? (
                    <p className="mt-1 text-xs text-[#303030]/70">{q.zohoInvoiceNumber}</p>
                  ) : null}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#003F73]">Actions</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <CopySignLinkButton
                signingToken={q.signingToken}
                disabled={linkExpired}
                disabledReason="Signing link expired. Please resend first."
              />
              <ResendButton quoteId={q.id} />
              <div className="sm:max-w-[13rem]">
                <SendInvoiceButton
                  quoteId={q.id}
                  disabled={q.zohoInvoiceStatus === "void"}
                  disabledReason="This Zoho invoice has been voided and cannot be sent again."
                />
              </div>
              <div className="sm:max-w-[13rem]">
                <VoidInvoiceButton quoteId={q.id} />
              </div>
            </div>
            <p className="mt-3 text-xs text-[#303030]/70">
              Resend will generate a new signing token. Send invoice creates or re-sends the
              linked Zoho invoice. Void invoice will void the current Zoho invoice for this quote.
            </p>
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#003F73]">Quote</h2>
          <dl className="mt-3 grid gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-8">
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-[#303030]/70">Plan</dt>
              <dd className="font-medium">{q.planId}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-[#303030]/70">Total</dt>
              <dd className="font-medium">
                {q.currency} {q.total.toFixed(2)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[#303030]/70">Billing address</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">{q.billingAddress || "—"}</dd>
            </div>
          </dl>
        </section>

        {record.signature ? (
          <section className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#003F73]">
              Signature
            </h2>
            <dl className="mt-3 grid gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-8">
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-[#303030]/70">Signer</dt>
                <dd className="font-medium">{record.signature.signerName}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-[#303030]/70">Signed at</dt>
                <dd className="font-medium">
                  {formatSingaporeDateTime(q.signedAt ?? record.signature.createdAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.signature.signatureData}
                alt="Signature"
                className="max-h-36 w-auto object-contain"
              />
            </div>
          </section>
        ) : null}

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#003F73]">
              Contract View
            </h2>
            <p className="mt-1 text-xs text-[#303030]/70">
              Read-only quotation content at current/signed state.
            </p>
          </div>
          <div className="max-h-[75vh] overflow-auto">
            <QuotationDocument
              mode="readonly"
              quote={{
                quoteNo: q.quoteNo,
                status: q.status,
                companyName: q.companyName,
                companyUen: q.companyUen,
                contactName: q.contactName,
                contactEmail: q.contactEmail,
                contactPhone: q.contactPhone,
                currency: q.currency,
                unitPrice: q.unitPrice,
                qty: q.qty,
                taxRate: q.taxRate,
                subtotal: q.subtotal,
                taxAmount: q.taxAmount,
                total: q.total,
                createdAt: q.createdAt,
                quoteValidUntil: q.quoteValidUntil,
              }}
              plan={effectivePlan}
              statusLabel={statusLabel}
              planTermsSummary={snapshot?.planTermsSummary}
              legalTermsText={snapshot?.legalTermsText}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
