import type { Metadata } from "next";
import { getIndex } from "@/lib/data";
import { Breadcrumbs } from "@/components/Nav";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

const BASE = "https://accountspayabledirectory.com";

export const metadata: Metadata = {
  title: { absolute: "About This Accounts Payable Directory" },
  description:
    "How AccountsPayableDirectory.com is built, where listing data comes from, how editorial profiles and ratings work, and how firms can claim or correct a listing.",
  keywords: [
    "accounts payable directory",
    "accounts payable companies data",
    "how accounts payable directories work",
    "claim accounts payable listing",
  ],
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    type: "website",
    url: `${BASE}/about`,
    siteName: "Accounts Payable Directory",
    title: "About This Accounts Payable Directory",
    description:
      "How the directory is built, where the data comes from, and how firms can claim or correct a listing.",
  },
  twitter: {
    card: "summary",
    title: "About This Accounts Payable Directory",
    description: "How the directory is built and how firms can correct a listing.",
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const { firms, states, topCities } = getIndex();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${BASE}/about`,
        url: `${BASE}/about`,
        name: "About AccountsPayableDirectory.com",
        description:
          "How the directory is built, where listing data comes from, and how firms can claim or correct a listing.",
        isPartOf: { "@type": "WebSite", "@id": `${BASE}/#website` },
        breadcrumb: { "@id": `${BASE}/about#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE}/about#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
          { "@type": "ListItem", position: 2, name: "About", item: `${BASE}/about` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
        About AccountsPayableDirectory.com
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-7 text-stone-700">
        <p>
          AccountsPayableDirectory.com is a free directory of accounts payable companies in the
          United States. It currently lists <strong>{firms.length.toLocaleString()}</strong> firms in{" "}
          <strong>{topCities.length.toLocaleString()}</strong> cities and towns across{" "}
          <strong>{states.length}</strong> states and Washington, D.C.
        </p>

        <h2 className="pt-2 font-display text-2xl tracking-tight text-ink">Where the data comes from</h2>
        <p>
          Listings come from public business data, including business profiles. Each
          record can include the business name, address, phone number, website, categories and the
          public rating and review count at the time of collection. We do not sell contact data, and
          firms do not pay to appear in the directory or to change their position in search results.
        </p>
        <p>
          Coverage grows city by city, starting with larger markets and expanding into smaller
          communities and dense metro sub-markets. A listing is a starting point, not a verification
          that a firm is licensed, insured, accepting new clients or still operating at that address.
        </p>

        <h2 className="pt-2 font-display text-2xl tracking-tight text-ink">
          How editorial profiles work
        </h2>
        <p>
          Many firm pages include a short brief and a longer editorial profile. The brief and review on a firm page draw on
          the listing data: categories, city, state, public rating, review volume, the local mix of
          AP specialties and nearby cities. The profile explains what the firm appears to specialize
          in, what its public rating does and does not tell you, who it may suit, and what to ask
          before hiring. Some profiles are expanded with additional editorial research; others are
          shorter data summaries.
        </p>
        <p>
          Editorial profiles are not customer reviews, star ratings, endorsements or guarantees. They
          are written to help you compare firms and ask better questions. General industry guidance is
          labeled as advice, and company-specific claims are limited to what the listing data supports.
          Fees, licensing, service scope and availability change, so confirm them directly with the firm.
        </p>

        <h2 className="pt-2 font-display text-2xl tracking-tight text-ink">
          How ratings and rankings work
        </h2>
        <p>
          The star rating and review count shown on a listing come from the underlying public business
          profile. They are not AccountsPayableDirectory.com reviews. A high rating from a small number
          of reviews is a weaker signal than a similar rating from thousands of reviews, and the firm
          profiles say so when the sample is small.
        </p>
        <p>
          Search and city pages default to public review volume so established firms surface first. You
          can re-sort by rating or name and filter by service type, website availability and minimum
          rating. The top-rated page uses a minimum rating and review threshold so a handful of reviews
          cannot dominate the list. No firm can pay to move up.
        </p>

        <h2 className="pt-2 font-display text-2xl tracking-tight text-ink">
          Corrections and claims
        </h2>
        <p>
          If you own or manage a firm listed here and something is wrong (a closed location, a new
          phone number, a changed website, a wrong category), email{" "}
          <a className="text-brand underline" href="mailto:hello@accountspayabledirectory.com">
            hello@accountspayabledirectory.com
          </a>{" "}
          with the firm name, city and the correction. Firms can also ask to be removed. We aim to
          review correction requests promptly and update the listing where the public record supports
          the change.
        </p>

        <h2 className="pt-2 font-display text-2xl tracking-tight text-ink">What this site is not</h2>
        <p>
          This is not a lead-generation form, a paid ranking, a background-check service or a
          substitute for service-agreement review. We do not verify every license, insurance
          certificate, security certification, fee schedule or service claim. Before hiring any firm,
          confirm licensing and registration where required, request proof of insurance and security
          certifications, read the service agreement, and ask for references and a sample month-end close.
        </p>
        <p>
          Sponsored placements from service providers are clearly labeled and kept separate from
          directory listings and search rankings. Firms cannot pay to appear, move up or change a
          listing.
        </p>

        <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-600">
          <p className="font-semibold text-ink">Quick facts</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{firms.length.toLocaleString()} accounts payable companies listed</li>
            <li>{topCities.length.toLocaleString()} cities and towns represented</li>
            <li>{states.length} states plus Washington, D.C.</li>
            <li>Free to browse; no signup required to see contact details</li>
            <li>Firms do not pay to appear or to change their ranking</li>
          </ul>
        </div>

        <div className="mt-8">
          <StealthAgentsAd
            variant="strip"
            tone="dark"
            image="team"
            placement="about-inline"
            headline="Running an accounts payable provider?"
            body="Stealth Agents provides dedicated AP assistants for invoice processing, vendor setup, payment runs and month-end close."
            cta="See AP assistants"
          />
        </div>
      </div>
    </div>
  );
}
