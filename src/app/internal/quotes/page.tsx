import { hasInternalAccess, isInternalAuthConfigured } from "@/lib/internal-auth";
import { listQuotesForAdmin } from "@/lib/quotes";
import { CopySignLinkButton } from "./copy-sign-link-button";

export const metadata = {
  title: "Quotations | HealthOptix",
  robots: { index: false, follow: false },
};

export default async function InternalQuotesPage() {
  if (!isInternalAuthConfigured() || !(await hasInternalAccess())) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 px-4 py-10 text-[#303030] sm:px-8">
        <div className="mx-auto max-w-lg">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Unauthorized. Valid internal credentials are required.
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
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Signed</th>
                  <th className="px-3 py-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-mono text-xs">{r.quoteNo}</td>
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
                    <td className="px-3 py-3 text-xs text-[#303030]/85">
                      {new Date(r.createdAt).toLocaleString("en-SG")}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#303030]/85">
                      {r.signedAt ? new Date(r.signedAt).toLocaleString("en-SG") : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <CopySignLinkButton signingToken={r.signingToken} />
                    </td>
                  </tr>
                ))}
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
