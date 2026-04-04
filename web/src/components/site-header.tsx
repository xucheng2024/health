import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[98px] border-b border-white/10 bg-[#003F73] shadow-[0_1px_0_rgb(0,0,0,0.06)]">
      <div className="mx-auto flex h-full max-w-[1290px] items-center justify-between px-4 lg:px-6">
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
          <p className="ml-4 max-w-42 border-l border-white/25 pl-4 text-[9px] font-light leading-snug tracking-[0.07em] text-white/90 sm:ml-5 sm:max-w-none sm:pl-5 sm:text-[11px] sm:leading-normal md:text-sm">
            When Health Meets Technology
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center justify-end gap-4 text-[11px] font-medium tracking-[0.14em] text-white/95 sm:gap-8 sm:text-sm"
          aria-label="Primary"
        >
          <a
            href="#who-we-are"
            className="rounded-sm transition-[opacity,color] duration-200 hover:text-white sm:hover:underline"
          >
            Who we are
          </a>
          <a
            href="#what-we-do"
            className="rounded-sm transition-[opacity,color] duration-200 hover:text-white sm:hover:underline"
          >
            What we do
          </a>
          <a
            href="#contact"
            className="rounded-sm transition-[opacity,color] duration-200 hover:text-white sm:hover:underline"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
