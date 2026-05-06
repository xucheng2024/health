"use client";

import { useRouter } from "next/navigation";
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
  invoiceUrl,
  disabled = false,
  disabledReason,
}: {
  quoteId: string;
  invoiceUrl?: string | null;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendInvoice = async () => {
    if (loading || loadingPreview || disabled) return;
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
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewInvoice = async () => {
    if (loading || loadingPreview || disabled) return;
    setLoadingPreview(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/internal/quotes/${encodeURIComponent(quoteId)}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preview: true }),
      });
      const data = (await res.json()) as InvoiceResponse;
      if (!res.ok) {
        setError(data.error ?? "Unable to preview invoice.");
        return;
      }

      const invoiceLabel = data.invoiceNumber || data.invoiceId || "invoice";
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
      }
      setMessage(
        data.reusedExisting
          ? `Opened Zoho invoice ${invoiceLabel} preview.`
          : `Created Zoho invoice ${invoiceLabel} and opened preview.`,
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => void sendInvoice()}
        disabled={loading || loadingPreview || disabled}
        title={disabled ? disabledReason ?? "Invoice cannot be sent." : undefined}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-emerald-700/20 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 shadow-sm transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {loading ? "Sending invoice..." : "Send invoice"}
      </button>
      {invoiceUrl ? (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-sky-700/20 bg-white px-3 py-2 text-xs font-semibold text-sky-900 shadow-sm transition-colors hover:bg-sky-50"
        >
          Open Zoho
        </a>
      ) : (
        <button
          type="button"
          onClick={() => void previewInvoice()}
          disabled={loading || loadingPreview || disabled}
          title={disabled ? disabledReason ?? "Invoice cannot be previewed." : "Create or reuse the Zoho invoice and open its preview without emailing the customer."}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-sky-700/20 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 shadow-sm transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {loadingPreview ? "Opening preview..." : "Preview invoice"}
        </button>
      )}
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
