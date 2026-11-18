import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, MapPin, Search } from "lucide-react";
import { FIRM_TYPE_LABELS, FIRM_TYPES, getIndex } from "@/lib/data";
import { BASE_URL, SITEMAP_CHUNK_SIZE } from "@/lib/sitemap";
import { Breadcrumbs } from "@/components/Nav";

export const metadata: Metadata = {
  title: { absolute: "Site map" },
  description:
    "Browse every accounts payable company, city, state and service type page in the directory. XML sitemaps are available for search engines.",
  alternates: { canonical: `${BASE_URL}/site-map` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/site-map`,
    siteName: "Accounts Payable Directory",
    title: "Site map",
    description:
      "Browse every accounts payable company, city, state and service type page in the directory.",
  },
  robots: { index: true, follow: true },
};

export default function SitemapPage() {
  const { firms, states, topCities } = getIndex();
  const chunks = Math.max(1, Math.ceil(firms.length / SITEMAP_CHUNK_SIZE));
  const topCitiesList = topCities.slice(0, 120);
  const sitemapIndexUrl = `${BASE_URL}/site-map.xml`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/site-map`,
        url: `${BASE_URL}/site-map`,
        name: "Site map",
        description:
          "Browse every accounts payable company, city, state and service type page in the directory.",
        isPartOf: { "@type": "WebSite", "@id": `${BASE_URL}/#website` },
        breadcrumb: { "@id": `${BASE_URL}/site-map#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE_URL}/site-map#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Site map", item: `${BASE_URL}/site-map` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Site map" }]} />

      <div className="max-w-3xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Site map</h1>
        <p className="mt-3 text-[15px] leading-7 text-stone-600">
          This page lists the main ways to browse the directory: by service type, by state and by
          city. The XML sitemaps below are the machine-readable version for search engines. The
          sitemap index currently covers {firms.length.toLocaleString()} accounts payable firm
          pages, {topCities.length.toLocaleString()} city pages and {states.length} state pages.
        </p>
      </div>

      <section className="mt-10" aria-labelledby="xml-sitemaps">
        <h2 id="xml-sitemaps" className="font-display text-2xl tracking-tight">
          XML sitemaps
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Submit the sitemap index in Google Search Console and Bing Webmaster Tools.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: "/sitemap.xml",
              title: "Sitemap index",
              body: "The main index that lists every child sitemap below.",
            },
            {
              href: "/sitemap-states.xml",
              title: "Pages and states",
              body: "Homepage, directory, about, top-rated, service types and all state pages.",
            },
            {
              href: "/sitemap-cities.xml",
              title: "City pages",
              body: `${topCities.length.toLocaleString()} city and town pages with local firm lists.`,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-stone-200 bg-white p-5 transition hover:border-brand/30 hover:shadow-sm"
            >
              <FileText className="h-5 w-5 text-brand" aria-hidden />
              <p className="mt-3 font-semibold text-ink group-hover:text-brand">{item.title}</p>
              <p className="mt-1 text-[13px] leading-6 text-stone-600">{item.body}</p>
              <p className="mt-3 text-[12px] font-medium text-brand">{item.href}</p>
            </Link>
          ))}
          {Array.from({ length: chunks }, (_, i) => (
            <Link
              key={i}
              href={`/sitemap-firms/${i + 1}`}
              className="group rounded-xl border border-stone-200 bg-white p-5 transition hover:border-brand/30 hover:shadow-sm"
            >
              <MapPin className="h-5 w-5 text-brand" aria-hidden />
              <p className="mt-3 font-semibold text-ink group-hover:text-brand">
                Firm pages {i + 1}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-stone-600">
                Pages {(i * SITEMAP_CHUNK_SIZE + 1).toLocaleString()} to{" "}
                {Math.min((i + 1) * SITEMAP_CHUNK_SIZE, firms.length).toLocaleString()} of{" "}
                {firms.length.toLocaleString()} firm profiles.
              </p>
              <p className="mt-3 text-[12px] font-medium text-brand">/sitemap-firms/{i + 1}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="browse-types">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="browse-types" className="font-display text-2xl tracking-tight">
              Browse by service type
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Outsourced AP, automation, invoice processing, bookkeeping and finance BPO providers.
            </p>
          </div>
          <Link href="/type/outsourcing" className="text-sm font-medium text-brand hover:underline">
            Start with outsourced AP →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FIRM_TYPES.map((type) => (
            <Link
              key={type}
              href={`/type/${type}`}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm transition hover:border-brand/30 hover:text-brand"
            >
              <span className="font-medium">{FIRM_TYPE_LABELS[type]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="browse-states">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="browse-states" className="font-display text-2xl tracking-tight">
              Browse by state
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Every state page links to its cities and most-reviewed firms.
            </p>
          </div>
          <Link href="/directory" className="text-sm font-medium text-brand hover:underline">
            Open the full directory →
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((state) => (
            <Link
              key={state.code}
              href={`/state/${state.code.toLowerCase()}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm transition hover:border-brand/40 hover:bg-brand/[0.02]"
            >
              <span className="font-medium">{state.name}</span>
              <span className="text-stone-600">
                {state.count.toLocaleString()} firms · {state.cities} cities
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="browse-cities">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="browse-cities" className="font-display text-2xl tracking-tight">
              Popular cities
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              The 120 cities with the most listed firms. Use the directory for every city and town.
            </p>
          </div>
          <Link href="/search" className="text-sm font-medium text-brand hover:underline">
            Search all cities →
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {topCitiesList.map((city) => (
            <Link
              key={`${city.state}-${city.city}`}
              href={`/state/${city.state.toLowerCase()}/${city.slug}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm transition hover:border-brand/40 hover:bg-brand/[0.02]"
            >
              <span className="font-medium">
                {city.city}, {city.state}
              </span>
              <span className="text-stone-600">{city.count} firms</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6" aria-labelledby="gsc">
        <div className="flex items-start gap-3">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 id="gsc" className="font-display text-xl tracking-tight">
              For Google Search Console
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-stone-600">
              Submit the sitemap index, not the individual child sitemaps. Google will discover the
              state, city and firm sitemaps from the index.
            </p>
            <p className="mt-3 break-all rounded-lg bg-stone-50 px-3 py-2 font-mono text-[13px] text-stone-700">
              {sitemapIndexUrl}
            </p>
            <p className="mt-3 text-[12px] leading-5 text-stone-500">
              The sitemaps are also listed in{" "}
              <Link href="/robots.txt" className="text-brand underline">
                robots.txt
              </Link>
              . If you add a Google verification token, the site can output the verification meta tag
              automatically.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          Back to the directory <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
