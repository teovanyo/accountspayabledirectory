import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  Check,
  FileText,
  Globe,
  MapPin,
  Star,
  Workflow,
} from "lucide-react";
import { getHighlights, getIndex, FIRM_TYPE_LABELS } from "@/lib/data";
import { SearchBar } from "@/components/SearchBar";
import { FirmCard } from "@/components/FirmCard";
import { HomeContent } from "@/components/HomeContent";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

export const metadata: Metadata = {
  alternates: { canonical: "https://accountspayabledirectory.com" },
  keywords: [
    "accounts payable companies",
    "accounts payable services",
    "accounts payable outsourcing",
    "AP automation",
    "invoice processing services",
    "accounts payable providers near me",
    "outsourced AP",
    "finance and accounting outsourcing",
  ],
  openGraph: {
    type: "website",
    url: "https://accountspayabledirectory.com",
    siteName: "Accounts Payable Directory",
    title: "Accounts Payable Directory - The US Accounts Payable Company Directory",
    description:
      "Find accounts payable companies in every US state and city: phone numbers, websites, ratings and reviews.",
  },
};

const faqsFor = () => [
  {
    q: "How many accounts payable companies are there in the United States?",
    a: "This directory currently lists ${firmCount} accounts payable companies across all 51 states and Washington, D.C., covering AP outsourcing, automation, invoice processing, bookkeeping and finance BPO providers.",
  },
  {
    q: "How much does accounts payable outsourcing cost?",
    a: "Pricing usually follows invoice volume or a dedicated full-time equivalent. Per-invoice pricing often ranges from a few cents for high-volume capture to several dollars for full processing with approvals and exceptions. Dedicated offshore or nearshore AP staff are commonly priced as a monthly FTE. Request a written schedule that separates capture, processing, payments, software and onboarding.",
  },
  {
    q: "What does an accounts payable company do?",
    a: "It handles some or all of the invoice-to-pay cycle: receiving invoices, capturing and coding them, matching purchase orders and receipts, routing approvals, maintaining vendor records, scheduling payments, reconciling statements and supporting month-end close and audits.",
  },
  {
    q: "What is the difference between AP automation and AP outsourcing?",
    a: "AP automation is software that captures, codes, routes and pays invoices inside your own team. AP outsourcing is a service that runs the process for you, with people and often software included. Many companies combine both: an automation platform for workflow and an outsourced team for data entry, exceptions and vendor support.",
  },
  {
    q: "How do I choose an accounts payable provider?",
    a: "Start with invoice volume, entity count, currencies, ERP and payment methods. Then compare the provider's scope, pricing model, integrations, turnaround and exception SLAs, security certifications, references and exit terms. Ask for a sample invoice-to-pay workflow and a month-end close calendar.",
  },
  {
    q: "Is this directory free to use?",
    a: "Yes. Listings are free to browse and providers do not pay to appear. Data comes from public business profiles and is refreshed periodically; providers can request corrections or claim their listing.",
  },
  {
    q: "Are the reviews on this site customer reviews?",
    a: "No. The long company profiles are editorial summaries based on public business listing data. The star rating and review count come from the underlying public business profile. They are not our own customer reviews or paid endorsements.",
  },
  {
    q: "How are accounts payable companies ranked?",
    a: "Search and city pages default to public review volume so established providers surface first. You can re-sort by rating or name, and filter by specialty, website availability and minimum rating. The top-rated page uses a minimum rating and review threshold so a handful of reviews cannot dominate the list.",
  },
  {
    q: "Is an accounts payable service the same as a bookkeeper?",
    a: "Not exactly. A bookkeeper records transactions and reconciles accounts, and may handle bill payment as part of the monthly close. An AP specialist focuses on the invoice-to-pay workflow: invoice capture, coding, approvals, vendor management, payment runs and AP reporting. Some firms offer both.",
  },
  {
    q: "How do I compare AP providers in my city?",
    a: "Open your city page, shortlist three providers that match your invoice volume and systems, and ask each the same questions about pricing, integrations, exception handling, security and month-end reporting. The firm pages include a comparison table so you can see ratings, review volume and contact details side by side.",
  },
];

