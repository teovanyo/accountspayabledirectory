import type { Metadata } from "next";
import { getIndex } from "@/lib/data";
import { Breadcrumbs, Pagination } from "@/components/Nav";
import { FirmCard } from "@/components/FirmCard";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = {
  title: { absolute: "Highest-Rated Accounts Payable Providers in the US" },
  description:
    "The best-reviewed accounts payable companies in the United States, ranked by public rating and review volume. Minimum 4.5 stars and 100 public reviews.",
  keywords: [
    "highest rated accounts payable companies",
    "best accounts payable companies",
    "top accounts payable providers US",
    "accounts payable companies with best reviews",
  ],
  alternates: { canonical: "https://accountspayabledirectory.com/top-rated" },
  openGraph: {
    type: "website",
    url: "https://accountspayabledirectory.com/top-rated",
    siteName: "Accounts Payable Directory",
    title: { absolute: "Highest-Rated Accounts Payable Providers in the US" },
    description:
      "The best-reviewed accounts payable companies in the United States, ranked by public rating and review volume.",
  },
  twitter: {
    card: "summary",
    title: { absolute: "Highest-Rated Accounts Payable Providers in the US" },
    description: "The best-reviewed accounts payable companies in the United States.",
  },
  robots: { index: true, follow: true },
};

export default async function TopRatedPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const { firms } = getIndex();
  const ranked = firms
    .filter((f) => (f.rating || 0) >= 4.5 && (f.reviews || 0) >= 100)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
  const perPage = 24;
  const current = Math.max(1, Number(page) || 1);
  const slice = ranked.slice((current - 1) * perPage, current * perPage);
  const pages = Math.ceil(ranked.length / perPage);
  const canonical = "https://accountspayabledirectory.com/top-rated";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonical,
        url: canonical,
        name: "Highest-rated accounts payable companies in the United States",
        description:
          "Accounts payable companies rated 4.5 stars or better with at least 100 public reviews.",
        isPartOf: { "@type": "WebSite", "@id": "https://accountspayabledirectory.com/#website" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://accountspayabledirectory.com/" },
          { "@type": "ListItem", position: 2, name: "Top rated", item: canonical },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#firms`,
        name: "Highest-rated accounts payable companies",
        numberOfItems: slice.length,
        itemListElement: slice.map((f, i) => ({
          "@type": "ListItem",
          position: (current - 1) * perPage + i + 1,
          name: f.name,
          url: `https://accountspayabledirectory.com/firm/${f.slug}`,
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
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Top rated" }]} />
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Highest-rated accounts payable companies
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            {ranked.length.toLocaleString()} firms rated 4.5 stars or better with at least 100 public
            reviews, ranked by rating and then review volume.
          </p>
        </div>
      </section>

      <StealthAgentsAd
        variant="band"
        tone="dark"
        image="hero"
        placement="top-rated-top"
        headline="The best finance teams don't do it all themselves."
        body="Add a dedicated accounts payable assistant for invoice intake, vendor follow-ups, payment tracking and month-end support. USA timezone, 48-hour placement."
        cta="Hire an AP assistant"
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {slice.map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
        </div>
        <Pagination page={current} pages={pages} makeHref={(p) => `/top-rated${p === 1 ? "" : `?page=${p}`}`} />
      </div>
    </div>
  );
}
