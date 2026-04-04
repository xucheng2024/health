import Image from "next/image";
import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowSquareOut,
  BookOpen,
  Calendar,
  CaretCircleRight,
  ChartBar,
  CheckCircle,
  Envelope,
  GraduationCap,
  Lightbulb,
  MapPin,
  ThumbsUp,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "./site-header";

/** One primary column so section titles, cards, and CTAs share the same silhouette */
const shell = "mx-auto w-full max-w-[var(--page-max)]";

/** White surface: shared chrome for all elevated panels */
const contentCard =
  "overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-(--shadow-card) ring-1 ring-slate-900/4";

/** Vertical gap between major stacked blocks (below a band title or between cards) */
const sectionStackGap = "mt-10 sm:mt-12";

/** Tier 1: Full-width band headings (Who we are / What we do) — neutral, largest band style */
const sectionBandTitle =
  "text-center text-[1.35rem] font-semibold leading-snug tracking-tight text-[#303030] text-balance sm:text-[1.75rem]";

/** Tier 2: Primary title inside white cards (Health Systems, HealthTech, Knowledge & Training) */
const cardPrimaryTitle =
  "text-center text-[1.4rem] font-semibold leading-snug tracking-tight text-[#003F73] text-balance sm:text-[1.65rem] lg:text-[1.85rem]";

/** Tier 3: Sub-heading inside a card (e.g. MyClinic System) */
const cardSubsectionTitle =
  "text-center text-[1.15rem] font-semibold leading-snug tracking-tight text-[#003F73] sm:text-[1.25rem]";

/** Tier 2 (split layout): Mission — same visual weight as card primary, left-aligned */
const missionTitle =
  "text-left text-[1.375rem] font-semibold leading-snug tracking-tight text-[#003F73] sm:text-[1.625rem] lg:text-[1.75rem]";

/** Long-form copy: readable measure + line height (left-aligned inside centered column) */
const proseBody =
  "max-w-prose text-left text-[15px] leading-[1.75] text-[#303030]/95 sm:text-[16px]";
const proseBodyCenter = `${proseBody} mx-auto text-pretty`;
/** Short lead under section titles */
const sectionLead =
  "text-center text-[16px] font-medium leading-snug text-[#303030] sm:text-[17px]";
const sectionLeadMuted =
  "text-center text-[15px] leading-relaxed text-[#303030]/75 sm:text-[16px]";
/** Small caps label before lists (+ optional Phosphor icon) */
const listSectionLabelClass =
  "text-[13px] font-semibold uppercase tracking-[0.14em] text-[#003F73] sm:text-sm";

function ListSectionLabel({
  icon: Icon,
  children,
}: {
  icon: Icon;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`mt-10 flex max-w-prose items-center gap-2 text-left ${listSectionLabelClass}`}
    >
      <Icon
        className="h-4 w-4 shrink-0 text-[#003F73]"
        weight="duotone"
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}

/** List markers — vary by section so long pages are not all checkmarks */
type ListMarker = "check" | "dot" | "chevron" | "line";

function ListMarkerLead({ variant }: { variant: ListMarker }) {
  switch (variant) {
    case "check":
      return (
        <CheckCircle
          className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#003F73]"
          weight="duotone"
          aria-hidden
        />
      );
    case "dot":
      return (
        <span
          className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#003F73]"
          aria-hidden
        />
      );
    case "chevron":
      return (
        <CaretCircleRight
          className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#003F73]/70"
          weight="duotone"
          aria-hidden
        />
      );
  }
}

