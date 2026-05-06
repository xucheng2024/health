"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReissueInvoiceResponse = {
  error?: string;
  invoiceId?: string;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
};

export function ReissueInvoiceButton({
  quoteId,
  disabled = false,
  disabledReason,
}: {
  quoteId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reissueInvoice = async () => {
    if (loading || disabled) return;
    const confirmed = window.confirm(
      "Create a replacement Zoho invoice for this voided quotation? The new invoice will open in preview and will not be emailed automatically.",
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/internal/quotes/${encodeURIComponent(quoteId)}/invoice/reissue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = (await res.json()) as ReissueInvoiceResponse;
      if (!res.ok) {
        setError(data.error ?? "Unable to reissue invoice.");
        return;
      }

      const invoiceLabel = data.invoiceNumber || data.invoiceId || "invoice";
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
      }
      setMessage(`Created replacement Zoho invoice ${invoiceLabel} and opened preview.`);
      router.refresh();
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
        onClick={() => void reissueInvoice()}
        disabled={loading || disabled}
        title={disabled ? disabledReason ?? "Invoice cannot be reissued." : undefined}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-violet-700/20 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {loading ? "Reissuing invoice..." : "Reissue invoice"}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
