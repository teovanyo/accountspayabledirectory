import { ArrowRight, Check } from "lucide-react";

const BASE_URL =
  "https://stealthagents.com/services/accounts-payable-assistant";

export const AD_IMAGES = {
  hero: "/ads/stealthagents-va-hero.jpg",
  team: "/ads/stealthagents-va-team.jpg",
  desk: "/ads/stealthagents-va-desk.jpg",
  flatlay: "/ads/stealthagents-va-flatlay.jpg",
} as const;

export type AdImage = keyof typeof AD_IMAGES;

export function stealthAgentsHref(placement: string) {
  const url = new URL(BASE_URL);
  url.searchParams.set("utm_source", "accountspayabledirectory");
  url.searchParams.set("utm_medium", "display");
  url.searchParams.set("utm_campaign", "accounts-payable-assistant");
  url.searchParams.set("utm_content", placement);
  return url.toString();
}

const BULLETS = [
  "Invoice processing",
  "Vendor onboarding",
  "Payment runs",
  "Month-end close",
];

type Variant = "band" | "card" | "strip";
type Tone = "light" | "dark";

type Props = {
  placement: string;
  variant?: Variant;
  tone?: Tone;
  image?: AdImage;
  headline?: string;
  body?: string;
  cta?: string;
  className?: string;
  eager?: boolean;
};

const DEFAULTS: Record<
  Variant,
  { headline: string; body: string; cta: string }
> = {
  band: {
    headline: "Clear the AP backlog without adding headcount.",
    body: "A dedicated accounts payable assistant handles invoice intake, coding, approvals, vendor records, payment runs and reconciliation inside Bill.com, NetSuite, QuickBooks, Coupa and your existing AP stack.",
    cta: "Hire an AP assistant",
  },
  card: {
    headline: "Hire an accounts payable assistant in 48 hours.",
    body: "Invoice processing, vendor setup, payment runs and month-end support handled by a dedicated, AP-trained assistant.",
    cta: "See the service",
  },
  strip: {
    headline: "Your AP inbox shouldn't own your week.",
    body: "Offload invoice processing, vendor inquiries and payment follow-ups to a dedicated Stealth Agents assistant.",
    cta: "See AP assistants",
  },
};

export function StealthAgentsAd({
  placement,
  variant = "band",
  tone = "light",
  image = "hero",
  headline,
  body,
  cta,
  className,
  eager = false,
}: Props) {
  const copy = DEFAULTS[variant];
  const title = headline ?? copy.headline;
  const description = body ?? copy.body;
  const ctaLabel = cta ?? copy.cta;
  const href = stealthAgentsHref(placement);
  const dark = tone === "dark";

  const shell = dark
    ? "border-brand-ink bg-brand text-white"
    : "border-stone-200 bg-white text-ink";
  const eyebrow = dark ? "text-accent" : "text-accent-ink";
  const bodyTone = dark ? "text-white/75" : "text-stone-600";
  const noteTone = dark ? "text-white/60" : "text-stone-500";
  const chipTone = dark
    ? "border-white/20 bg-white/5 text-white/80"
    : "border-stone-200 bg-stone-50 text-stone-700";
  const ctaTone = dark
    ? "bg-white text-brand group-hover:bg-stone-100"
    : "bg-brand text-white group-hover:bg-brand-light";
  const imgLoading = eager ? "eager" : "lazy";

  const label = (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${eyebrow}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      Sponsored by Stealth Agents
    </span>
  );

  if (variant === "card") {
    return (
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener"
        aria-label={`${title} Sponsored by Stealth Agents`}
        className={`group block overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${shell} ${className ?? ""}`}
      >
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AD_IMAGES[image]}
            alt="An accounts payable assistant working at a desk"
            loading={imgLoading}
            width={1024}
            height={768}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-brand-ink/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            Ad
          </span>
        </div>
        <div className="p-5">
          {label}
          <p className="mt-2 font-display text-xl leading-tight tracking-tight text-brand group-hover:text-brand-light">
            {title}
          </p>
          <p className={`mt-2 text-[13px] leading-5 ${bodyTone}`}>{description}</p>
          <span
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${ctaTone}`}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
          <p className={`mt-2 text-center text-[11px] ${noteTone}`}>
            48-hour placement · USA timezone · No contracts
          </p>
        </div>
      </a>
    );
  }

  if (variant === "strip") {
    return (
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener"
        aria-label={`${title} Sponsored by Stealth Agents`}
        className={`group flex flex-col gap-4 rounded-2xl border px-5 py-5 transition hover:border-brand/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${shell} ${className ?? ""}`}
      >
        <div className="flex min-w-0 items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AD_IMAGES[image]}
            alt=""
            loading={imgLoading}
            width={160}
            height={160}
            className="hidden h-16 w-16 shrink-0 rounded-xl object-cover sm:block"
          />
          <div className="min-w-0">
            {label}
            <p className="mt-1 font-display text-lg leading-snug tracking-tight text-brand group-hover:text-brand-light sm:text-xl">
              {title}
            </p>
            <p className={`mt-1 text-[13px] leading-5 ${bodyTone}`}>{description}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${ctaTone}`}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </a>
    );
  }

  return (
    <section className={`mx-auto max-w-6xl px-4 py-8 ${className ?? ""}`}>
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener"
        aria-label={`${title} Sponsored by Stealth Agents`}
        className={`group relative block overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-lg ${shell}`}
      >
        <div className="grid md:grid-cols-[1.08fr_0.92fr]">
          <div className="order-2 p-6 sm:p-8 md:order-1 md:p-10">
            {label}
            <p className="mt-3 font-display text-[1.65rem] leading-[1.1] tracking-tight sm:text-[2.1rem]">
              {title}
            </p>
            <p className={`mt-3 max-w-lg text-[14px] leading-6 ${bodyTone}`}>{description}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {BULLETS.map((b) => (
                <li
                  key={b}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${chipTone}`}
                >
                  <Check className="h-3 w-3" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${ctaTone}`}
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
              <span className={`text-[12px] ${noteTone}`}>
                48-hour placement · USA timezone · No long-term contracts
              </span>
            </div>
          </div>
          <div className="relative order-1 min-h-[170px] overflow-hidden md:order-2 md:min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AD_IMAGES[image]}
              alt="Stealth Agents accounts payable assistant at work"
              loading={imgLoading}
              width={1600}
              height={900}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-r ${
                dark ? "from-brand/80 via-brand/20 to-transparent" : "from-white/70 via-white/10 to-transparent"
              }`}
            />
            <span className="absolute right-3 top-3 rounded-md bg-brand-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
              Ad
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}
