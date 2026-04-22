"use client";

import { useState } from "react";
import { signingPageUrl } from "@/lib/site-url";

export function CopySignLinkButton({ signingToken }: { signingToken: string }) {
  const [done, setDone] = useState(false);
  const url = signingPageUrl(signingToken);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Copy signing link:", url);
        }
      }}
      className="rounded-md border border-[#003F73]/25 bg-white px-2.5 py-1 text-xs font-semibold text-[#003F73] hover:bg-slate-50"
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}
