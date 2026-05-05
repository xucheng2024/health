"use client";

import { useState } from "react";

type InvoiceResponse = {
  error?: string;
  invoiceId?: string;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  sentTo?: string;
  cc?: string[];
};

export function SendInvoiceButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendInvoice = async (mode: "real" | "test") => {
    if (loading || loadingTest) return;
    if (mode === "test") setLoadingTest(true);
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/internal/quotes/${encodeURIComponent(quoteId)}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "test" ? { test: true } : {}),
      });
      const data = (await res.json()) as InvoiceResponse;
      if (!res.ok) {
        setError(data.error ?? "Unable to send invoice.");
        return;
      }

      const invoiceLabel = data.invoiceNumber || data.invoiceId || "invoice";
      const ccText = data.cc && data.cc.length > 0 ? ` CC: ${data.cc.join(", ")}.` : "";
      setMessage(`Zoho invoice ${invoiceLabel} sent to ${data.sentTo}.${ccText}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setLoadingTest(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void sendInvoice("real")}
        disabled={loading || loadingTest}
        className="rounded-md border border-emerald-700/25 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending invoice..." : "Send invoice"}
      </button>
      <button
        type="button"
        onClick={() => void sendInvoice("test")}
        disabled={loading || loadingTest}
        className="ml-2 rounded-md border border-amber-700/25 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingTest ? "Sending test..." : "Send invoice (test → eatfreshapple@gmail.com)"}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