function ListRow({
  children,
  marker = "check",
}: {
  children: React.ReactNode;
  marker?: ListMarker;
}) {
  if (marker === "line") {
    return (
      <li className="relative pl-5 leading-relaxed text-[#303030]/95">
        <span
          className="absolute top-1 bottom-1 left-0 w-[3px] rounded-full bg-linear-to-b from-[#003F73]/55 via-[#003F73]/22 to-[#003F73]/8"
          aria-hidden
        />
        {children}
      </li>
    );
  }
  return (
    <li className="flex gap-3">
      <ListMarkerLead variant={marker} />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Inline subheading (sentence case, not all-caps) */
const blockHeading =
  "text-left text-[15px] font-semibold text-[#003F73] sm:text-base";

/** Cover photos: Next image pipeline (WebP/AVIF, responsive width, lazy by default). */
function CoverImage({
  src,
  alt,
  sizes,
  priority,
  objectClassName = "object-cover object-center",
  pillarHover,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  objectClassName?: string;
  /** Slight zoom on card hover (What we do); disabled when user prefers reduced motion. */
  pillarHover?: boolean;
}) {
  const hoverZoom =
    pillarHover === true
      ? " transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      : "";
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={80}
      className={`${objectClassName}${hoverZoom}`}
    />
  );
}

/** Section spotlight (MyClinic / HealthTech / Knowledge): compact 16:9, pre-sized WebP, low fetch priority. */
const sectionSpotlightFrame =
  "relative mx-auto mt-8 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/50 shadow-sm ring-1 ring-slate-900/5 sm:mt-10";

function SectionSpotlightImage({
  src,
  alt,
  objectClassName = "object-cover object-center",
}: {
  src: string;
  alt: string;
  objectClassName?: string;
}) {
  return (
    <div className={sectionSpotlightFrame}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 672px"
        quality={74}
        fetchPriority="low"
        className={objectClassName}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200/55 bg-linear-to-b from-white via-slate-50/30 to-white">
      <div className={`${shell} px-4 py-10 sm:px-6 sm:py-12`}>
        <h2 className={sectionBandTitle}>
          {children}
        </h2>
        <div
          className="mx-auto mt-4 h-px w-16 max-w-full bg-linear-to-r from-transparent via-[#003F73]/35 to-transparent sm:mt-5"
          aria-hidden
        />
      </div>
    </div>
  );
}

function TechFeature({
  title,
  bullets,
  children,
}: {
  title: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 transition-[border-color,box-shadow] duration-200 hover:border-[#003F73]/25 hover:shadow-sm sm:gap-5 sm:p-5 motion-reduce:transition-none">
      <div
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#003F73]/10 text-[#003F73] [&>svg]:block [&>svg]:h-6 [&>svg]:w-6"
        aria-hidden
      >
        {children}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[17px] font-semibold tracking-tight text-[#003F73] sm:text-[18px]">
          {title}
        </h3>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-[#303030]/95 sm:text-[15px]">
          {bullets.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span
                className="mt-[0.4rem] h-1 w-1 shrink-0 rounded-full bg-[#003F73]/55"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="bg-surface-muted pb-10 pt-[98px] sm:pb-14"
        tabIndex={-1}
      >
        <h1 className="sr-only">
          HealthOptix — When Health Meets Technology
        </h1>
        <a id="who-we-are" className="invisible scroll-mt-[110px]" />
        <SectionTitle>Who we are</SectionTitle>

        {/* Who we are + Mission — single card, two stacked rows (image|text then text|image) */}
        <section className={`${shell} px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10`}>
          <div className={contentCard}>
            <div className="grid lg:grid-cols-12 lg:items-stretch">
              <div className="relative order-1 aspect-video w-full min-h-0 lg:col-span-5 lg:aspect-auto lg:min-h-[400px] lg:h-full">
                <CoverImage
                  src="/images/who-we-are-clinic-healthtech.jpg"
                  alt=""
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  priority
                  objectClassName="object-cover object-center"
                />
              </div>
              <div className="order-2 flex flex-col justify-center space-y-6 px-6 py-10 sm:px-12 sm:py-12 lg:col-span-7">
                <p className="max-w-prose text-left text-[18px] font-semibold leading-snug tracking-tight text-[#303030] sm:text-[22px]">
                  HealthOptix is a Health System and
                  <br />
                  Solution provider.
                </p>
                <div>
                  <p className={blockHeading}>We design and apply</p>
                  <ul className="mt-4 max-w-prose space-y-2.5 text-[16px] leading-relaxed text-[#303030] sm:text-[18px]">
                    <ListRow marker="dot">Integrated systems</ListRow>
                    <ListRow marker="dot">Technology-enabled solutions</ListRow>
                    <ListRow marker="dot">Knowledge programmes</ListRow>
                  </ul>
                </div>
                <p className="max-w-prose text-left text-[16px] leading-relaxed text-[#303030]/90 sm:text-[18px]">
                  across Health &amp; Wellness Providers,
                  <br />
                  Organisations, and Communities.
                </p>
              </div>
            </div>

            <div className="grid bg-slate-50/45 lg:grid-cols-12 lg:items-stretch">
              <div className="order-2 flex min-h-0 flex-col justify-center px-8 py-12 sm:px-12 sm:py-14 lg:order-1 lg:col-span-5 lg:justify-center lg:pl-12 lg:pr-8">
                <h2 className={missionTitle}>
                  Mission
                </h2>
                <div className="mt-7 flex gap-4 sm:mt-8 sm:gap-5">
                  <Lightbulb
                    className="mt-1 h-5 w-5 shrink-0 text-[#303030] sm:h-6 sm:w-6"
                    weight="duotone"
                    aria-hidden
                  />
                  <p className="max-w-md text-left text-[16px] leading-[1.85] text-[#303030]/92 sm:text-[17px]">
                    Bring &apos;Knowledge, Tech, Insight, Imagination&apos; together
                    to shape Health &amp; Wellbeing for our Community.
                  </p>
                </div>
              </div>
              <div className="relative order-1 flex min-h-[260px] items-center justify-center bg-slate-50/25 px-4 py-6 sm:min-h-[300px] sm:px-8 sm:py-10 lg:order-2 lg:col-span-7 lg:min-h-[min(480px,70vh)] lg:bg-transparent lg:p-10">
                <div className="relative aspect-[4/5] w-full max-w-[min(100%,420px)] lg:aspect-auto lg:max-h-[min(440px,52vh)] lg:max-w-none lg:h-[min(440px,52vh)] lg:w-full">
                  <CoverImage
                    src="/images/shutterstock_1438511402.png"
                    alt=""
                    sizes="(max-width: 1023px) 90vw, 480px"
                    objectClassName="object-contain object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div id="what-we-do" className={`scroll-mt-[110px] ${sectionStackGap}`}>
          <SectionTitle>What we do</SectionTitle>
        </div>

        {/* What we do — image on top, copy below (three pillars); use <a> for reliable same-page hash scroll */}
        <section className={`${shell} grid gap-5 px-4 pb-2 pt-8 sm:grid-cols-3 sm:gap-5 sm:px-6 sm:pt-10 lg:px-8`}>
          <a
            href="#workplace"
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-[#303030] shadow-(--shadow-card) ring-1 ring-slate-900/4 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover) hover:ring-slate-900/8"
          >
            <div className="relative aspect-3/2 w-full">
              <CoverImage
                src="/images/what-we-do-health-systems.png"
                alt=""
                sizes="(max-width: 639px) 100vw, (max-width: 1152px) 33vw, 384px"
                objectClassName="object-cover object-[50%_62%] sm:object-[50%_58%]"
                pillarHover
              />
            </div>
            <div className="flex flex-1 flex-col px-4 pb-5 pt-6 text-center sm:px-5">
              <h3 className="text-[17px] font-semibold tracking-tight text-[#003F73] sm:text-[19px]">
                Health Systems
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#303030]/90 sm:text-[15px]">
                Technology platforms for
                <br />
                healthcare operations
              </p>
            </div>
          </a>
          <a
            href="#tech-enabled-solutions"
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-[#303030] shadow-(--shadow-card) ring-1 ring-slate-900/4 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover) hover:ring-slate-900/8"
          >
            <div className="relative aspect-3/2 w-full">
              <CoverImage
                src="/images/customisedhealthprogramsforworkplaces.jpg"
                alt=""
                sizes="(max-width: 639px) 100vw, (max-width: 1152px) 33vw, 384px"
                objectClassName="object-cover object-center"
                pillarHover
              />
            </div>
            <div className="flex flex-1 flex-col px-4 pb-5 pt-6 text-center sm:px-5">
              <h3 className="text-[17px] font-semibold tracking-tight text-[#003F73] sm:text-[19px]">
                <span className="block">Tech-Enabled Health</span>
                <span className="block">Solutions</span>
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#303030]/90 sm:text-[15px]">
                Applying technology to
                <br />
                deliver health &amp; wellness
                <br />
                solutions at scale
              </p>
            </div>
          </a>
          <a
            href="#knowledge-training"
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-[#303030] shadow-(--shadow-card) ring-1 ring-slate-900/4 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover) hover:ring-slate-900/8"
          >
            <div className="relative aspect-3/2 w-full">
              <CoverImage
                src="/images/education-in-micronutrition_unsplash-u1552-fr.jpg"
                alt=""
                sizes="(max-width: 639px) 100vw, (max-width: 1152px) 33vw, 384px"
                objectClassName="object-cover object-center"
                pillarHover
              />
            </div>
            <div className="flex flex-1 flex-col px-4 pb-5 pt-6 text-center sm:px-5">
              <h3 className="text-[17px] font-semibold tracking-tight text-[#003F73] sm:text-[19px]">
                Knowledge &amp; Training
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#303030]/90 sm:text-[15px]">
                Bridging knowledge,
                <br />
                practice, and real-life
                <br />
                application
              </p>
            </div>
          </a>
        </section>

        <div className={`${shell} mt-4 flex flex-col justify-center gap-3 px-4 pb-10 sm:flex-row sm:gap-5 sm:px-6 sm:pb-12 lg:px-8`}>
          <div className="flex flex-1 justify-center">
            <a
              href="#workplace"
              className="inline-flex min-w-30 items-center justify-center rounded-full border-2 border-[#003F73] bg-[#003F73] px-8 py-2.5 text-center text-[15px] font-medium tracking-wide text-white transition-colors duration-200 hover:bg-white hover:text-[#003F73] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              more
            </a>
          </div>
          <div className="flex flex-1 justify-center">
            <a
              href="#tech-enabled-solutions"
              className="inline-flex min-w-30 items-center justify-center rounded-full border-2 border-[#003F73] bg-[#003F73] px-8 py-2.5 text-center text-[15px] font-medium tracking-wide text-white transition-colors duration-200 hover:bg-white hover:text-[#003F73] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              more
            </a>
          </div>
          <div className="flex flex-1 justify-center">
            <a
              href="#knowledge-training"
              className="inline-flex min-w-30 items-center justify-center rounded-full border-2 border-[#003F73] bg-[#003F73] px-8 py-2.5 text-center text-[15px] font-medium tracking-wide text-white transition-colors duration-200 hover:bg-white hover:text-[#003F73] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              more
            </a>
          </div>
        </div>

        {/* Workplace — Health Systems / MyClinic */}
        <section
          id="workplace"
          className={`${shell} scroll-mt-[110px] ${sectionStackGap} ${contentCard} px-5 pb-14 pt-10 text-[#303030] sm:px-10 sm:pt-12 sm:pb-16 lg:px-12`}
        >
          <h2 className={cardPrimaryTitle}>
            Health Systems
          </h2>
          <p className={`mt-4 ${sectionLead}`}>
            Technology platforms for healthcare operations.
          </p>
          <p className={`mt-8 ${proseBodyCenter}`}>
            We provide smart systems with clinical standard, to support health
            &amp; wellness providers in managing operations, patient journeys, and
            business performance.
          </p>

          <h3 className={`mt-12 border-t border-slate-100 pt-10 ${cardSubsectionTitle}`}>
            MyClinic System
          </h3>
          <p className={`mt-4 ${sectionLeadMuted}`}>
            A dedicated SaaS platform designed for modern clinics / health &amp;
            wellness centres.
          </p>

          <SectionSpotlightImage
            src="/images/myclinic-saas-dashboard.webp"
            alt="MyClinic clinic management dashboard on a laptop, with sidebar navigation and daily overview"
            objectClassName="object-cover object-center"
          />

          <ListSectionLabel icon={Users}>Suitable for</ListSectionLabel>
          <ul className="mt-4 max-w-prose space-y-3.5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-5 text-[15px] leading-relaxed text-[#303030]/95 sm:px-5 sm:text-[16px]">
            <ListRow marker="chevron">
              TCM, chiropractic, integrative or lifestyle medicine practices
            </ListRow>
            <ListRow marker="chevron">Aesthetic, preventive health centres</ListRow>
            <ListRow marker="chevron">
              Physiotherapy, rehabilitation, and recovery providers
            </ListRow>
            <ListRow marker="chevron">Health screening providers</ListRow>
            <ListRow marker="chevron">
              Wellness providers, including studios and centres offering
              structured wellness services
            </ListRow>
            <ListRow marker="chevron">
              Growing practices seeking better efficiency, patient management,
              and scalability
            </ListRow>
          </ul>

          <p className="mt-12 text-center">
            <Link
              href="https://sgmyclinic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#003F73]/20 bg-[#003F73]/6 px-5 py-2.5 text-[16px] font-semibold text-[#003F73] transition-colors duration-200 hover:border-[#003F73]/40 hover:bg-[#003F73]/10 sm:text-[17px]"
            >
              Explore MyClinic
              <ArrowSquareOut className="h-4 w-4 shrink-0" weight="bold" aria-hidden />
            </Link>
          </p>
        </section>

        {/* HealthTech — separate card from Health Systems */}
        <section
          id="tech-enabled-solutions"
          className={`${shell} scroll-mt-[110px] ${sectionStackGap} ${contentCard} px-5 pb-14 pt-10 text-[#303030] sm:px-10 sm:pt-12 sm:pb-16 lg:px-12`}
        >
          <h2 className={cardPrimaryTitle}>
            HealthTech-Enabled Solutions at Workplace and Community
          </h2>
          <p className={`mt-4 ${sectionLead}`}>
            Applying technology to deliver health &amp; wellness solutions at
            scale.
          </p>
          <p className="mx-auto mt-5 max-w-prose text-center text-[14px] leading-relaxed text-[#303030]/70 sm:text-[15px]">
            This is a programme designed for Employee / Community Satisfactory
            &amp; Healthcare Cost Saving.
          </p>

          <SectionSpotlightImage
            src="/images/healthtech-workplace-consultation.webp"
            alt="Health professional consulting with two people at a small table with a tablet in a bright modern office"
            objectClassName="object-cover object-[50%_45%]"
          />

          <div className="mx-auto mt-10 max-w-[640px] space-y-6 sm:space-y-7">
            <TechFeature
              title="Service at your doorstep"
              bullets={[
                "Flexible time slot, take any time according to your designated time period",
              ]}
            >
              <Calendar className="h-6 w-6" weight="duotone" aria-hidden />
            </TechFeature>
            <TechFeature
              title="Better experience"
              bullets={[
                "Non-invasive, non radiative, no blood test, no waiting time",
                "Cutting-edge European Health-tech",
              ]}
            >
              <ThumbsUp className="h-6 w-6" weight="duotone" aria-hidden />
            </TechFeature>
            <TechFeature
              title="Easily understandable visual data"
              bullets={[
                "Identify risks from suboptimal health to disease stages",
              ]}
            >
              <ChartBar className="h-6 w-6" weight="duotone" aria-hidden />
            </TechFeature>
          </div>
        </section>

        {/* Knowledge & Training */}
        <section
          id="knowledge-training"
          className={`${shell} scroll-mt-[110px] ${sectionStackGap} ${contentCard} px-5 pb-14 pt-10 text-[#303030] sm:px-10 sm:pt-12 sm:pb-16 lg:px-12`}
        >
          <h2 className={cardPrimaryTitle}>
            Knowledge &amp; Training
          </h2>
          <p className={`mt-4 ${sectionLead}`}>
            Bridging knowledge, practice, and real-life application.
          </p>
          <p className={`mt-8 ${proseBodyCenter}`}>
            We provide structured education and training in Healthcare and Healthtech
            solutions, designed to translate science, data, and systems into
            practical understanding and everyday use.
          </p>

          <SectionSpotlightImage
            src="/images/knowledge-training-presentation.webp"
            alt="Presenter leading a professional training session in a modern meeting room with data on screen"
            objectClassName="object-cover object-[50%_42%]"
          />

          <ListSectionLabel icon={GraduationCap}>
            Our programmes focus on helping participants to
          </ListSectionLabel>
          <ul className="mt-4 max-w-prose space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-5 text-[15px] leading-relaxed text-[#303030]/95 sm:px-5 sm:text-[16px]">
            <ListRow marker="line">
              Apply healthtech into real-world settings and decision-making
            </ListRow>
            <ListRow marker="line">
              Integrate technology and data into health management and services
            </ListRow>
            <ListRow marker="line">
              Build practical capabilities in delivering health and wellbeing
              solutions
            </ListRow>
          </ul>

          <ListSectionLabel icon={BookOpen}>Offerings include</ListSectionLabel>
          <ul className="mt-4 max-w-prose space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-5 text-[15px] leading-relaxed text-[#303030]/95 sm:px-5 sm:text-[16px]">
            <ListRow marker="check">Professional training programmes</ListRow>
            <ListRow marker="check">Health and wellbeing workshops</ListRow>
            <ListRow marker="check">
              Applied learning for organisations and individuals
            </ListRow>
            <ListRow marker="check">
              Customised programmes for workplaces and communities
            </ListRow>
          </ul>
        </section>

        {/* Contact footer */}
        <a id="contact" className="invisible scroll-mt-[110px]" />
        <footer className="mt-4 border-t border-slate-200/65 bg-linear-to-b from-white to-slate-100/35 pb-4 pt-14 sm:mt-6 sm:pt-16">
          <div className={`${shell} px-4 text-center sm:px-6`}>
            <p className="text-[clamp(1.2rem,2.8vw,1.5rem)] font-semibold leading-snug tracking-[0.14em] text-[#003F73] sm:text-[1.35rem] lg:text-[1.5rem]">
              CONTACT
            </p>
            <div className="mx-auto mt-10 max-w-[682px] sm:mt-12">
              <div className="flex items-start justify-center gap-3 text-[17px] leading-relaxed tracking-wide text-[#003F73] sm:text-[21px]">
                <MapPin
                  className="mt-1 h-5 w-5 shrink-0 text-[#003F73]/85"
                  weight="duotone"
                  aria-hidden
                />
                <div className="space-y-1.5 text-left sm:space-y-2">
                  <p>
                    Level 37, Ocean Financial Centre, 10 Collyer Quay, Raffles
                    Place,
                  </p>
                  <p>049315, Singapore</p>
                </div>
              </div>
              <p className="mt-10 flex items-center justify-center gap-2 sm:mt-12">
                <Envelope
                  className="h-5 w-5 shrink-0 text-[#003F73]/85"
                  weight="duotone"
                  aria-hidden
                />
                <a
                  href="mailto:info@health-optix.com"
                  className="font-medium text-[#003F73] underline-offset-[6px] transition-[color,opacity] duration-200 hover:underline hover:opacity-90"
                >
                  info@health-optix.com
                </a>
              </p>
            </div>

            <div className="mt-14 flex flex-col items-center gap-8 sm:mt-16 sm:gap-10">
              <p className="text-center text-[13px] font-medium uppercase tracking-[0.2em] text-[#003F73]/70 sm:text-sm">
                Social media
              </p>
              <div className="flex flex-wrap items-center justify-center gap-9 sm:gap-12">
                <Link
                  href="https://www.instagram.com/healthoptix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block h-[22px] w-[22px] shrink-0 transition-transform duration-200 ease-out hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
                >
                  <Image
                    src="/images/instagram_1384031.svg"
                    alt="Instagram"
                    fill
                    sizes="22px"
                    className="object-cover"
                  />
                </Link>
                <Link
                  href="https://www.facebook.com/HealthOptix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003F73] transition-transform duration-200 ease-out hover:scale-110 hover:opacity-80 motion-reduce:transition-none motion-reduce:hover:scale-100"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <span className="inline-flex text-[#003F73]" aria-hidden>
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-[#003F73] py-3 text-center text-[10px] leading-snug tracking-wide text-white sm:mt-20">
            <p>
              © {new Date().getFullYear()} HEALTHOPTIX&nbsp; | Terms of Use &amp;{" "}
              <Link
                href="/privacypolicy"
                className="underline transition-opacity duration-200 hover:opacity-80"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
