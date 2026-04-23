"use client";

import { useState } from "react";
import { formatSingaporeDateTime } from "@/lib/datetime";

export function ResendButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onResend = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/internal/quotes/${encodeURIComponent(quoteId)}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validDays: 7 }),
      });
      const data = (await res.json()) as { error?: string; signingTokenExpiresAt?: string | null };
      if (!res.ok) {
        setError(data.error ?? "Unable to resend.");
        return;
      }

      const expireText = data.signingTokenExpiresAt
        ? formatSingaporeDateTime(data.signingTokenExpiresAt)
        : "N/A";
      setMessage(`Signing link resent. New expiry: ${expireText}`);
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
        onClick={onResend}
        disabled={loading}
        className="rounded-md border border-[#003F73]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#003F73] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Resending..." : "Resend"}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
