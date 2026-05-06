"use client";

import { useState } from "react";

type PaymentResponse = {
  error?: string;
  invoiceNumber?: string | null;
  paidAmount?: number | null;
  balanceDue?: number | null;
  invoiceStatus?: "sent" | "paid" | "void";
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RecordPaymentButton({
  quoteId,
  currency,
  maxAmount,
  disabled = false,
  disabledReason,
}: {
  quoteId: string;
  currency: string;
  maxAmount?: number | null;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(maxAmount && maxAmount > 0 ? String(maxAmount) : "");
  const [date, setDate] = useState(todayIso());
  const [paymentMode, setPaymentMode] = useState<
    "cash" | "banktransfer" | "bankremittance" | "creditcard" | "check" | "others"
  >("banktransfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/internal/quotes/${encodeURIComponent(quoteId)}/invoice/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            date,
            paymentMode,
            referenceNumber,
            description,
          }),
        },
      );
      const data = (await res.json()) as PaymentResponse;
      if (!res.ok) {
        setError(data.error ?? "Unable to record payment.");
        return;
      }

      const invoiceLabel = data.invoiceNumber || "invoice";
      const paidText =
        typeof data.paidAmount === "number" ? `${currency} ${data.paidAmount.toFixed(2)}` : "updated";
      const balanceText =
        typeof data.balanceDue === "number"
          ? `${currency} ${data.balanceDue.toFixed(2)}`
          : "updated";
      setMessage(`${invoiceLabel}: paid ${paidText}, balance due ${balanceText}.`);
      setOpen(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title={disabled ? disabledReason ?? "Payment cannot be recorded." : undefined}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-sky-700/20 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 shadow-sm transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {open ? "Close payment form" : "Record payment"}
      </button>

      {open ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[#303030]/80">
              Amount
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#303030] outline-none ring-[#003F73]/20 focus:border-[#003F73] focus:ring-2"
                placeholder={`${currency} 0.00`}
              />
            </label>
            <label className="text-xs font-medium text-[#303030]/80">
              Payment date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#303030] outline-none ring-[#003F73]/20 focus:border-[#003F73] focus:ring-2"
              />
            </label>
            <label className="text-xs font-medium text-[#303030]/80">
              Payment mode
              <select
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(
                    e.target.value as
                      | "cash"
                      | "banktransfer"
                      | "bankremittance"
                      | "creditcard"
                      | "check"
                      | "others",
                  )
                }
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#303030] outline-none ring-[#003F73]/20 focus:border-[#003F73] focus:ring-2"
              >
                <option value="banktransfer">Bank transfer</option>
                <option value="bankremittance">Bank remittance</option>
                <option value="cash">Cash</option>
                <option value="creditcard">Credit card</option>
                <option value="check">Check</option>
                <option value="others">Others</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[#303030]/80">
              Reference
              <input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#303030] outline-none ring-[#003F73]/20 focus:border-[#003F73] focus:ring-2"
                placeholder="Transaction / transfer reference"
              />
            </label>
            <label className="text-xs font-medium text-[#303030]/80">
              Notes
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#303030] outline-none ring-[#003F73]/20 focus:border-[#003F73] focus:ring-2"
                placeholder="Optional payment notes"
              />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="inline-flex min-h-9 flex-1 items-center justify-center rounded-md border border-sky-700/20 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 shadow-sm transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Recording..." : "Save payment"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#303030] shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
