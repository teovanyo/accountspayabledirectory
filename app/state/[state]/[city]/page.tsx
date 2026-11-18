import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FIRM_TYPE_LABELS, firmTypes, getCity, getIndex, stateName, filterCityFirms, type FirmType } from "@/lib/data";
import { Breadcrumbs, Pagination } from "@/components/Nav";
import { FirmCard } from "@/components/FirmCard";
import { Filters } from "@/components/Filters";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

type Props = {
  params: Promise<{ state: string; city: string }>;
  searchParams: Promise<{ page?: string; type?: string; site?: string; rating?: string; sort?: string }>;
};

function displayCity(state: string, citySlug: string) {
  const list = getCity(state.toUpperCase(), citySlug);
  return list[0]?.city || citySlug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city } = await params;
  const code = state.toUpperCase();
  const cityName = displayCity(code, city);
  const slug = getCity(code, city)[0]?.citySlug || city.toLowerCase();
  const firms = getCity(code, city);
  const count = firms.length;
  const year = new Date().getFullYear();
  const canonical = `https://accountspayabledirectory.com/state/${code.toLowerCase()}/${slug}`;
  const title = `Accounts Payable Companies in ${cityName}, ${code}`;
  const description = `Compare ${count} accounts payable companies in ${cityName}, ${stateName(
    code
  )}. Ratings, reviews, phone numbers, websites and specialties for local accounts payable providers. Updated ${year}.`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      `accounts payable ${cityName}`,
      `accounts payable companies ${cityName} ${code}`,
      `${cityName} accounts payable providers`,
      `accounts payable companies ${cityName}`,
      `accounts payable outsourcing ${cityName}`,
      `AP automation ${cityName}`,
      `invoice processing services ${cityName}`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Accounts Payable Directory",
      title,
      description,
    },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { state, city } = await params;
  const sp = await searchParams;
  const code = state.toUpperCase();
  const citySlug = decodeURIComponent(city);
  const firms = getCity(code, citySlug);
  if (!firms.length) notFound();

  const cityName = firms[0].city;
  const slug = firms[0].citySlug;
  const basePath = `/state/${code.toLowerCase()}/${slug}`;
  const perPage = 24;
  const current = Math.max(1, Number(sp.page) || 1);
  const filtered = filterCityFirms(firms, sp);
  const slice = filtered.slice((current - 1) * perPage, current * perPage);
  const pages = Math.ceil(filtered.length / perPage);
  const idx = getIndex();
  const nearby = (idx.citiesByState.get(code) || []).filter((c) => c.city !== cityName).slice(0, 10);
  const withSite = firms.filter((f) => f.website).length;
  const avgRating =
    firms.filter((f) => f.rating).reduce((s, f) => s + (f.rating || 0), 0) /
    Math.max(1, firms.filter((f) => f.rating).length);

  const typeCounts = new Map<FirmType, number>();
  for (const f of firms) {
    for (const t of firmTypes(f)) typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
  }
  const topTypes = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topType = topTypes[0]?.[0];
  const topFirms = [...firms]
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0) || (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);
  const topFirm = topFirms[0];
  const ratedCount = firms.filter((f) => f.rating != null).length;
  const year = new Date().getFullYear();
  const canonical = `https://accountspayabledirectory.com/state/${code.toLowerCase()}/${slug}`;

  const faqs = [
    {
      q: `How many accounts payable companies are in ${cityName}?`,
      a: `This directory lists ${firms.length} accounts payable ${
        firms.length === 1 ? "company" : "companies"
      } in ${cityName}, ${stateName(code)}. ${withSite} of them publish a website, and ${ratedCount} have a public rating. Coverage includes outsourced AP teams, automation platforms, invoice processors, bookkeeping firms and finance BPO providers where those specialties exist locally.`,
    },
    {
      q: `How much do accounts payable providers charge in ${cityName}?`,
      a: `Most US providers price by invoice volume or a dedicated FTE. Per-invoice processing commonly runs from a few cents for capture to several dollars for full processing, while dedicated staff are often priced monthly. ${cityName} pricing varies by systems, entity count and scope. Ask each provider for a written fee schedule, including exceptions, integrations and termination terms, because the headline rate is only part of the total cost.`,
    },
    {
      q: `How do I choose an accounts payable provider in ${cityName}?`,
      a: `Shortlist three providers that match your invoice volume and systems, then ask the same questions about pricing, ERP integrations, exception handling, security, reporting, coverage and termination. Read recent reviews for repeated complaints, ask for a sample month-end close, and compare the all-in monthly cost at your real volume rather than the headline per-invoice rate.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonical,
        url: canonical,
        name: `Accounts payable companies in ${cityName}, ${code}`,
        description: `Directory of ${firms.length} accounts payable companies in ${cityName}, ${stateName(code)}.`,
        isPartOf: { "@type": "WebSite", "@id": "https://accountspayabledirectory.com/#website" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": `${canonical}#firms` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://accountspayabledirectory.com/" },
          {
            "@type": "ListItem",
            position: 2,
            name: stateName(code),
            item: `https://accountspayabledirectory.com/state/${code.toLowerCase()}`,
          },
          { "@type": "ListItem", position: 3, name: cityName, item: canonical },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#firms`,
        name: `Accounts payable companies in ${cityName}, ${code}`,
        numberOfItems: topFirms.length,
        itemListElement: topFirms.map((f, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: f.name,
          url: `https://accountspayabledirectory.com/firm/${f.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-stone-200 bg-gradient-to-b from-white to-paper">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: stateName(code), href: `/state/${code.toLowerCase()}` },
              { label: cityName },
            ]}
          />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
                Accounts payable companies in {cityName}, {code}
              </h1>
              <p className="mt-2 max-w-2xl text-stone-600">
                {firms.length} accounts payable {firms.length === 1 ? "company" : "companies"} in{" "}
                {cityName}, {stateName(code)}. Compare services, ratings, phone numbers and websites.
              </p>
            </div>
            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Firms</dt>
                <dd className="text-xl font-semibold text-brand">{firms.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">With site</dt>
                <dd className="text-xl font-semibold text-brand">{withSite}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Avg rating</dt>
                <dd className="text-xl font-semibold text-brand">
                  {Number.isFinite(avgRating) && avgRating > 0 ? avgRating.toFixed(1) : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <StealthAgentsAd
        variant="band"
        image="desk"
        placement="city-top"
        headline="Running the books AND chasing invoices?"
        body="A dedicated accounts payable assistant can take invoice intake, vendor follow-ups and payment tracking off your plate, so your team can focus on analysis and growth."
        cta="Hire an AP assistant"
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Accounts payable services in {cityName}, {code}
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-stone-700">
              {cityName} has {firms.length} accounts payable {firms.length === 1 ? "company" : "companies"}{" "}
              listed in this directory, with {withSite} publishing a website and {ratedCount} carrying a
              public rating. The average rating among rated firms is{" "}
              {Number.isFinite(avgRating) && avgRating > 0 ? avgRating.toFixed(1) : "not yet available"}.
              {topFirm
                ? ` ${topFirm.name} has the highest public review volume in the city, with ${topFirm.reviews?.toLocaleString()} reviews.`
                : ""}
            </p>
            <p className="mt-3 text-[15px] leading-7 text-stone-700">
              {topType
                ? `The most common specialty here is ${FIRM_TYPE_LABELS[topType].toLowerCase()}, with ${
                    typeCounts.get(topType) || 0
                  } firms.`
                : "The local mix includes outsourced AP teams, automation platforms and specialist processors."}{" "}
              Finance teams should compare providers that match their invoice volume and systems instead of
              choosing the first listing. Use the filters above to narrow by specialty, website
              availability and minimum rating, then open two or three provider pages and compare pricing,
              integrations and service levels.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTypes.slice(0, 5).map(([t, n]) => (
                <Link
                  key={t}
                  href={`${basePath}?type=${t}`}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
                >
                  {FIRM_TYPE_LABELS[t]} <span className="text-stone-500">({n})</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-6 text-stone-500">
              Updated {year}. Listing data comes from public business profiles and may change; confirm
              fees, licensing and availability directly with each firm.
            </p>
          </div>
          <aside className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
              Market snapshot
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Firms listed</dt>
                <dd className="font-semibold text-ink">{firms.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">With a website</dt>
                <dd className="font-semibold text-ink">{withSite}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">With a rating</dt>
                <dd className="font-semibold text-ink">{ratedCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Average rating</dt>
                <dd className="font-semibold text-ink">
                  {Number.isFinite(avgRating) && avgRating > 0 ? avgRating.toFixed(1) : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Most common type</dt>
                <dd className="text-right font-semibold text-ink">
                  {topType ? FIRM_TYPE_LABELS[topType] : "-"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-5 text-stone-500">
              Snapshot from public business listings. Ratings are public business ratings, not
              AccountsPayableDirectory.com reviews.
            </p>
            <div className="mt-4">
              <StealthAgentsAd
                variant="card"
                image="desk"
                placement="city-aside"
                headline="Hire an AP assistant in 48 hours."
                body="Invoice intake, vendor setup, payment runs and month-end support handled by a dedicated, AP-trained assistant."
              />
            </div>
          </aside>
        </section>

        <Filters
          basePath={basePath}
          params={{ type: sp.type, site: sp.site, rating: sp.rating, sort: sp.sort }}
          total={firms.length}
          shown={filtered.length}
        />

        {slice.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {slice.slice(0, 8).map((f) => (
              <FirmCard key={f.slug} firm={f} />
            ))}
            <div className="col-span-full">
              <StealthAgentsAd
                variant="strip"
                image="flatlay"
                placement="city-listings-inline"
                headline="15-25 hours back every week."
                body="Accounts payable providers typically reclaim 15-25 hours a week by delegating repetitive admin to a dedicated Stealth Agents VA."
                cta="See the service"
              />
            </div>
            {slice.slice(8).map((f) => (
              <FirmCard key={f.slug} firm={f} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-medium">No firms match these filters.</p>
            <p className="mt-1 text-sm text-stone-600">
              Try clearing the filters or{" "}
              <Link href={basePath} className="text-brand underline">
                see all {firms.length} firms in {cityName}
              </Link>
              .
            </p>
          </div>
        )}

        <Pagination
          page={current}
          pages={pages}
          makeHref={(p) => {
            const qs = new URLSearchParams();
            if (sp.type) qs.set("type", sp.type);
            if (sp.site) qs.set("site", sp.site);
            if (sp.rating) qs.set("rating", sp.rating);
            if (sp.sort) qs.set("sort", sp.sort);
            if (p > 1) qs.set("page", String(p));
            const s = qs.toString();
            return `${basePath}${s ? `?${s}` : ""}`;
          }}
        />

        <section className="mt-14" aria-labelledby="city-faq-heading">
          <h2 id="city-faq-heading" className="font-display text-xl tracking-tight">
            Common questions about {cityName} accounts payable
          </h2>
          <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {faqs.map((faq) => (
              <details key={faq.q} className="group px-5 py-4 open:bg-stone-50/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                  {faq.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 text-stone-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {nearby.length ? (
          <section className="mt-14">
            <h2 className="font-display text-xl tracking-tight">Accounts payable providers in nearby cities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearby.map((c) => (
                <Link
                  key={c.city}
                  href={`/state/${code.toLowerCase()}/${c.slug}`}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[13px] text-stone-700 transition hover:border-brand/50 hover:text-brand"
                >
                  {c.city} <span className="text-stone-500">({c.count})</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
