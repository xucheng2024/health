"use client";

import { useCallback, useMemo, useState } from "react";

const CORE_OPERATIONS_FEATURE_ROWS: readonly { en: string; zh: string }[] = [
  {
    en: "Front office and day-to-day operations",
    zh: "前台与日常运营",
  },
  {
    en: "Bookings and appointments",
    zh: "预约与排期",
  },
  {
    en: "Billing",
    zh: "收费管理",
  },
  {
    en: "Essential reporting",
    zh: "基础报表",
  },
];

type QuoteLine = { qty: number; unitPrice: number };

const LINE_TITLES: readonly string[] = [
  "Core Operations",
  "Advanced Operations",
  "Complete Growth Solution",
  "Full Digital Transformation",
];

function formatSgdInt(n: number): string {
  const x = Math.round(Number.isFinite(n) ? n : 0);
  return x.toLocaleString("en-SG", { maximumFractionDigits: 0 });
}

/** GST / totals may need cents (2 dp). */
function formatSgdMoney(n: number): string {
  const x = Number.isFinite(n) ? n : 0;
  return x.toLocaleString("en-SG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function parseQty(raw: string): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseUnitPrice(raw: string): number {
  const cleaned = String(raw).replace(/,/g, "").trim();
  const n = Math.round(Number(cleaned));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseNonNegativeNumber(raw: string): number {
  const cleaned = String(raw).replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseGstRate(raw: string): number {
  const n = parseNonNegativeNumber(raw);
  return Math.min(n, 100);
}

const QUOTE_LINE_DEFAULTS: readonly number[] = [5200, 8000, 11000, 21000];

const inputLine =
  "w-full min-w-0 rounded-sm border-0 border-b-2 border-slate-700/55 bg-slate-50/50 px-2 py-2.5 text-base text-[#303030] outline-none ring-0 transition-[border-color,background-color] duration-150 placeholder:text-slate-400/80 focus:border-[#003F73] focus:bg-white min-h-11 print:min-h-0 print:border-black print:bg-transparent print:px-0 print:py-0.5 sm:min-h-0 sm:px-1 sm:py-1 sm:text-[15px]";

const tableInput =
  "w-full min-w-0 rounded-sm border-0 border-b-2 border-slate-700/50 bg-slate-50/40 px-2 py-2.5 text-base text-[#303030] outline-none transition-[border-color,background-color] duration-150 focus:border-[#003F73] focus:bg-white min-h-11 print:min-h-0 print:border-black print:bg-transparent sm:min-h-0 sm:px-1.5 sm:py-1.5 sm:text-sm";

/** Qty: native number steppers (hidden in print via globals.css). */
const tableQtyInput = `${tableInput} max-w-[5.5rem] tabular-nums`;

const tableUnitInput = `${tableInput} min-w-[6rem] max-w-[9rem] tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

const tableAmountCell =
  "flex min-h-11 items-center border-b-2 border-slate-700/50 bg-slate-50/20 px-2 py-2 text-base font-semibold tabular-nums text-[#303030] print:min-h-0 print:border-black print:bg-transparent sm:min-h-9 sm:px-1.5 sm:py-1.5 sm:text-sm";

/** Native date picker — calendar UI is provided by the browser (no extra package). */
const dateInputLine = `${inputLine} max-w-full cursor-pointer accent-[#003F73] sm:max-w-xs`;

const summaryReadout =
  "flex min-h-11 min-w-0 flex-1 items-center justify-end border-b-2 border-slate-700/55 bg-slate-50/30 px-1 py-2 text-base tabular-nums text-[#303030] print:min-h-0 print:justify-start print:border-black print:bg-transparent print:px-0 print:py-1 sm:min-h-0 sm:justify-start sm:text-left sm:text-[15px]";

const gstControlInput =
  "h-9 w-22 rounded-md border border-slate-300 bg-white px-2 text-sm tabular-nums text-[#303030] outline-none ring-0 focus:border-[#003F73]";

/** Post-warranty onsite rates: EN + 中文分行，样式一致 */
const postWarrantyRateBlock =
  "space-y-1.5 rounded-lg border border-slate-200/85 bg-slate-50/45 px-3 py-2.5 text-[15px] leading-relaxed text-[#303030] print:border-slate-300 print:bg-white";

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200/90 py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] sm:items-end sm:gap-5 sm:py-3 print:border-slate-300">
      <div className="text-[13px] font-medium leading-snug text-[#003F73] sm:text-sm">
        {label}
      </div>
      <div className="mt-2 min-w-0 sm:mt-0 sm:pt-0.5">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 scroll-mt-4 border-b-2 border-[#003F73] pb-2.5 text-[0.95rem] font-semibold leading-snug tracking-tight text-[#003F73] text-balance sm:mt-14 sm:text-lg print:mt-10 print:break-inside-avoid print:pb-2">
      {children}
    </h2>
  );
}

export function QuotationEditor() {
  const [billTo, setBillTo] = useState("");
  const [quoteNo, setQuoteNo] = useState("");
  const [quoteDate, setQuoteDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [lines, setLines] = useState<QuoteLine[]>(() =>
    QUOTE_LINE_DEFAULTS.map((unitPrice) => ({ qty: 0, unitPrice })),
  );
  const [gstMode, setGstMode] = useState<"auto" | "manual">("auto");
  const [gstRate, setGstRate] = useState("0");
  const [manualGst, setManualGst] = useState("");

  const { subtotal, gst, grandTotal, gstRateValue } = useMemo(() => {
    const sub = lines.reduce((s, row) => s + row.qty * row.unitPrice, 0);
    const rate = parseGstRate(gstRate);
    const g =
      gstMode === "auto"
        ? Math.round((sub * rate) * 100) / 10000
        : Math.round(parseNonNegativeNumber(manualGst) * 100) / 100;
    const grand = Math.round((sub + g) * 100) / 100;
    return { subtotal: sub, gst: g, grandTotal: grand, gstRateValue: rate };
  }, [lines, gstMode, gstRate, manualGst]);

  const setLineQty = useCallback((index: number, raw: string) => {
    const qty = parseQty(raw);
    setLines((prev) =>
      prev.map((row, i) => (i === index ? { ...row, qty } : row)),
    );
  }, []);

  const setLineUnitPrice = useCallback((index: number, raw: string) => {
    const unitPrice = parseUnitPrice(raw);
    setLines((prev) =>
      prev.map((row, i) => (i === index ? { ...row, unitPrice } : row)),
    );
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div
      id="main-content"
      className="quotation-doc min-h-[100dvh] min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 pb-[max(4rem,calc(env(safe-area-inset-bottom)+3rem))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#303030] sm:pb-20 sm:pt-10 print:bg-white print:pb-0 print:pt-0"
    >
      <div className="mx-auto max-w-[52rem] px-3 sm:px-6 print:max-w-none print:px-0">
        <div className="quotation-doc__toolbar mb-4 flex justify-end print:hidden sm:mb-6">
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-12 w-full shrink-0 rounded-lg bg-[#003F73] px-5 text-sm font-semibold tracking-wide text-white shadow-md shadow-[#003F73]/25 transition-[transform,box-shadow,opacity] duration-200 hover:opacity-[0.96] hover:shadow-lg active:scale-[0.98] sm:w-auto sm:min-h-0 sm:py-2.5"
          >
            打印 / Print
          </button>
        </div>

        <article className="quotation-doc__sheet rounded-2xl border border-slate-200/90 bg-white px-4 py-8 shadow-[0_4px_44px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.035] sm:px-10 sm:py-12 print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none print:ring-0">
          <header className="border-b border-slate-200/90 pb-8 text-center print:border-slate-300 print:pb-6">
            <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-[#003F73] sm:text-[1.85rem] print:text-[1.5rem]">
              QUOTATION / 报价单
            </h1>
            <p className="mt-3 text-[15px] font-medium text-[#303030]/85">
              HealthOptix System
            </p>
          </header>

          <section className="mt-8 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/95 to-white p-4 shadow-sm sm:mt-10 sm:p-7 print:mt-6 print:border-slate-300 print:bg-white print:shadow-none">
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
              className="break-all text-[#003F73] underline print:text-black print:no-underline"
            >
              info@health-optix.com
            </a>
          </p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <Field label="Bill To / 客户名称">
            <input
              type="text"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              className={inputLine}
              autoComplete="off"
              aria-label="Bill To / 客户名称"
            />
          </Field>
          <Field label="Quotation No. / 报价编号">
            <input
              type="text"
              value={quoteNo}
              onChange={(e) => setQuoteNo(e.target.value)}
              className={inputLine}
              autoComplete="off"
              aria-label="Quotation number"
            />
          </Field>
          <Field label="Date / 日期">
            <input
              type="date"
              value={quoteDate}
              onChange={(e) => {
                const v = e.target.value;
                setQuoteDate(v);
                if (validUntil && v && validUntil < v) setValidUntil(v);
              }}
              className={dateInputLine}
              autoComplete="off"
              aria-label="Quotation date"
            />
          </Field>
          <Field label="Valid Until / 有效期至">
            <input
              type="date"
              value={validUntil}
              min={quoteDate || undefined}
              onChange={(e) => setValidUntil(e.target.value)}
              className={dateInputLine}
              autoComplete="off"
              aria-label="Valid until"
            />
          </Field>
        </div>
      </section>

      <SectionTitle>SYSTEM OVERVIEW / 系统概述</SectionTitle>
      <div className="mt-5 max-w-prose space-y-4 text-[15px] leading-relaxed text-pretty sm:mt-6 print:mt-4 print:max-w-none">
        <p>
          The HealthOptix System is a cloud-based health operations and data
          platform for small to mid-sized providers. It supports
          appointment-led businesses—yoga studios, gyms, wellness centres, and
          similar health and lifestyle venues—by unifying schedules,
          memberships, billing, and day-to-day operations on one stack.
        </p>
        <p className="text-[#303030]/90">
          HealthOptix System
          是一套基于云端的健康运营与健康数据平台，面向中小型健康服务机构；适用于以预约、课程与会员为核心流程的各类场馆，例如瑜伽馆、健身房、健康管理中心及综合生活方式类运营场景。
        </p>
        <p>
          It brings together front-desk reception, scheduling, service or class
          delivery, billing, inventory, CRM, and analytics in one connected
          workflow for teams that run sessions, programmes, and memberships
          alongside everyday operations.
        </p>
        <p className="text-[#303030]/90">
          系统整合前台接待、预约排期、服务与课程交付、收费、库存、客户关系与数据分析等环节，支撑预约到访、课程排期、会籍与多业态日常运营的一体化管理。
        </p>
      </div>

      <SectionTitle>SCOPE OF SUPPLY / 系统模块与服务内容</SectionTitle>
      <p className="mt-2 text-[12px] text-[#303030]/65 sm:hidden print:hidden">
        手机端已优化为卡片输入，无需横向滚动
      </p>
      <div className="mt-3 space-y-3 sm:hidden print:hidden">
        <article className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-900/[0.04]">
          <p className="text-sm font-semibold text-[#003F73]">1. Core Operations</p>
          <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-[#303030]">
            {CORE_OPERATIONS_FEATURE_ROWS.map(({ en }) => (
              <p key={en}>- {en}</p>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5">
            <label className="text-[12px] text-[#303030]/70">
              Qty
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={lines[0].qty}
                onChange={(e) => setLineQty(0, e.target.value)}
                className={`${tableQtyInput} mt-1 max-w-none`}
                aria-label="Row 1 quantity"
              />
            </label>
            <label className="text-[12px] text-[#303030]/70">
              Unit Price (SGD)
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={lines[0].unitPrice}
                onChange={(e) => setLineUnitPrice(0, e.target.value)}
                className={`${tableUnitInput} mt-1 min-w-0 max-w-none`}
                aria-label="Row 1 unit price (SGD)"
              />
            </label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="text-[#303030]/75">Amount: </span>
              <span className="font-semibold tabular-nums text-[#003F73]">
                {formatSgdInt(lines[0].qty * lines[0].unitPrice)}
              </span>
            </div>
          </div>
        </article>
        {LINE_TITLES.slice(1).map((title, idx) => {
          const lineIndex = idx + 1;
          return (
            <article
              key={title}
              className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-900/[0.04]"
            >
              <p className="text-sm font-semibold text-[#003F73]">
                {lineIndex + 1}. {title}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5">
                <label className="text-[12px] text-[#303030]/70">
                  Qty
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={lines[lineIndex].qty}
                    onChange={(e) => setLineQty(lineIndex, e.target.value)}
                    className={`${tableQtyInput} mt-1 max-w-none`}
                    aria-label={`Row ${lineIndex + 1} quantity`}
                  />
                </label>
                <label className="text-[12px] text-[#303030]/70">
                  Unit Price (SGD)
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={lines[lineIndex].unitPrice}
                    onChange={(e) => setLineUnitPrice(lineIndex, e.target.value)}
                    className={`${tableUnitInput} mt-1 min-w-0 max-w-none`}
                    aria-label={`Row ${lineIndex + 1} unit price (SGD)`}
                  />
                </label>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-[#303030]/75">Amount: </span>
                  <span className="font-semibold tabular-nums text-[#003F73]">
                    {formatSgdInt(lines[lineIndex].qty * lines[lineIndex].unitPrice)}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="quotation-doc__table-scroll -mx-1 mt-3 hidden overflow-x-auto rounded-xl border border-slate-200/90 shadow-sm ring-1 ring-slate-900/[0.04] print:mx-0 print:mt-4 print:block print:shadow-none print:ring-0 sm:mx-0 sm:mt-5 sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#003F73] text-white">
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] sm:px-4 sm:text-xs">
                Item
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] sm:px-4 sm:text-xs">
                Description (EN) / 描述（中文）
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] sm:px-4 sm:text-xs">
                Qty
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] sm:px-4 sm:text-xs">
                Unit Price
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] sm:px-4 sm:text-xs">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/90 print:divide-slate-300">
            <tr className="align-top print:bg-white">
              <td className="px-3 py-3 font-medium sm:px-4">1</td>
              <td className="px-3 py-3.5 align-top sm:px-4">
                <div className="max-w-[26rem] space-y-2.5 text-[13px] leading-relaxed sm:text-[13.5px]">
                  <p className="text-[15px] font-semibold leading-tight text-[#003F73] sm:text-base">
                    Core Operations
                  </p>
                  <ul
                    className="list-none space-y-1.5 text-pretty text-[#303030]"
                    aria-label="Core Operations — English"
                  >
                    {CORE_OPERATIONS_FEATURE_ROWS.map(({ en }) => (
                      <li key={en} className="flex gap-2">
                        <span
                          className="w-4 shrink-0 select-none font-medium text-[#003F73]/75"
                          aria-hidden
                        >
                          -
                        </span>
                        <span>{en}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-dashed border-slate-200/90 pt-2.5 print:border-slate-300">
                    <p className="mb-2 text-[12px] font-medium leading-snug text-[#303030]/85">
                      核心运营管理系统（能力概览）
                    </p>
                    <ul
                      className="list-none space-y-1.5 text-pretty text-[#303030]/90"
                      aria-label="核心运营管理系统 — 中文"
                    >
                      {CORE_OPERATIONS_FEATURE_ROWS.map(({ zh }) => (
                        <li key={zh} className="flex gap-2">
                          <span
                            className="w-4 shrink-0 select-none font-medium text-[#003F73]/75"
                            aria-hidden
                          >
                            -
                          </span>
                          <span>{zh}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[0].qty}
                  onChange={(e) => setLineQty(0, e.target.value)}
                  className={tableQtyInput}
                  aria-label="Row 1 quantity"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[0].unitPrice}
                  onChange={(e) => setLineUnitPrice(0, e.target.value)}
                  className={tableUnitInput}
                  aria-label="Row 1 unit price (SGD)"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <span className={tableAmountCell} aria-label="Row 1 amount">
                  {formatSgdInt(lines[0].qty * lines[0].unitPrice)}
                </span>
              </td>
            </tr>
            <tr className="align-top bg-slate-50/75 print:bg-white">
              <td className="px-3 py-3 font-medium sm:px-4">2</td>
              <td className="px-3 py-3 sm:px-4">
                <p className="font-medium">Advanced Operations</p>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[1].qty}
                  onChange={(e) => setLineQty(1, e.target.value)}
                  className={tableQtyInput}
                  aria-label="Row 2 quantity"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[1].unitPrice}
                  onChange={(e) => setLineUnitPrice(1, e.target.value)}
                  className={tableUnitInput}
                  aria-label="Row 2 unit price (SGD)"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <span className={tableAmountCell} aria-label="Row 2 amount">
                  {formatSgdInt(lines[1].qty * lines[1].unitPrice)}
                </span>
              </td>
            </tr>
            <tr className="align-top print:bg-white">
              <td className="px-3 py-3 font-medium sm:px-4">3</td>
              <td className="px-3 py-3 sm:px-4">
                <p className="font-medium">Complete Growth Solution</p>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[2].qty}
                  onChange={(e) => setLineQty(2, e.target.value)}
                  className={tableQtyInput}
                  aria-label="Row 3 quantity"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[2].unitPrice}
                  onChange={(e) => setLineUnitPrice(2, e.target.value)}
                  className={tableUnitInput}
                  aria-label="Row 3 unit price (SGD)"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <span className={tableAmountCell} aria-label="Row 3 amount">
                  {formatSgdInt(lines[2].qty * lines[2].unitPrice)}
                </span>
              </td>
            </tr>
            <tr className="align-top bg-slate-50/75 print:bg-white">
              <td className="px-3 py-3 font-medium sm:px-4">4</td>
              <td className="px-3 py-3 sm:px-4">
                <p className="font-medium">Full Digital Transformation</p>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[3].qty}
                  onChange={(e) => setLineQty(3, e.target.value)}
                  className={tableQtyInput}
                  aria-label="Row 4 quantity"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={lines[3].unitPrice}
                  onChange={(e) => setLineUnitPrice(3, e.target.value)}
                  className={tableUnitInput}
                  aria-label="Row 4 unit price (SGD)"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <span className={tableAmountCell} aria-label="Row 4 amount">
                  {formatSgdInt(lines[3].qty * lines[3].unitPrice)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2.5 text-[12px] leading-relaxed text-[#303030]/75 print:border-slate-300 print:bg-neutral-50 sm:text-[13px]">
        <span className="font-medium text-[#003F73]/90">Note / 说明：</span>{" "}
        Amount / 金额 = Qty / 数量 × Unit Price / 单价（SGD）. Qty defaults to 0
        (integers only). Amount column is calculated automatically.
      </p>

      <SectionTitle>SUMMARY / 总计</SectionTitle>
      <div className="mt-5 rounded-xl border border-slate-200/85 bg-gradient-to-b from-slate-50/90 to-white p-5 shadow-sm sm:p-6 print:mt-4 print:border-slate-300 print:bg-white print:shadow-none">
        <p className="text-[12px] leading-relaxed text-[#303030]/72 print:text-[11px]">
          小计 = 各行 Amount 之和；GST 可按税率自动计算（默认 0%）或手动输入；总计 = 小计 + GST。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#303030]/80 print:hidden">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={gstMode === "auto"}
              onChange={(e) => setGstMode(e.target.checked ? "auto" : "manual")}
              className="h-4 w-4 accent-[#003F73]"
            />
            <span>Auto GST</span>
          </label>
          {gstMode === "auto" ? (
            <label className="inline-flex items-center gap-2">
              <span>Rate (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className={gstControlInput}
                aria-label="GST rate percentage"
              />
            </label>
          ) : (
            <label className="inline-flex items-center gap-2">
              <span>Manual GST (SGD)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={manualGst}
                onChange={(e) => setManualGst(e.target.value)}
                className={gstControlInput}
                aria-label="Manual GST amount"
              />
            </label>
          )}
        </div>
        <div className="mt-4 max-w-lg space-y-3.5 text-[15px]">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 border-b border-slate-200/90 pb-2.5 print:border-slate-300">
            <span className="min-w-[10rem] shrink-0 text-[#303030]">
              Subtotal / 小计
            </span>
            <div className="flex w-full min-w-0 flex-1 items-end gap-2 sm:w-auto sm:min-w-56">
              <span className="shrink-0 pb-0.5 text-sm font-medium text-[#303030]/75">
                SGD
              </span>
              <span
                className={summaryReadout}
                aria-label="Subtotal"
              >
                {formatSgdInt(subtotal)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 border-b border-slate-200/90 pb-2.5 print:border-slate-300">
            <span className="min-w-[10rem] shrink-0 text-[#303030]">
              GST / 税 {gstMode === "auto" ? `(${formatSgdMoney(gstRateValue)}%)` : "(Manual)"}
            </span>
            <div className="flex w-full min-w-0 flex-1 items-end gap-2 sm:w-auto sm:min-w-56">
              <span className="shrink-0 pb-0.5 text-sm font-medium text-[#303030]/75">
                SGD
              </span>
              {gstMode === "auto" ? (
                <span className={summaryReadout} aria-label="GST">
                  {formatSgdMoney(gst)}
                </span>
              ) : (
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={manualGst}
                  onChange={(e) => setManualGst(e.target.value)}
                  className={`${summaryReadout} bg-white px-2 text-right sm:px-1 sm:text-left`}
                  aria-label="GST"
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 pb-0.5">
            <span className="min-w-[10rem] shrink-0 font-semibold text-[#003F73]">
              Grand Total / 总计
            </span>
            <div className="flex w-full min-w-0 flex-1 items-end gap-2 sm:w-auto sm:min-w-56">
              <span className="shrink-0 pb-0.5 text-sm font-semibold text-[#003F73]/80">
                SGD
              </span>
              <span
                className={`${summaryReadout} border-[#003F73]/55 font-semibold text-[#003F73] print:border-black`}
                aria-label="Grand total"
              >
                {formatSgdMoney(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SectionTitle>
        SUBSCRIPTION (IF APPLICABLE) / 系统订阅费用（如适用）
      </SectionTitle>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-[15px] leading-relaxed marker:text-[#003F73]">
        <li>Cloud hosting &amp; system access — 云端托管与系统使用</li>
        <li>
          <p>Annual subscription fee — 每年系统订阅费</p>
          <div className="mt-2 flex max-w-md flex-wrap items-end gap-2 rounded-md border border-slate-200/80 bg-slate-50/50 px-3 py-2 print:border-slate-300 print:bg-neutral-50">
            <span className="shrink-0 pb-0.5 text-sm font-medium text-[#303030]/75">
              SGD
            </span>
            <span
              className="block min-w-[6rem] flex-1 border-b-2 border-slate-700/45 py-0.5 text-right text-[15px] font-semibold tabular-nums text-[#303030] print:border-black"
              aria-label="Annual subscription amount"
            >
              999
            </span>
            <span className="shrink-0 pb-0.5 text-sm text-[#303030]/75">
              / year
            </span>
          </div>
        </li>
      </ul>

      <SectionTitle>PAYMENT TERMS / 付款条款</SectionTitle>
      <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[15px] leading-relaxed marker:text-[#003F73]">
        <li>Full payment before system deployment — 系统上线前需全额付款</li>
        <li>
          Payment via bank transfer / PayNow — 支持银行转账 / PayNow
        </li>
      </ul>
      <div className="mt-4 rounded-xl border border-slate-200/85 bg-slate-50/40 p-4 text-[15px] leading-relaxed sm:p-5 print:border-slate-300 print:bg-neutral-50">
        <p className="text-sm font-semibold text-[#003F73]">
          Bank account details / 银行账号明细
        </p>
        <div className="mt-3 space-y-1.5 text-[#303030]">
          <p>
            <span className="text-[#303030]/65">Bank:</span> OCBC Bank
          </p>
          <p>
            <span className="text-[#303030]/65">Account number:</span>{" "}
            595663725001
          </p>
          <p>
            <span className="text-[#303030]/65">UEN:</span> 202333694H
          </p>
        </div>
      </div>

      <SectionTitle>TERMS AND CONDITIONS</SectionTitle>
      <ol className="quotation-doc__terms mt-6 list-decimal space-y-7 pl-4 text-[15px] leading-relaxed marker:font-semibold marker:text-[#003F73] sm:space-y-8 sm:pl-6 print:space-y-5 print:text-[12.5px] print:leading-snug">
        <li>
          <p className="font-semibold text-[#003F73]">
            Installation and Acceptance / 安装与验收
          </p>
          <p className="mt-2">
            HealthOptix shall configure and deploy the system. Upon completion,
            the Client shall confirm acceptance.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix 负责系统配置与部署，完成后客户确认验收。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Scope of System / 系统范围
          </p>
          <p className="mt-2">
            The system provided includes only the modules and services specified
            in this quotation. Any additional features, integrations, or
            customization will be separately scoped and quoted.
          </p>
          <p className="mt-2 text-[#303030]/90">
            本系统仅包含报价单所列内容，额外功能或定制将另行报价。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            System Nature / 系统性质
          </p>
          <p className="mt-2">
            The HealthOptix System is an operations and data management
            platform for health and wellness businesses. It does not provide
            medical advice, diagnosis, or treatment decisions.
          </p>
          <p className="mt-2 text-[#303030]/90">
            本系统为运营与数据管理工具，不涉及医疗诊断或治疗决策。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Subscription Period / 订阅周期
          </p>
          <p className="mt-2">
            For cloud-based services, the system is provided on a subscription
            basis unless otherwise stated. The Client is responsible for timely
            renewal to maintain system access.
          </p>
          <p className="mt-2 text-[#303030]/90">
            云系统为订阅制，客户需按时续费以保持使用权限。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Payment Terms / 付款条款
          </p>
          <p className="mt-2">
            Full payment must be made prior to system deployment unless
            otherwise agreed. HealthOptix reserves the right to suspend services
            in the event of non-payment.
          </p>
          <p className="mt-2 text-[#303030]/90">
            系统上线前需付全款，逾期可能暂停服务。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Warranty / 保修与保障</p>
          <p className="mt-2">
            HealthOptix provides a{" "}
            <span className="font-semibold text-[#002244] print:text-black">
              12-month warranty
            </span>{" "}
            for its software from the date of deployment, covering defects under
            normal use. This warranty applies to software only. Hardware (if any)
            is subject to the respective manufacturer&apos;s warranty.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix 对软件系统提供自上线之日起{" "}
            <span className="font-semibold text-[#002244] print:text-black">
              12 个月保修
            </span>
            ，适用于正常使用情况下的系统问题。本保修仅适用于软件，硬件（如有）按供应商保修条款执行。
          </p>
          <p className="mt-2">
            The warranty excludes issues arising from misuse, unauthorized
            modifications, third-party systems, or infrastructure failures.
          </p>
          <p className="mt-2 text-[#303030]/90">
            以下情况不在保修范围内：非正常使用、未经授权的修改、第三方系统或基础设施问题。
          </p>
          <p className="mt-3 font-medium text-[#003F73]">
            Post-Warranty Support / 保修期后支持
          </p>
          <div className={`${postWarrantyRateBlock} mt-2`}>
            <p>Onsite support is available upon request and chargeable as follows:</p>
            <p>Weekdays (9am–6pm): SGD 100 per visit</p>
            <p>Weekdays (6pm–12am): SGD 150 per visit</p>
            <p>Weekends / Public Holidays: SGD 200 per visit</p>
          </div>
          <div className={`${postWarrantyRateBlock} mt-3`}>
            <p>保修期后现场支持按次收费：</p>
            <p>工作日（9:00–18:00）SGD 100 / 次</p>
            <p>工作日（18:00–24:00）SGD 150 / 次</p>
            <p>周末及公共假期 SGD 200 / 次</p>
          </div>
          <div className={`${postWarrantyRateBlock} mt-3`}>
            <p>Fees exclude repair, replacement, or third-party costs.</p>
            <p>以上费用不包含维修、更换或第三方成本。</p>
          </div>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Support and Maintenance / 技术支持与维护
          </p>
          <p className="mt-2">
            Standard support includes system troubleshooting, minor updates,
            and bug fixes.
          </p>
          <p className="mt-2 text-[#303030]/90">
            标准支持包括系统问题处理、小规模更新及缺陷修复。
          </p>
          <p className="mt-2">
            Additional services, including customization, major configuration
            changes, and onsite support, may be subject to additional charges.
          </p>
          <p className="mt-2 text-[#303030]/90">
            定制开发、重大配置调整及现场支持等服务可能另行收费。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Data Setup and Configuration / 数据与配置
          </p>
          <p className="mt-2">
            Initial data setup (if applicable) will be performed based on data
            provided by the Client. The Client is responsible for ensuring data
            accuracy.
          </p>
          <p className="mt-2 text-[#303030]/90">
            初始数据由客户提供，客户需确保数据准确性。
          </p>
          <p className="mt-2">
            Subsequent data updates or reconfiguration may be chargeable.
          </p>
          <p className="mt-2 text-[#303030]/90">后续数据处理可能收费。</p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Data Ownership and Responsibility / 数据归属与责任
          </p>
          <p className="mt-2">
            All patient and customer data remain the property of the Client. The
            Client is responsible for compliance with applicable laws.
          </p>
          <p className="mt-2 text-[#303030]/90">
            数据归客户所有，客户负责合法使用。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Data Protection (PDPA Compliance) / 数据保护
          </p>
          <p className="mt-2">
            HealthOptix complies with the Personal Data Protection Act (PDPA) of
            Singapore.
          </p>
          <p className="mt-2 text-[#303030]/90">HealthOptix 遵循 PDPA 法规。</p>
          <p className="mt-2">
            HealthOptix will not access or use data except for system support
            with the Client&apos;s prior consent.
          </p>
          <p className="mt-2 text-[#303030]/90">
            除经客户事先同意用于系统支持外，HealthOptix 不会访问或使用任何数据。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Data Backup / 数据备份</p>
          <p className="mt-2">
            HealthOptix performs regular system backups on a best-effort basis.
            However, the Client is responsible for maintaining their own backup
            if required.
          </p>
          <p className="mt-2 text-[#303030]/90">
            系统提供备份，但客户需自行保留必要备份。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            System Availability / 系统可用性
          </p>
          <p className="mt-2">
            HealthOptix shall use reasonable efforts to maintain system
            availability on a 24/7 basis, except for planned maintenance and
            events beyond its control. However, uninterrupted or error-free
            operation cannot be guaranteed.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix
            将在合理范围内尽力维持系统全天候（24/7）运行，但不包括计划内维护及其无法控制的情形，亦无法保证系统持续无中断或无错误运行。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Non-Transferability / 不可转让
          </p>
          <p className="mt-2">
            The system license is non-transferable without prior written
            consent.
          </p>
          <p className="mt-2 text-[#303030]/90">系统授权不可转让。</p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Non-Refundable / 不可退款</p>
          <p className="mt-2">
            All payments made are non-refundable once services have commenced.
          </p>
          <p className="mt-2 text-[#303030]/90">服务开始后费用不退款。</p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Missed Appointments / 延误与重约
          </p>
          <p className="mt-2">
            If system deployment or setup is delayed due to Client-side readiness
            issues (e.g. no internet, incomplete setup), additional charges may
            apply.
          </p>
          <p className="mt-2 text-[#303030]/90">
            如果由于客户端准备问题（例如没有互联网、设置不完整）导致系统部署或设置延迟，则可能需要支付额外费用。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Limitation of Liability / 责任限制
          </p>
          <p className="mt-2">
            HealthOptix shall not be liable for any indirect or consequential
            damages, including loss of revenue, loss of business, data loss, or
            system interruption.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix
            不对任何间接或后果性损失承担责任，包括但不限于收入损失、业务损失、数据丢失或系统中断。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Responsibility &amp; Liability / 责任归属与免责
          </p>
          <p className="mt-2">
            The Client shall be responsible for any claims, losses or
            liabilities arising from the Client&apos;s misuse of the system or
            breach of its obligations, and HealthOptix shall not be liable for
            such matters.
          </p>
          <p className="mt-2 text-[#303030]/90">
            因客户对系统的不当使用或违反其义务所引起的任何索赔、损失或责任，由客户自行承担，HealthOptix
            对此不承担责任。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Data Disclosure / 数据披露</p>
          <p className="mt-2">
            HealthOptix may disclose data if required by law or authorities.
          </p>
          <p className="mt-2 text-[#303030]/90">如法律要求，可能披露数据。</p>
        </li>
      </ol>

      <SectionTitle>ACCEPTANCE / 确认签署</SectionTitle>
      <div className="mt-6 space-y-5 text-[15px] print:mt-8">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1 print:break-inside-avoid">
          <span className="shrink-0 text-[#303030]/85">Signature / 签名：</span>
          <span className="min-h-[2rem] min-w-48 flex-1 border-b-2 border-slate-600/90 print:min-w-64 print:border-black" />
        </div>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1 print:break-inside-avoid">
          <span className="shrink-0 text-[#303030]/85">Name / 姓名：</span>
          <span className="min-h-[2rem] min-w-48 flex-1 border-b-2 border-slate-600/90 print:min-w-64 print:border-black" />
        </div>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1 print:break-inside-avoid">
          <span className="shrink-0 text-[#303030]/85">Date / 日期：</span>
          <span className="min-h-[2rem] min-w-40 flex-1 border-b-2 border-slate-600/90 print:min-w-56 print:border-black" />
        </div>
      </div>

      <p className="mt-14 border-t border-slate-200/80 pt-6 text-center text-[11px] text-[#303030]/65 print:mt-10 print:border-slate-300 print:pt-4">
        Template version aligned with internal quotation document (April 2026).
      </p>
        </article>
      </div>
    </div>
  );
}
