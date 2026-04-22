export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 scroll-mt-4 border-b-2 border-[#003F73] pb-2.5 text-[0.95rem] font-semibold leading-snug tracking-tight text-[#003F73] text-balance sm:mt-14 sm:text-lg print:mt-10 print:break-inside-avoid print:pb-2">
      {children}
    </h2>
  );
}

export const postWarrantyRateBlock =
  "space-y-1.5 rounded-lg border border-slate-200/85 bg-slate-50/45 px-3 py-2.5 text-[15px] leading-relaxed text-[#303030] print:border-slate-300 print:bg-white";
