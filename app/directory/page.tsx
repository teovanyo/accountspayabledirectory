import Link from "next/link";
import type { Metadata } from "next";
import { getIndex } from "@/lib/data";
import { Breadcrumbs } from "@/components/Nav";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

export const metadata: Metadata = {
  title: { absolute: "Accounts Payable Companies by State" },
  description:
    "Browse accounts payable companies in all 50 states and Washington, D.C. Choose a state to see firms by city, with ratings, reviews and contact details.",
  keywords: [
    "accounts payable companies by state",
    "accounts payable companies by state",
    "US accounts payable directory",
    "find accounts payable providers by state",
  ],
  alternates: { canonical: "https://accountspayabledirectory.com/directory" },
  openGraph: {
    type: "website",
    url: "https://accountspayabledirectory.com/directory",
    siteName: "Accounts Payable Directory",
    title: { absolute: "Accounts Payable Companies by State" },
    description:
      "Browse accounts payable companies in every US state. Compare firms by city with ratings, reviews and contact details.",
  },
  twitter: {
    card: "summary",
    title: { absolute: "Accounts Payable Companies by State" },
    description: "Browse accounts payable companies in every US state.",
  },
  robots: { index: true, follow: true },
};

export default function DirectoryPage() {
  const { states, firms } = getIndex();
  const year = new Date().getFullYear();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://accountspayabledirectory.com/directory",
        url: "https://accountspayabledirectory.com/directory",
        name: "Accounts payable companies by state",
        description: `Directory of ${firms.length.toLocaleString()} accounts payable companies across ${states.length} states.`,
        isPartOf: { "@type": "WebSite", "@id": "https://accountspayabledirectory.com/#website" },
        breadcrumb: { "@id": "https://accountspayabledirectory.com/directory#breadcrumb" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://accountspayabledirectory.com/directory#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://accountspayabledirectory.com/" },
          { "@type": "ListItem", position: 2, name: "Directory", item: "https://accountspayabledirectory.com/directory" },
        ],
      },
      {
        "@type": "ItemList",
        "@id": "https://accountspayabledirectory.com/directory#states",
        name: "US states with accounts payable companies",
        numberOfItems: states.length,
        itemListElement: states.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.name,
          url: `https://accountspayabledirectory.com/state/${s.code.toLowerCase()}`,
        })),
      },
    ],
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Directory" }]} />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Accounts payable companies by state</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        {firms.length.toLocaleString()} accounts payable companies across {states.length} states and
        Washington, D.C. Select a state to browse by city. State pages list their cities and towns, and
        city pages list local firms with ratings, reviews and contact details.
      </p>
      <p className="mt-3 max-w-3xl text-[14px] leading-6 text-stone-600">
        Coverage includes outsourced AP teams, automation platforms, invoice processors, bookkeeping
        firms and finance BPO providers. Use the specialty pages for a service type, the state pages for
        a market, or search for a company name. Updated {year}.
      </p>
      <StealthAgentsAd
        variant="band"
        image="team"
        placement="directory-top"
        headline="Running an accounts payable provider?"
        body="Stealth Agents provides dedicated AP assistants for invoice processing, vendor setup, payment runs and month-end close."
        cta="See AP assistants"
        className="mt-8"
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {states.map((s) => (
          <Link
            key={s.code}
            href={`/state/${s.code.toLowerCase()}`}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
          >
            <span className="font-semibold text-ink">{s.name}</span>
            <span className="text-sm text-stone-500">
              {s.count.toLocaleString()} · {s.cities} cities
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
