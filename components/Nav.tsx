import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 ? <span className="text-stone-300">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-brand hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-stone-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Pagination({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (p: number) => string;
}) {
  if (pages <= 1) return null;
  const nums = new Set<number>([1, pages, page - 1, page, page + 1]);
  const list = [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm hover:border-brand">
          Previous
        </Link>
      ) : null}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - list[i - 1] > 1 ? <span className="px-1 text-stone-400">…</span> : null}
          {n === page ? (
            <span className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white">{n}</span>
          ) : (
            <Link href={makeHref(n)} className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm hover:border-brand">
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages ? (
        <Link href={makeHref(page + 1)} className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm hover:border-brand">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
