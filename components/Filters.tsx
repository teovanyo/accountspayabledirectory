import Link from "next/link";
import { FIRM_TYPE_LABELS } from "@/lib/data";

const TYPES: { key: string; label: string }[] = [
  { key: "all", label: "All firms" },
  { key: "outsourcing", label: FIRM_TYPE_LABELS.outsourcing },
  { key: "automation", label: FIRM_TYPE_LABELS.automation },
  { key: "invoice", label: FIRM_TYPE_LABELS.invoice },
  { key: "bookkeeping", label: FIRM_TYPE_LABELS.bookkeeping },
  { key: "bpo", label: FIRM_TYPE_LABELS.bpo },
];

const SORTS = [
  { key: "reviews", label: "Most reviewed" },
  { key: "rating", label: "Highest rated" },
  { key: "name", label: "A-Z" },
];

export function Filters({
  basePath,
  params,
  total,
  shown,
}: {
  basePath: string;
  params: { type?: string; site?: string; rating?: string; sort?: string };
  total: number;
  shown: number;
}) {
  const build = (next: Record<string, string | undefined>) => {
    const merged = { ...params, ...next };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && !(k === "type" && v === "all") && !(k === "sort" && v === "reviews")) qs.set(k, v);
    }
    const s = qs.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };
  const currentType = params.type || "all";

  return (
    <div className="mb-5 space-y-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TYPES.map((t) => {
          const active = currentType === t.key;
          return (
            <Link
              key={t.key}
              href={build({ type: t.key === "all" ? undefined : t.key })}
              aria-current={active ? "true" : undefined}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                active
                  ? "border-brand bg-brand text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-brand/50 hover:text-brand"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
        <Link
          href={build({ site: params.site === "1" ? undefined : "1" })}
          aria-pressed={params.site === "1"}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            params.site === "1"
              ? "border-brand bg-brand text-white"
              : "border-stone-300 bg-white text-stone-700 hover:border-brand/50 hover:text-brand"
          }`}
        >
          Has website
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-stone-600" aria-live="polite">
          Showing <span className="font-semibold text-ink">{shown.toLocaleString()}</span> of{" "}
          {total.toLocaleString()} firms
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-0.5 text-[12px]">
          <span className="px-2 text-stone-500">Sort</span>
          {SORTS.map((s) => {
            const active = (params.sort || "reviews") === s.key;
            return (
              <Link
                key={s.key}
                href={build({ sort: s.key === "reviews" ? undefined : s.key })}
                aria-current={active ? "true" : undefined}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  active ? "bg-brand/10 text-brand" : "text-stone-600 hover:text-brand"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
