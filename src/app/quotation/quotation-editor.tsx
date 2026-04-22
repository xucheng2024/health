"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { SectionTitle } from "@/components/quotation/quotation-doc-primitives";
import { QuotationStandardClauses } from "@/components/quotation/quotation-standard-clauses";

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
type CreateLineItem = { title: string; qty: number; unitPrice: number };

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

function parseQty(raw: string): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseUnitPrice(raw: string): number {
  const cleaned = String(raw).replace(/,/g, "").trim();
  const n = Math.round(Number(cleaned));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
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

type CreatedQuoteResult = {
  quote: {
    id: string;
    quoteNo: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    total: number;
    currency: string;
  };
  signingUrl: string;
};

function CreatedQuoteActions({ signingUrl }: { signingUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(signingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy signing link:", signingUrl);
    }
  }, [signingUrl]);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <a
        href={signingUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#003F73] px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md shadow-[#003F73]/20 transition-opacity hover:opacity-[0.96]"
      >
        Open Signing Page
      </a>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#003F73]/20 bg-white px-4 py-2.5 text-sm font-semibold tracking-wide text-[#003F73] shadow-sm transition-colors hover:bg-slate-50"
      >
        {copied ? "Copied Link" : "Copy Link"}
      </button>
    </div>
  );
}

