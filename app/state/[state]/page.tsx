import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FIRM_TYPE_LABELS, firmTypes, getIndex, stateName, type FirmType } from "@/lib/data";
import { Breadcrumbs } from "@/components/Nav";
import { FirmCard } from "@/components/FirmCard";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const code = state.toUpperCase();
  const name = stateName(code);
  const idx = getIndex();
  const firms = idx.byState.get(code) || [];
  const cities = idx.citiesByState.get(code) || [];
  const year = new Date().getFullYear();
  const canonical = `https://accountspayabledirectory.com/state/${code.toLowerCase()}`;
  const title = `Accounts Payable Companies in ${name} (${year})`;
  const description = `Compare ${firms.length.toLocaleString()} accounts payable companies across ${cities.length} cities in ${name}. Browse by city, with ratings, reviews, phone numbers and websites.`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      `accounts payable ${name}`,
      `accounts payable companies ${name}`,
      `${name} accounts payable providers`,
      `accounts payable companies ${name}`,
      `accounts payable outsourcing ${name}`,
      `AP automation ${name}`,
      `invoice processing services ${name}`,
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

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const code = state.toUpperCase();
  const idx = getIndex();
  const firms = idx.byState.get(code);
  if (!firms) notFound();
  const cities = idx.citiesByState.get(code) || [];
  const name = stateName(code);
  const topFirms = [...firms].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 12);
  const withSite = firms.filter((f) => f.website).length;
  const rated = firms.filter((f) => f.rating != null);
  const avgRating = rated.length
    ? rated.reduce((sum, f) => sum + (f.rating || 0), 0) / rated.length
    : null;
  const typeCounts = new Map<FirmType, number>();
  for (const f of firms) {
    for (const t of firmTypes(f)) typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
  }
  const topTypes = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topCities = cities.slice(0, 12);
  const year = new Date().getFullYear();
  const canonical = `https://accountspayabledirectory.com/state/${code.toLowerCase()}`;

  const faqs = [
    {
      q: `How many accounts payable companies are in ${name}?`,
      a: `This directory lists ${firms.length.toLocaleString()} accounts payable companies across ${cities.length} cities and towns in ${name}. ${withSite.toLocaleString()} of them publish a website, and ${rated.length.toLocaleString()} carry a public rating. Coverage includes outsourced AP teams, automation platforms, invoice processors, bookkeeping firms and finance BPO providers.`,
    },
    {
      q: `What do accounts payable providers charge in ${name}?`,
      a: `Pricing usually follows invoice volume or a dedicated FTE. Per-invoice processing commonly runs from a few cents for capture to several dollars for full processing with approvals and exceptions. Dedicated AP staff are often priced monthly, and automation platforms charge a subscription plus implementation. Rates vary by city, systems and scope, so request a written schedule from each ${name} provider and compare the all-in monthly cost.`,
    },
    {
      q: `How do I find an accounts payable provider near me in ${name}?`,
      a: `Choose the city or town where your finance team or shared-service center is based, then filter by specialty and minimum rating. Open three provider profiles, compare their public review volume and specialties, and ask each the same questions about pricing, integrations, exception handling, security, reporting and termination terms.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonical,
        url: canonical,
        name: `Accounts payable companies in ${name}`,
        description: `Directory of ${firms.length.toLocaleString()} accounts payable companies across ${cities.length} cities in ${name}.`,
        isPartOf: { "@type": "WebSite", "@id": "https://accountspayabledirectory.com/#website" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": `${canonical}#cities` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://accountspayabledirectory.com/" },
          { "@type": "ListItem", position: 2, name: "Directory", item: "https://accountspayabledirectory.com/directory" },
          { "@type": "ListItem", position: 3, name, item: canonical },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#cities`,
        name: `Cities in ${name} with accounts payable companies`,
        numberOfItems: topCities.length,
        itemListElement: topCities.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.city,
          url: `https://accountspayabledirectory.com/state/${code.toLowerCase()}/${c.slug}`,
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
            items={[{ label: "Home", href: "/" }, { label: "Directory", href: "/directory" }, { label: name }]}
          />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
                Accounts payable companies in {name}
              </h1>
              <p className="mt-2 max-w-2xl text-stone-600">
                {firms.length.toLocaleString()} accounts payable companies across {cities.length} cities
                and towns in {name}. Browse by city, or start with the most-reviewed firms statewide.
              </p>
            </div>
            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Firms</dt>
                <dd className="text-xl font-semibold text-brand">{firms.length.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Cities</dt>
                <dd className="text-xl font-semibold text-brand">{cities.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">With site</dt>
                <dd className="text-xl font-semibold text-brand">{withSite.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Accounts payable services in {name}</h2>
            <p className="mt-3 text-[15px] leading-7 text-stone-700">
              {name} has {firms.length.toLocaleString()} accounts payable companies listed across{" "}
              {cities.length.toLocaleString()} cities and towns. {withSite.toLocaleString()} firms publish
              a website, and {rated.length.toLocaleString()} carry a public rating. The average rating
              among rated firms is {avgRating ? avgRating.toFixed(1) : "not yet available"}.
            </p>
            <p className="mt-3 text-[15px] leading-7 text-stone-700">
              {topTypes.length
                ? `The most common specialties statewide are ${topTypes
                    .slice(0, 3)
                    .map(([t, n]) => `${FIRM_TYPE_LABELS[t].toLowerCase()} (${n.toLocaleString()})`)
                    .join(", ")}.`
                : "The statewide mix includes outsourced AP teams, automation platforms and specialist processors."}{" "}
              Start with the city or town where your finance team operates, then compare providers that
              match your invoice volume, ERP and process scope. A firm with deep experience in one part
              of the invoice-to-pay cycle may not be the best fit for another.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTypes.slice(0, 5).map(([t, n]) => (
                <Link
                  key={t}
                  href={`/type/${t}`}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
                >
                  {FIRM_TYPE_LABELS[t]} <span className="text-stone-500">({n.toLocaleString()})</span>
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
              State snapshot
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Firms listed</dt>
                <dd className="font-semibold text-ink">{firms.length.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Cities and towns</dt>
                <dd className="font-semibold text-ink">{cities.length.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">With a website</dt>
                <dd className="font-semibold text-ink">{withSite.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Average rating</dt>
                <dd className="font-semibold text-ink">{avgRating ? avgRating.toFixed(1) : "-"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-5 text-stone-500">
              Ratings are public business ratings, not AccountsPayableDirectory.com reviews.
            </p>
            <div className="mt-4">
              <StealthAgentsAd
                variant="card"
                image="desk"
                placement="state-aside"
                headline="Add a VA before you add another hire."
                body="A dedicated accounts payable assistant handles invoice intake, coding, vendor setup and payment tracking for a fraction of a local hire."
              />
            </div>
          </aside>
        </section>

        <section>
          <h2 className="font-display text-xl tracking-tight">Cities and towns in {name}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/state/${code.toLowerCase()}/${c.slug}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm transition hover:border-brand/40 hover:bg-brand/[0.02]"
              >
                <span className="font-medium">{c.city}</span>
                <span className="text-stone-600">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="my-10">
          <StealthAgentsAd
            variant="strip"
            tone="dark"
            image="team"
            placement="state-mid"
            headline="Process more invoices without more overhead."
            body="Stealth Agents accounts payable assistants are trained on Bill.com, NetSuite, QuickBooks, Coupa and your existing AP stack."
            cta="See AP assistants"
          />
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl tracking-tight">Most-reviewed accounts payable providers in {name}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {topFirms.map((f) => (
              <FirmCard key={f.slug} firm={f} />
            ))}
          </div>
        </section>

        <section className="mt-14" aria-labelledby="state-faq-heading">
          <h2 id="state-faq-heading" className="font-display text-xl tracking-tight">
            Common questions about {name} accounts payable
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
      </div>
    </div>
  );
}
