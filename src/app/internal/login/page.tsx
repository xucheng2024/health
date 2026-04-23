"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function InternalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/internal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      router.replace("/internal/quotes");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 px-4 py-10 text-[#303030] sm:px-8">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#003F73]">Internal Login</h1>
        <p className="mt-2 text-sm text-[#303030]/80">
          Sign in with internal credentials to manage quotations and signing links.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[#003F73]">
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[#303030] outline-none ring-[#003F73]/30 focus:border-[#003F73] focus:ring-2"
            />
          </label>

          <label className="block text-sm font-medium text-[#003F73]">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[#303030] outline-none ring-[#003F73]/30 focus:border-[#003F73] focus:ring-2"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 w-full rounded-lg bg-[#003F73] px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
