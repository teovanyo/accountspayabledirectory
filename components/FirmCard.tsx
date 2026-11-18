import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { firmTypes, FIRM_TYPE_LABELS, type Firm } from "@/lib/data";
import { FirmLogo } from "@/components/FirmLogo";

export function FirmCard({ firm }: { firm: Firm }) {
  const primaryType = firmTypes(firm).find((t) => t !== "outsourcing") || "outsourcing";

  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-xl border border-stone-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
      <div className="flex items-start gap-3">
        <FirmLogo name={firm.name} website={firm.website} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-ink group-hover:text-brand">
            <Link href={`/firm/${firm.slug}`} className="outline-none after:absolute after:inset-0 after:content-['']">
              {firm.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-stone-600">
            <MapPin className="h-3.5 w-3.5 text-stone-500" aria-hidden />
            {firm.city}, {firm.state}
            {firm.zip ? ` ${firm.zip}` : ""}
          </p>
        </div>
        {firm.rating != null ? (
          <div className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-center">
            <div className="text-[13px] font-bold leading-none text-amber-900">★ {firm.rating.toFixed(1)}</div>
            {firm.reviews ? (
              <div className="mt-0.5 text-[11px] font-medium leading-none text-amber-900/80">{firm.reviews.toLocaleString()}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-1.5 text-[13px]">
        {firm.phone ? (
          <a
            href={`tel:${firm.phone.replace(/[^+\d]/g, "")}`}
            className="relative z-10 flex items-center gap-1.5 text-brand hover:underline"
          >
            <Phone className="h-3.5 w-3.5 text-stone-500" aria-hidden />
            {firm.phone}
          </a>
        ) : null}
        {firm.website ? (
          <p className="truncate text-stone-600">
            {firm.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </p>
        ) : null}
        {firm.address ? <p className="truncate text-xs text-stone-500">{firm.address}</p> : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <span className="rounded-md bg-brand/5 px-2 py-0.5 text-[11px] font-medium text-brand">
          {FIRM_TYPE_LABELS[primaryType]}
        </span>
        {firm.categories
          .filter((c) => /account|payable|invoice|bookkeep|accounting|finance|bpo|outsourc|automation/i.test(c))
          .filter((c) => !/accounts payable company/i.test(c))
          .slice(0, 1)
          .map((c) => (
            <span key={c} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">
              {c}
            </span>
          ))}
        <span className="ml-auto text-[11px] font-medium text-brand opacity-0 transition group-hover:opacity-100">
          Details →
        </span>
      </div>
    </article>
  );
}