const TYPES: { key: string; label: string; blurb: string; icon: typeof FileText }[] = [
  { key: "outsourcing", label: FIRM_TYPE_LABELS.outsourcing, blurb: "Managed invoice-to-pay teams", icon: Building2 },
  { key: "automation", label: FIRM_TYPE_LABELS.automation, blurb: "AP workflow and payment software", icon: Workflow },
  { key: "invoice", label: FIRM_TYPE_LABELS.invoice, blurb: "Capture, OCR and data extraction", icon: FileText },
  { key: "bookkeeping", label: FIRM_TYPE_LABELS.bookkeeping, blurb: "Books, bill pay and month-end close", icon: Calculator },
  { key: "bpo", label: FIRM_TYPE_LABELS.bpo, blurb: "Offshore and shared-service finance teams", icon: Globe },
];

export default function HomePage() {
  const { firms, states, topCities } = getIndex();
  const { typeCounts, topRated, avgRating, ratedCount, reviewTotal } = getHighlights();
  const cityCount = topCities.length;
  const withSite = firms.filter((f) => f.website).length;
  const withPhone = firms.filter((f) => f.phone).length;
  const quickCities = topCities.slice(0, 6);
  const FAQS = faqsFor().map((f) => ({
    q: f.q,
    a: f.a.replace("${firmCount}", firms.length.toLocaleString()),
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative border-b border-stone-200 bg-gradient-to-b from-white via-paper to-paper">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-48 -top-32 h-[560px] w-[760px] rounded-full bg-brand/[0.07] blur-3xl" />
          <div className="absolute -left-40 top-40 h-[420px] w-[520px] rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,#e7e5e0_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e0_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,#000,transparent)]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/70 px-3 py-1 text-[12px] font-medium text-brand shadow-sm backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              Updated for November 2026
            </div>

            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.03] tracking-tight text-brand sm:text-6xl">
              Find an accounts payable
              <br className="hidden sm:block" /> company
              <br className="hidden sm:block" />{" "}
              <span className="relative whitespace-nowrap">
                you can trust
                <svg
                  aria-hidden
                  viewBox="0 0 240 12"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-accent/45"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9C52 3 188 3 238 9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
              {firms.length.toLocaleString()} accounts payable companies across {states.length}{" "}
              states, with phone numbers, websites, ratings and reviews. Free to browse, no signup.
            </p>

            <div className="mt-7 max-w-xl">
              <SearchBar />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-stone-600">
              <span className="font-medium text-stone-700">Popular:</span>
              {quickCities.map((c, i) => (
                <span key={`${c.state}-${c.city}`} className="flex items-center gap-1">
                  {i > 0 ? <span className="text-stone-300">·</span> : null}
                  <Link
                    href={`/state/${c.state.toLowerCase()}/${c.slug}`}
                    className="rounded px-0.5 hover:text-brand hover:underline"
                  >
                    {c.city}
                  </Link>
                </span>
              ))}
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-stone-600">
              {["Free to use", "No signup", `${states.length} states`].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand" aria-hidden />
                  {t}
                </li>
              ))}
              <li className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                <span>
                  <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span> average rating
                  across {ratedCount.toLocaleString()} firms
                </span>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,61,62,0.45)]">
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  Provider density · United States
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/5 px-2 py-0.5 text-[11px] font-medium text-brand">
                  <MapPin className="h-3 w-3" aria-hidden />
                  live dataset
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/us-firms-map.svg"
                alt="Map of the United States showing where accounts payable companies are concentrated"
                width={1000}
                height={620}
                className="h-auto w-full border-y border-stone-100"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[12px] text-stone-600">
                <span>
                  Every dot is a provider. <span className="font-semibold text-ink">{firms.length.toLocaleString()}</span>{" "}
                  across <span className="font-semibold text-ink">{cityCount.toLocaleString()}</span> cities
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
                  Public business data
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  With phone
                </p>
                <p className="text-xl font-semibold text-brand">{withPhone.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  With website
                </p>
                <p className="text-xl font-semibold text-brand">{withSite.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StealthAgentsAd
        variant="band"
        tone="dark"
        image="hero"
        eager
        placement="home-hero"
        headline="Clear the AP backlog without adding headcount."
        body="Dedicated accounts payable assistants handle invoice intake, coding, approvals, vendor records, payment runs and reconciliation inside Bill.com, NetSuite, QuickBooks, Coupa and your existing AP stack."
        cta="Hire an AP assistant"
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Browse by provider type</h2>
            <p className="mt-1 text-sm text-stone-600">Different providers solve different parts of the AP process.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={`/type/${t.key}`}
                className="group rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/5 text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{t.label}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-stone-600">{t.blurb}</p>
                <p className="mt-2 text-[12px] font-medium text-brand">
                  {(typeCounts[t.key] || 0).toLocaleString()} firms
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Browse by state</h2>
            <p className="mt-1 text-sm text-stone-600">Every state, every city. Pick a market.</p>
          </div>
          <Link href="/directory" className="text-sm font-medium text-brand hover:underline">
            All {states.length} states →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {states.slice(0, 12).map((s) => (
            <Link
              key={s.code}
              href={`/state/${s.code.toLowerCase()}`}
              className="group rounded-xl border border-stone-200 bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink group-hover:text-brand">{s.name}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-600">
                  {s.code}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-stone-600">
                {s.count.toLocaleString()} firms · {s.cities} cities
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Highest-rated AP providers</h2>
              <p className="mt-1 text-sm text-stone-600">
                Firms with 4.7★ or better, 250+ public reviews and one per specialty.
              </p>
            </div>
            <Link href="/top-rated" className="text-sm font-medium text-brand hover:underline">
              See top-rated →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((f) => (
              <FirmCard key={f.slug} firm={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Popular cities</h2>
            <p className="mt-1 text-sm text-stone-600">
              {reviewTotal.toLocaleString()} reviews across the directory so far.
            </p>
          </div>
          <Link href="/search" className="text-sm font-medium text-brand hover:underline">
            Search all →
          </Link>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {topCities.slice(0, 24).map((c) => (
            <Link
              key={`${c.state}-${c.city}`}
              href={`/state/${c.state.toLowerCase()}/${c.slug}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm transition hover:border-brand/40 hover:bg-brand/[0.02]"
            >
              <span className="font-medium">
                {c.city}, {c.state}
              </span>
              <span className="text-stone-600">{c.count} firms</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-4">
        <StealthAgentsAd
          variant="strip"
          image="flatlay"
          placement="home-mid"
          headline="Your AP inbox shouldn't own your week."
          body="Offload invoice processing, vendor inquiries and payment follow-ups to a dedicated Stealth Agents assistant."
          cta="See AP assistants"
        />
      </div>

      <HomeContent />

      <StealthAgentsAd
        variant="band"
        image="desk"
        placement="home-pre-faq"
        headline="Your best next hire, or your money back."
        body="Every Stealth Agents placement is backed by a best-hire guarantee. No long-term contracts, no office space, no benefits, just a dedicated accounts payable assistant."
        cta="Book a free consultation"
      />

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Common questions</h2>
          <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-5 py-4 open:bg-stone-50/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {f.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 text-stone-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-10 text-white sm:px-10">
          <div
            aria-hidden
            className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5 blur-2xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                Own or run an accounts payable company?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Claim your listing to correct details, update your website and phone number, or have
                the listing removed. It is free.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:bg-stone-100"
            >
              Claim a listing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
