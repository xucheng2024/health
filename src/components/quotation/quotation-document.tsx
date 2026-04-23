import { QuotationStandardClauses } from "./quotation-standard-clauses";
import { SectionTitle } from "./quotation-doc-primitives";

const readout =
  "flex min-h-11 min-w-0 flex-1 items-center justify-end border-b-2 border-slate-700/55 bg-slate-50/30 px-1 py-2 text-base tabular-nums text-[#303030] sm:min-h-0 sm:justify-start sm:text-left sm:text-[15px]";

function ReadonlyField({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200/90 py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] sm:items-end sm:gap-5 sm:py-3 print:border-slate-300">
      <div className="text-[13px] font-medium leading-snug text-[#003F73] sm:text-sm">
        {label}
      </div>
      <div className="mt-2 min-w-0 text-[15px] text-[#303030] sm:mt-0 sm:pt-0.5">
        {value}
      </div>
    </div>
  );
}

function formatMoney(currency: string, value: number): string {
  return `${currency} ${value.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ANNUAL_SUBSCRIPTION_FEE = 999;

export type QuotationReadonlyPlan = {
  id: string;
  name: string;
  description: string;
  features: string[];
};

export type QuotationReadonlyQuote = {
  quoteNo: string;
  status: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  unitPrice: number;
  qty: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  signingTokenExpiresAt?: string | null;
};

export type QuotationReadonlyProps = {
  quote: QuotationReadonlyQuote;
  plan: QuotationReadonlyPlan;
  statusLabel: string;
  planTermsSummary?: string[];
  legalTermsText?: string;
};

export function QuotationReadonlyDocument({
  quote,
  plan,
  statusLabel,
  planTermsSummary,
  legalTermsText,
}: QuotationReadonlyProps) {
  void legalTermsText;
  const lineAmount = quote.unitPrice * quote.qty;
  const showTax = quote.taxRate > 0 || quote.taxAmount > 0;

  return (
    <div className="quotation-doc min-h-[100dvh] min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 pb-[max(4rem,calc(env(safe-area-inset-bottom)+3rem))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#303030] sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-[52rem] px-3 sm:px-6">
        <article className="quotation-doc__sheet rounded-2xl border border-slate-200/90 bg-white px-4 py-8 shadow-[0_4px_44px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.035] sm:px-10 sm:py-12">
          <header className="border-b border-slate-200/90 pb-8 text-center">
            <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-[#003F73] sm:text-[1.85rem]">
              QUOTATION / 报价单
            </h1>
            <p className="mt-3 text-[15px] font-medium text-[#303030]/85">
              HealthOptix System
            </p>
            <p className="mt-4 inline-flex rounded-full border border-slate-200/90 bg-slate-50 px-3 py-1 text-xs font-medium text-[#003F73]">
              {statusLabel}
            </p>
          </header>

          <section className="mt-8 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/95 to-white p-4 shadow-sm sm:mt-10 sm:p-7">
            <div className="space-y-1.5 text-[15px] leading-relaxed sm:space-y-1">
              <p>
                <span className="font-semibold text-[#003F73]">Company:</span>{" "}
                HealthOptix Pte. Ltd.
              </p>
              <p className="break-words">
                <span className="font-semibold text-[#003F73]">Address:</span> 35
                Selegie Road, #03-24 Parklane Shopping Mall, Singapore 188307
              </p>
              <p>
                <span className="font-semibold text-[#003F73]">Contact:</span>{" "}
                <a
                  href="mailto:info@health-optix.com"
                  className="break-all text-[#003F73] underline"
                >
                  info@health-optix.com
                </a>
              </p>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <ReadonlyField label="Bill To / 客户名称" value={quote.companyName} />
              <ReadonlyField label="Quotation No. / 报价编号" value={quote.quoteNo} />
              <ReadonlyField
                label="Date / 日期"
                value={new Date(quote.createdAt).toLocaleDateString("en-SG")}
              />
              <ReadonlyField
                label="Valid Until / 有效期至"
                value={
                  quote.signingTokenExpiresAt
                    ? new Date(quote.signingTokenExpiresAt).toLocaleDateString("en-SG", {
                        timeZone: "Asia/Singapore",
                      })
                    : "—"
                }
              />
              <ReadonlyField label="Contact name / 联系人" value={quote.contactName} />
              <ReadonlyField label="Email / 邮箱" value={quote.contactEmail} />
              <ReadonlyField label="Phone / 电话" value={quote.contactPhone || "—"} />
            </div>
          </section>

          <SectionTitle>PLAN &amp; PRICING / 方案与价格</SectionTitle>
          <div className="mt-5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-lg font-semibold text-[#003F73]">{plan.name}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#303030]/90">
              {plan.description}
            </p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[14px] text-[#303030] marker:text-[#003F73]">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {planTermsSummary?.length ? (
              <div className="mt-5 rounded-lg border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-[#003F73]">
                  Terms summary / 条款摘要
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] text-[#303030] marker:text-[#003F73]">
                  {planTermsSummary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-6 grid gap-3 border-t border-slate-200 pt-4 text-[15px] sm:grid-cols-2">
              <div>
                <span className="text-[#303030]/70">Qty / 数量</span>
                <p className="mt-1 font-semibold tabular-nums">{quote.qty}</p>
              </div>
              <div>
                <span className="text-[#303030]/70">Unit price / 单价</span>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatMoney(quote.currency, quote.unitPrice)}
                </p>
              </div>
              <div>
                <span className="text-[#303030]/70">Line amount / 行金额</span>
                <p className="mt-1 font-semibold tabular-nums text-[#003F73]">
                  {formatMoney(quote.currency, lineAmount)}
                </p>
              </div>
            </div>
          </div>

          <SectionTitle>SUMMARY / 总计</SectionTitle>
          <div className="mt-5 rounded-xl border border-slate-200/85 bg-gradient-to-b from-slate-50/90 to-white p-5 shadow-sm sm:p-6">
            <div className="max-w-lg space-y-3.5 text-[15px]">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-2 border-b border-slate-200/90 pb-2.5">
                <span className="min-w-[10rem] shrink-0 text-[#303030]">
                  Subtotal / 小计
                </span>
                <div className="flex min-w-0 flex-1 items-end gap-2">
                  <span className="shrink-0 pb-0.5 text-sm font-medium text-[#303030]/75">
                    {quote.currency}
                  </span>
                  <span className={readout}>{formatMoney(quote.currency, quote.subtotal)}</span>
                </div>
              </div>
              {showTax ? (
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2 border-b border-slate-200/90 pb-2.5">
                  <span className="min-w-[10rem] shrink-0 text-[#303030]">
                    Tax ({quote.taxRate}%) / 税
                  </span>
                  <div className="flex min-w-0 flex-1 items-end gap-2">
                    <span className="shrink-0 pb-0.5 text-sm font-medium text-[#303030]/75">
                      {quote.currency}
                    </span>
                    <span className={readout}>{formatMoney(quote.currency, quote.taxAmount)}</span>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap items-end gap-x-3 gap-y-2 pb-0.5">
                <span className="min-w-[10rem] shrink-0 font-semibold text-[#003F73]">
                  Total / 总计
                </span>
                <div className="flex min-w-0 flex-1 items-end gap-2">
                  <span className="shrink-0 pb-0.5 text-sm font-semibold text-[#003F73]/80">
                    {quote.currency}
                  </span>
                  <span
                    className={`${readout} border-[#003F73]/55 font-semibold text-[#003F73]`}
                  >
                    {formatMoney(quote.currency, quote.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <SectionTitle>SUBSCRIPTION (IF APPLICABLE) / 系统订阅费用（如适用）</SectionTitle>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-[15px] leading-relaxed marker:text-[#003F73]">
            <li>Cloud hosting &amp; system access — 云端托管与系统使用</li>
            <li>
              <p>Annual subscription fee — 每年系统订阅费</p>
              <div className="mt-2 flex max-w-md flex-wrap items-end gap-2 rounded-md border border-slate-200/80 bg-slate-50/50 px-3 py-2">
                <span className="shrink-0 pb-0.5 text-sm font-medium text-[#303030]/75">
                  {quote.currency}
                </span>
                <span className="block min-w-[6rem] flex-1 py-0.5 text-right text-[15px] font-semibold tabular-nums text-[#003F73]">
                  {formatMoney(quote.currency, ANNUAL_SUBSCRIPTION_FEE)}
                </span>
                <span className="shrink-0 pb-0.5 text-sm text-[#303030]/75">/ year</span>
              </div>
            </li>
          </ul>

          <QuotationStandardClauses />

          <p className="mt-10 border-t border-slate-200/80 pt-6 text-center text-[11px] text-[#303030]/65">
            Online quotation — template aligned with HealthOptix standard (April 2026).
          </p>
        </article>
      </div>
    </div>
  );
}

export type QuotationDocumentProps =
  | ({ mode: "readonly" } & QuotationReadonlyProps)
  | { mode: "edit"; children: React.ReactNode };

export function QuotationDocument(props: QuotationDocumentProps) {
  if (props.mode === "edit") {
    return <>{props.children}</>;
  }
  return (
    <QuotationReadonlyDocument
      quote={props.quote}
      plan={props.plan}
      statusLabel={props.statusLabel}
      planTermsSummary={props.planTermsSummary}
      legalTermsText={props.legalTermsText}
    />
  );
}
