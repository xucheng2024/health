"use client";

import { useState } from "react";
import { signingPageUrl } from "@/lib/site-url";

export function CopySignLinkButton({
  signingToken,
  disabled = false,
  disabledReason,
}: {
  signingToken: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [done, setDone] = useState(false);
  const url = signingPageUrl(signingToken);

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? disabledReason ?? "Link is not available." : undefined}
      onClick={async () => {
        if (disabled) return;
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Copy signing link:", url);
        }
      }}
      className="rounded-md border border-[#003F73]/25 bg-white px-2.5 py-1 text-xs font-semibold text-[#003F73] hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}
