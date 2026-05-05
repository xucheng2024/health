"use client";

import { useState } from "react";

type InvoiceResponse = {
  error?: string;
  invoiceId?: string;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  sentTo?: string;
  cc?: string[];
  reusedExisting?: boolean;
};

export function SendInvoiceButton({
  quoteId,
  disabled = false,
  disabledReason,
}: {
  quoteId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendInvoice = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/internal/quotes/${encodeURIComponent(quoteId)}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as InvoiceResponse;
      if (!res.ok) {
        setError(data.error ?? "Unable to send invoice.");
        return;
      }

      const invoiceLabel = data.invoiceNumber || data.invoiceId || "invoice";
      const ccText = data.cc && data.cc.length > 0 ? ` CC: ${data.cc.join(", ")}.` : "";
      const actionText = data.reusedExisting ? "re-sent" : "created and sent";
      setMessage(`Zoho invoice ${invoiceLabel} ${actionText} to ${data.sentTo}.${ccText}`);
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
        onClick={() => void sendInvoice()}
        disabled={loading || disabled}
        title={disabled ? disabledReason ?? "Invoice cannot be sent." : undefined}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-emerald-700/20 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 shadow-sm transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {loading ? "Sending invoice..." : "Send invoice"}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
