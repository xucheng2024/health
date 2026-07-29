"use client";

import { useState } from "react";

export function SendSignedContractButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/internal/quotes/${encodeURIComponent(quoteId)}/send-signed-contract`,
        { method: "POST" },
      );
      const data = (await res.json()) as { error?: string; sentTo?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to send signed contract to administrator.");
        return;
      }
      setMessage(`Signed contract sent to ${data.sentTo}.`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void send()}
        disabled={loading}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-violet-700/20 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {loading ? "Sending signed contract..." : "Send signed contract to administrator"}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
