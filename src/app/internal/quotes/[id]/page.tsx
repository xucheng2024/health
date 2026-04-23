import Link from "next/link";
import { notFound } from "next/navigation";
import { CopySignLinkButton } from "@/app/internal/quotes/copy-sign-link-button";
import { ResendButton } from "@/app/internal/quotes/resend-button";
import { hasInternalAccessOrCookie, isInternalAuthConfigured } from "@/lib/internal-auth";
import { getQuoteRecordForAdmin } from "@/lib/quotes";

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
                <dd>{new Date(q.createdAt).toLocaleString("en-SG")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Sent</dt>
                <dd>{q.sentAt ? new Date(q.sentAt).toLocaleString("en-SG") : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Viewed</dt>
                <dd>{q.viewedAt ? new Date(q.viewedAt).toLocaleString("en-SG") : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Signed</dt>
                <dd>{q.signedAt ? new Date(q.signedAt).toLocaleString("en-SG") : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#303030]/70">Link expiry</dt>
                <dd>
                  {q.signingTokenExpiresAt
                    ? new Date(q.signingTokenExpiresAt).toLocaleString("en-SG")
                    : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#003F73]">Actions</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CopySignLinkButton signingToken={q.signingToken} />
              <ResendButton quoteId={q.id} />
            </div>
            <p className="mt-3 text-xs text-[#303030]/70">
              Resend will generate a new signing token and invalidate the previous link.
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
      </div>
    </div>
  );
}
