import Image from "next/image";

const navItems = [
  { href: "#who-we-are", label: "Who we are" },
  { href: "#what-we-do", label: "What we do" },
  { href: "#contact", label: "Contact" },
] as const;

/** One style for all primary nav links — size, weight, tracking, hit area */
const navLinkClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm px-3 py-2 text-[13px] font-medium leading-none tracking-[0.14em] text-white/92 antialiased transition-[color,opacity] duration-200 hover:text-white sm:min-h-0 sm:px-2 sm:py-1.5 sm:text-sm sm:tracking-[0.16em] sm:hover:underline sm:underline-offset-[6px]";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-white/10 bg-[#003F73] shadow-[0_1px_0_rgb(0,0,0,0.06)]">
      <div className="mx-auto flex h-full max-w-[1290px] flex-col justify-center gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 lg:px-6">
        <div className="flex min-w-0 items-center">
          <a
            href="#main-content"
            className="relative flex shrink-0 items-center rounded-sm py-1 transition-opacity duration-200 hover:opacity-90"
          >
            <Image
              src="/images/hologow.svg"
              alt="HealthOptix"
              width={168}
              height={53}
              sizes="(max-width: 640px) 120px, 168px"
              className="h-auto w-[120px] sm:w-[168px]"
              priority
            />
          </a>
          <p className="ml-3 max-w-40 border-l border-white/25 pl-3 text-[9px] font-light leading-snug tracking-[0.07em] text-white/90 sm:ml-5 sm:max-w-none sm:pl-5 sm:text-[11px] sm:leading-normal md:text-sm">
            When Health Meets Technology
          </p>
        </div>
        <nav
          className="flex w-full shrink-0 items-center justify-between gap-1 sm:w-auto sm:justify-end"
          aria-label="Primary"
        >
          {navItems.map(({ href, label }) => (
            <a key={href} href={href} className={navLinkClass}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
