import Link from "next/link";
import { ArrowUpRight, Phone, Star } from "lucide-react";
import { FIRM_TYPE_LABELS, firmTypes, type Firm } from "@/lib/data";
import { FirmLogo } from "@/components/FirmLogo";

export function FirmComparison({
  firm,
  cityFirms,
}: {
  firm: Firm;
  cityFirms: Firm[];
}) {
  const ranked = [...cityFirms].sort(
    (a, b) =>
      (b.reviews || 0) - (a.reviews || 0) ||
      (b.rating || 0) - (a.rating || 0) ||
      a.name.localeCompare(b.name)
  );
  const currentIndex = ranked.findIndex((f) => f.slug === firm.slug);
  const selected = new Set<string>();
  if (currentIndex >= 0) selected.add(ranked[currentIndex].slug);
  for (const f of ranked) {
    if (selected.size >= 8) break;
    selected.add(f.slug);
  }
  const rows = ranked.filter((f) => selected.has(f.slug));

  if (rows.length < 2) return null;

  return (
    <section className="mt-12" aria-labelledby="compare-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="compare-heading" className="font-display text-2xl tracking-tight">
            Compare accounts payable providers in {firm.city}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            The most-reviewed firms listed in {firm.city}, including {firm.name}. Compare ratings, review
            volume and contact details side by side.
          </p>
        </div>
        <Link
          href={`/state/${firm.state.toLowerCase()}/${firm.citySlug}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          See all {cityFirms.length} in {firm.city} →
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Firm
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Specialty
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Rating
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Reviews
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Phone
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const isCurrent = f.slug === firm.slug;
              const type = firmTypes(f).find((t) => t !== "outsourcing") || "outsourcing";
              return (
                <tr
                  key={f.slug}
                  className={`border-b border-stone-100 last:border-0 ${
                    isCurrent ? "bg-brand/[0.04]" : "hover:bg-stone-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FirmLogo name={f.name} website={f.website} size={28} />
                      <div className="min-w-0">
                        <Link
                          href={`/firm/${f.slug}`}
                          className="block truncate font-medium text-ink hover:text-brand hover:underline"
                        >
                          {f.name}
                        </Link>
                        {isCurrent ? (
                          <span className="text-[11px] font-medium text-brand">This firm</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-stone-500">
                            View profile <ArrowUpRight className="h-3 w-3" aria-hidden />
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{FIRM_TYPE_LABELS[type]}</td>
                  <td className="px-4 py-3">
                    {f.rating != null ? (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-900">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
                        {f.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-stone-600">
                    {f.reviews ? f.reviews.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {f.phone ? (
                      <a
                        href={`tel:${f.phone.replace(/[^+\d]/g, "")}`}
                        className="inline-flex items-center gap-1 text-brand hover:underline"
                      >
                        <Phone className="h-3 w-3" aria-hidden />
                        {f.phone}
                      </a>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
