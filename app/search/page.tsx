import Link from "next/link";
import type { Metadata } from "next";
import { getIndex, searchFirms, stateName } from "@/lib/data";
import { Breadcrumbs, Pagination } from "@/components/Nav";
import { FirmCard } from "@/components/FirmCard";
import { SearchBar } from "@/components/SearchBar";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

export const metadata: Metadata = {
  title: "Search Accounts Payable Companies",
  description:
    "Search accounts payable companies across the United States by name, city, state or ZIP code.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: Promise<{ q?: string; state?: string; city?: string; page?: string; sort?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = searchFirms({ q: sp.q, state: sp.state, city: sp.city, page, perPage: 20, sort: sp.sort });
  const { states } = getIndex();
  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.state) params.set("state", sp.state);
    if (sp.city) params.set("city", sp.city);
    if (sp.sort) params.set("sort", sp.sort);
    if (p > 1) params.set("page", String(p));
    return `/search?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Search accounts payable companies</h1>
      <div className="mt-5 max-w-2xl">
        <SearchBar initialState={sp.q || ""} size="sm" />
      </div>

      <form method="get" action="/search" className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {sp.q ? <input type="hidden" name="q" value={sp.q} /> : null}
        <select
          name="state"
          defaultValue={sp.state || ""}
          className="rounded border border-stone-300 bg-white px-3 py-2"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
        <button type="submit" className="rounded border border-stone-300 bg-white px-3 py-2 hover:border-brand">
          Apply filters
        </button>
        {sp.q || sp.state ? (
          <Link href="/search" className="text-stone-500 hover:text-brand">
            Clear
          </Link>
        ) : null}
      </form>

      <p className="mt-6 text-sm text-stone-500">
        {result.total.toLocaleString()} {result.total === 1 ? "firm" : "firms"}
        {sp.q ? ` matching “${sp.q}”` : ""}
        {sp.state ? ` in ${stateName(sp.state.toUpperCase())}` : ""}
      </p>

      <div className="mt-6">
        <StealthAgentsAd
          variant="strip"
          image="flatlay"
          placement="search-top"
          headline="Running an accounts payable company?"
          body="Add a dedicated Stealth Agents AP assistant for invoice intake, vendor follow-ups, payment tracking and month-end support."
          cta="See AP assistants"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {result.firms.map((f) => (
          <FirmCard key={f.slug} firm={f} />
        ))}
      </div>

      {!result.firms.length ? (
        <div className="mt-10 rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="font-medium">No firms matched that search.</p>
          <p className="mt-1 text-sm text-stone-500">
            Try a city name, a state, or part of a company name.
          </p>
        </div>
      ) : null}

      <Pagination page={page} pages={result.pages} makeHref={makeHref} />
    </div>
  );
}