export function QuotationEditor() {
  const today = useMemo(() => new Date(), []);
  const [billTo, setBillTo] = useState("");
  const [quoteDate, setQuoteDate] = useState(() => formatDateInput(today));
  const [validUntil, setValidUntil] = useState(() =>
    formatDateInput(addYears(today, 1)),
  );
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdQuote, setCreatedQuote] = useState<CreatedQuoteResult | null>(null);
  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [confirmingCreatePassword, setConfirmingCreatePassword] = useState(false);
  const [createPasswordError, setCreatePasswordError] = useState<string | null>(null);
  const createPasswordInputRef = useRef<HTMLInputElement | null>(null);
  const [lines, setLines] = useState<QuoteLine[]>(() =>
    QUOTE_LINE_DEFAULTS.map((unitPrice) => ({ qty: 0, unitPrice })),
  );
  const subtotal = useMemo(
    () => lines.reduce((s, row) => s + row.qty * row.unitPrice, 0),
    [lines],
  );
  const createPreview = useMemo(() => {
    const lineItems: CreateLineItem[] = LINE_TITLES.map((title, index) => ({
      title,
      qty: Math.max(0, lines[index]?.qty ?? 0),
      unitPrice: Math.max(0, lines[index]?.unitPrice ?? 0),
    }));
    const subtotalValue = lineItems.reduce(
      (sum, row) => sum + row.qty * row.unitPrice,
      0,
    );
    const clampedSubtotal = Math.max(0, Number(subtotalValue.toFixed(2)));
    const taxRate = 0;
    const taxAmount = 0;
    const total = clampedSubtotal;
    const pickedRows = lineItems.filter((row) => row.qty > 0);
    const picked = pickedRows[0];
    const packageId =
      pickedRows.length === 0
        ? "custom-table"
        : pickedRows.length === 1 && picked
          ? slugify(picked.title)
          : "custom-multi-line";
    const packageName =
      pickedRows.length === 0
        ? "Custom Table Package"
        : pickedRows.length === 1 && picked
          ? picked.title
          : "Custom Multi-line Package";
    return {
      lineItems,
      packageId,
      packageName,
      qty: 1,
      discount: 0,
      taxRate,
      subtotal: clampedSubtotal,
      taxAmount,
      total,
    };
  }, [lines]);

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

  const submitCreateQuote = useCallback(
    async (createPassword: string): Promise<{ ok: boolean; error?: string }> => {
      if (!createPreview) {
        return { ok: false, error: "Quotation preview is unavailable." };
      }
      if (createPreview.subtotal <= 0) {
        const error = "Please add quantity in at least one package row.";
        setCreateError(error);
        return { ok: false, error };
      }

      setCreating(true);
      setCreateError(null);
      setCreatedQuote(null);

      try {
        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-create-password": createPassword.trim(),
          },
          body: JSON.stringify({
            planId: createPreview.packageId,
            packageName: createPreview.packageName,
            companyName: companyName.trim(),
            contactName: contactName.trim(),
            contactEmail: contactEmail.trim(),
            contactPhone: contactPhone.trim(),
            lineItems: createPreview.lineItems,
            qty: createPreview.qty,
            discount: createPreview.discount,
            taxRate: createPreview.taxRate,
          }),
        });

        const data = (await response.json()) as
          | CreatedQuoteResult
          | { error?: string; message?: string };

        if (!response.ok) {
          const apiError =
            "message" in data
              ? data.message
              : "error" in data
                ? data.error
                : undefined;
          const error = apiError ?? "Unable to create quotation.";
          setCreateError(error);
          return { ok: false, error };
        }

        const created = data as CreatedQuoteResult;
        setCreatedQuote(created);
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
          // Best effort: open signed link page in a new tab so users can see an immediate result.
          if (created.signingUrl) {
            window.open(created.signingUrl, "_blank", "noopener,noreferrer");
          }
        }
        return { ok: true };
      } catch {
        const error = "Network error while creating quotation.";
        setCreateError(error);
        return { ok: false, error };
      } finally {
        setCreating(false);
      }
    },
    [
      companyName,
      contactEmail,
      contactName,
      contactPhone,
      createPreview,
    ],
  );

  const handleCreateQuote = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!createPreview || creating) return;
      if (createPasswordInputRef.current) {
        createPasswordInputRef.current.value = "";
      }
      setCreatePasswordError(null);
      setShowCreatePasswordModal(true);
    },
    [createPreview, creating],
  );

  const handleConfirmCreatePassword = useCallback(async () => {
    if (confirmingCreatePassword) return;
    const trimmed = createPasswordInputRef.current?.value.trim() ?? "";
    if (!trimmed) {
      setCreatePasswordError("Password is required.");
      return;
    }
    setConfirmingCreatePassword(true);
    setCreatePasswordError(null);
    const result = await submitCreateQuote(trimmed);
    if (!result.ok) {
      setCreatePasswordError(result.error ?? "Unable to create quotation.");
      setConfirmingCreatePassword(false);
      return;
    }
    if (createPasswordInputRef.current) {
      createPasswordInputRef.current.value = "";
    }
    setConfirmingCreatePassword(false);
    setShowCreatePasswordModal(false);
  }, [confirmingCreatePassword, submitCreateQuote]);

  return (
    <div
      id="main-content"
      className="quotation-doc min-h-[100dvh] min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 pb-[max(4rem,calc(env(safe-area-inset-bottom)+3rem))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#303030] sm:pb-20 sm:pt-10 print:bg-white print:pb-0 print:pt-0"
    >
      <div className="mx-auto max-w-[52rem] px-3 sm:px-6 print:max-w-none print:px-0">
        <form onSubmit={handleCreateQuote}>
        <article className="quotation-doc__sheet rounded-2xl border border-slate-200/90 bg-white px-4 py-8 shadow-[0_4px_44px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.035] sm:px-10 sm:py-12 print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none print:ring-0">
          <header className="border-b border-slate-200/90 pb-8 text-center print:border-slate-300 print:pb-6">
            <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-[#003F73] sm:text-[1.85rem] print:text-[1.5rem]">
              QUOTATION / 报价单
            </h1>
            <p className="mt-3 text-[15px] font-medium text-[#303030]/85">
              HealthOptix System
            </p>
          </header>

          {createError ? (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 print:hidden">
              {createError}
            </p>
          ) : null}

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
          <Field label="Company / 客户公司">
            <input
              type="text"
              value={billTo}
              onChange={(e) => {
                setBillTo(e.target.value);
                setCompanyName(e.target.value);
              }}
              className={inputLine}
              autoComplete="off"
              aria-label="Bill To / 客户名称"
              required
            />
          </Field>
          <Field label="Contact Person / 联系人">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputLine}
              autoComplete="name"
              aria-label="Contact name"
              required
            />
          </Field>
          <Field label="Contact Email / 邮箱">
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputLine}
              autoComplete="email"
              aria-label="Contact email"
              required
            />
          </Field>
          <Field label="Contact Phone / 电话">
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputLine}
              autoComplete="tel"
              aria-label="Contact phone"
            />
          </Field>
          <Field label="Quotation No. / 报价编号">
            <div
              className={`${inputLine} flex items-center border-slate-400/45 text-[#303030]/80`}
              aria-label="Quotation number"
            >
              {createdQuote?.quote.quoteNo || "Auto-generated on create / 创建后自动生成"}
            </div>
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
          小计 = 各行 Amount 之和；总计 = 小计。
        </p>
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
                {formatSgdInt(subtotal)}
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

      <QuotationStandardClauses />

      <div className="mt-10 flex justify-end print:hidden">
        <button
          type="submit"
                  disabled={creating}
          className="min-h-12 w-full rounded-lg bg-[#003F73] px-5 text-sm font-semibold tracking-wide text-white shadow-md shadow-[#003F73]/25 transition-[transform,box-shadow,opacity] duration-200 hover:opacity-[0.96] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-h-0 sm:py-2.5"
        >
          {creating ? "Creating… / 创建中…" : "Create Quote / 创建报价"}
        </button>
      </div>

      {createdQuote ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-4 text-sm text-[#303030] shadow-sm motion-safe:animate-[fade-in-up_220ms_ease-out] print:hidden">
          <p className="font-semibold text-[#003F73]">
            Quote created: {createdQuote.quote.quoteNo}
          </p>
          <p className="mt-1">
            Customer: {createdQuote.quote.contactName} ({createdQuote.quote.contactEmail})
          </p>
          <p className="mt-1">
            Total: {createdQuote.quote.currency} {createdQuote.quote.total.toFixed(2)}
          </p>
          <p className="mt-3 break-all">
            Signing link:{" "}
            <a
              href={createdQuote.signingUrl}
              className="font-medium text-[#003F73] underline"
              target="_blank"
              rel="noreferrer"
            >
              {createdQuote.signingUrl}
            </a>
          </p>
          <CreatedQuoteActions signingUrl={createdQuote.signingUrl} />
        </div>
      ) : null}

      <p className="mt-14 border-t border-slate-200/80 pt-6 text-center text-[11px] text-[#303030]/65 print:mt-10 print:border-slate-300 print:pt-4">
        Template version aligned with internal quotation document (April 2026).
      </p>
        </article>
        </form>
        {showCreatePasswordModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 print:hidden">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleConfirmCreatePassword();
              }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
            >
              <h3 className="text-base font-semibold text-[#003F73]">
                Create Quotation
              </h3>
              <p className="mt-2 text-sm text-[#303030]/75">
                Enter the authorization password to create this quotation.
              </p>
              <label className="mt-4 block text-sm font-medium text-[#003F73]">
                Authorization Password
                <input
                  ref={createPasswordInputRef}
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  placeholder="Enter password"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setShowCreatePasswordModal(false);
                    }
                  }}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50/45 px-3 py-2.5 text-[15px] text-[#303030] outline-none transition-[border-color,box-shadow] focus:border-[#003F73] focus:ring-2 focus:ring-[#003F73]/20"
                />
              </label>
              {createPasswordError ? (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {createPasswordError}
                </p>
              ) : null}
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (createPasswordInputRef.current) {
                      createPasswordInputRef.current.value = "";
                    }
                    setCreatePasswordError(null);
                    setShowCreatePasswordModal(false);
                  }}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#303030] transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmingCreatePassword}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#003F73] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#003F73]/20 transition-opacity hover:opacity-[0.95] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {confirmingCreatePassword ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
