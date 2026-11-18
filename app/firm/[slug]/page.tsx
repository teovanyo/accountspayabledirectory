import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Globe, MapPin, Phone, Star } from "lucide-react";
import {
  FIRM_TYPE_LABELS,
  firmTypes,
  getCity,
  getFirm,
  getIndex,
  stateName,
} from "@/lib/data";
import { getFirmContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/Nav";
import { FirmCard } from "@/components/FirmCard";
import { FirmLogo } from "@/components/FirmLogo";
import { FirmReview } from "@/components/FirmReview";
import { FirmComparison } from "@/components/FirmComparison";
import { FirmFaqList } from "@/components/FirmFaqList";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

type Props = { params: Promise<{ slug: string }> };

const BASE = "https://accountspayabledirectory.com";

function tagHref(tag: string) {
  const t = tag.toLowerCase();
  if (/automation|software|platform|procure|p2p|spend/.test(t)) return "/type/automation";
  if (/invoice|document|scanning|data entry/.test(t)) return "/type/invoice";
  if (/bookkeep|accounting|accountant|cpa|tax|payroll/.test(t)) return "/type/bookkeeping";
  if (/bpo|outsourc|offshore|shared service|staffing/.test(t)) return "/type/bpo";
  return `/search?q=${encodeURIComponent(tag)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const firm = getFirm(slug);
  if (!firm) return { title: "Firm not found" };
  const content = getFirmContent(firm);
  const canonical = `${BASE}/firm/${firm.slug}`;
  const title = content.metaTitle;
  const description = content.metaDescription;

  return {
    title: { absolute: title },
    description,
    keywords: content.keywords,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "Accounts Payable Directory",
      title,
      description,
      modifiedTime: content.generatedAt,
      authors: ["Accounts Payable Directory Editorial Team"],
      tags: content.tags,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
    other: {
      "article:section": "Accounts payable",
      "article:tag": content.tags.join(", "),
    },
  };
}

export default async function FirmPage({ params }: Props) {
  const { slug } = await params;
  const firm = getFirm(slug);
  if (!firm) notFound();

  const content = getFirmContent(firm);
  const idx = getIndex();
  const cityFirms = getCity(firm.state, firm.citySlug);
  const siblings = [...cityFirms]
    .filter((f) => f.slug !== firm.slug)
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0) || (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);
  const types = firmTypes(firm);
  const canonical = `${BASE}/firm/${firm.slug}`;
  const nearby = (idx.citiesByState.get(firm.state) || [])
    .filter((c) => c.city !== firm.city)
    .slice(0, 8);

  const typeLabels = types.map((t) => FIRM_TYPE_LABELS[t]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: content.metaTitle,
        description: content.metaDescription,
        dateModified: content.generatedAt,
        isPartOf: { "@type": "WebSite", "@id": `${BASE}/#website` },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": `${canonical}#business` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: stateName(firm.state),
            item: `${BASE}/state/${firm.state.toLowerCase()}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: firm.city,
            item: `${BASE}/state/${firm.state.toLowerCase()}/${firm.citySlug}`,
          },
          { "@type": "ListItem", position: 4, name: firm.name, item: canonical },
        ],
      },
      {
        "@type": "AccountingService",
        "@id": `${canonical}#business`,
        name: firm.name,
        telephone: firm.phone || undefined,
        url: firm.website || canonical,
        sameAs: firm.website || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: firm.address ? firm.address.split(",")[0] : undefined,
          addressLocality: firm.city,
          addressRegion: firm.state,
          postalCode: firm.zip || undefined,
          addressCountry: "US",
        },
        areaServed: [
          { "@type": "City", name: firm.city },
          { "@type": "State", name: stateName(firm.state) },
        ],
        knowsAbout: typeLabels,
        aggregateRating:
          firm.rating != null && firm.reviews
            ? {
                "@type": "AggregateRating",
                ratingValue: firm.rating,
                reviewCount: firm.reviews,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: stateName(firm.state), href: `/state/${firm.state.toLowerCase()}` },
          { label: firm.city, href: `/state/${firm.state.toLowerCase()}/${firm.citySlug}` },
          { label: firm.name },
        ]}
      />

      <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <header className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <FirmLogo name={firm.name} website={firm.website} size={56} />
              <div className="min-w-0">
                <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                  {firm.name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-stone-600">
                  <MapPin className="h-4 w-4 text-stone-500" aria-hidden />
                  {firm.city}, {stateName(firm.state)}
                  {firm.zip ? ` ${firm.zip}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {firm.rating != null ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                  {firm.rating.toFixed(1)}
                  {firm.reviews ? (
                    <span className="font-normal text-amber-800/70">
                      · {firm.reviews.toLocaleString()} public reviews
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="rounded-lg bg-stone-100 px-3 py-1.5 text-sm text-stone-600">
                  No public rating listed
                </span>
              )}
              {types.map((t) => (
                <Link
                  key={t}
                  href={`/type/${t}`}
                  className="rounded-lg bg-brand/5 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10"
                >
                  {FIRM_TYPE_LABELS[t]}
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  Address
                </p>
                <p className="mt-1 text-stone-800">{firm.address || `${firm.city}, ${firm.state}`}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  Phone
                </p>
                {firm.phone ? (
                  <a
                    href={`tel:${firm.phone.replace(/[^+\d]/g, "")}`}
                    className="mt-1 inline-block font-medium text-brand hover:underline"
                  >
                    {firm.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-stone-500">Not listed</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  Website
                </p>
                {firm.website ? (
                  <a
                    href={firm.website}
                    target="_blank"
                    rel="nofollow noopener"
                    className="mt-1 inline-block break-all text-brand hover:underline"
                  >
                    {firm.website}
                  </a>
                ) : (
                  <p className="mt-1 text-stone-500">Not listed</p>
                )}
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
              <BadgeCheck className="h-4 w-4 text-brand" aria-hidden />
              Company brief
            </div>
            {content.brief.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i} className="mt-3 text-[15px] leading-7 text-stone-700">
                {paragraph}
              </p>
            ))}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {content.tags.map((tag) => (
                <Link
                  key={tag}
                  href={tagHref(tag)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[12px] text-stone-700 hover:border-brand/40 hover:text-brand"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          <FirmReview content={content} />

          <FirmComparison firm={firm} cityFirms={cityFirms} />

          <div className="mt-8">
            <StealthAgentsAd
              variant="strip"
              image="flatlay"
              placement="firm-inline"
              headline="Offload invoice intake, vendor follow-ups and payment tracking."
              body="Stealth Agents accounts payable assistants work inside your ERP, AP platform and existing workflow, from day one."
              cta="See the service"
            />
          </div>

          <FirmFaqList faqs={content.faqs} firmName={firm.name} />

          {siblings.length ? (
            <section className="mt-12" aria-labelledby="other-city-firms">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="other-city-firms" className="font-display text-2xl tracking-tight">
                    More accounts payable providers in {firm.city}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Compare {firm.name} with other firms listed in the same city.
                  </p>
                </div>
                <Link
                  href={`/state/${firm.state.toLowerCase()}/${firm.citySlug}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  See all {cityFirms.length} firms in {firm.city} →
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {siblings.map((f) => (
                  <FirmCard key={f.slug} firm={f} />
                ))}
              </div>
            </section>
          ) : null}

          {nearby.length ? (
            <section className="mt-12" aria-labelledby="nearby-cities">
              <h2 id="nearby-cities" className="font-display text-xl tracking-tight">
                Accounts payable providers in nearby cities
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {nearby.map((c) => (
                  <Link
                    key={c.city}
                    href={`/state/${firm.state.toLowerCase()}/${c.slug}`}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[13px] text-stone-700 transition hover:border-brand/50 hover:text-brand"
                  >
                    {c.city} <span className="text-stone-500">({c.count})</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-ink">Contact {firm.name}</p>
            <div className="mt-3 space-y-2">
              {firm.phone ? (
                <a
                  href={`tel:${firm.phone.replace(/[^+\d]/g, "")}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call {firm.phone}
                </a>
              ) : null}
              {firm.website ? (
                <a
                  href={firm.website}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-brand/50 hover:text-brand"
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  Visit website
                </a>
              ) : null}
              {firm.lat != null && firm.lon != null ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${firm.lat},${firm.lon}`}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-brand/50 hover:text-brand"
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  Open in Maps
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-stone-500">
              Listing data comes from public business profiles and may be out of date. Always confirm
              fees, licensing and terms directly with the firm.
            </p>
            <Link
              href="/about"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline"
            >
              Suggest a correction <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
              At a glance
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">AP services</dt>
                <dd className="text-right font-medium text-ink">{typeLabels.join(", ")}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Firms in {firm.city}</dt>
                <dd className="font-medium text-ink">{cityFirms.length.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Public reviews</dt>
                <dd className="font-medium text-ink">
                  {firm.reviews ? firm.reviews.toLocaleString() : "Not listed"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4">
            <StealthAgentsAd
              variant="card"
              image="desk"
              placement="firm-aside"
              headline="Hire an accounts payable assistant in 48 hours."
              body="Invoice intake, vendor setup, payment runs and month-end support handled by a dedicated, AP-trained assistant."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
