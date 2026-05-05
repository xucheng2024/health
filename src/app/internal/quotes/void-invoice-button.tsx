"use client";

import { useState } from "react";

type VoidInvoiceResponse = {
  error?: string;
  invoiceId?: string;
  invoiceNumber?: string | null;
  alreadyVoided?: boolean;
};

export function VoidInvoiceButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const voidInvoice = async () => {
    if (loading) return;
    const confirmed = window.confirm(
      "Void this Zoho invoice? This affects the existing invoice linked to this quotation.",
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/internal/quotes/${encodeURIComponent(quoteId)}/invoice/void`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = (await res.json()) as VoidInvoiceResponse;
      if (!res.ok) {
        setError(data.error ?? "Unable to void invoice.");
        return;
      }

      const invoiceLabel = data.invoiceNumber || data.invoiceId || "invoice";
      setMessage(
        data.alreadyVoided
          ? `Zoho invoice ${invoiceLabel} was already voided.`
          : `Zoho invoice ${invoiceLabel} has been voided.`,
      );
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
        onClick={() => void voidInvoice()}
        disabled={loading}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-rose-700/20 bg-white px-3 py-2 text-xs font-semibold text-rose-800 shadow-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Voiding invoice..." : "Void invoice"}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
