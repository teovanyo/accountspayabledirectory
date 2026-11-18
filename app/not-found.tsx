import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">We could not find that page</h1>
      <p className="mt-3 text-stone-600">
        The firm or city you were looking for may have moved. Try the directory or search instead.
      </p>
      <div className="mt-6 flex justify-center gap-3 text-sm">
        <Link href="/directory" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-light">
          Browse states
        </Link>
        <Link href="/search" className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-semibold hover:border-brand">
          Search firms
        </Link>
      </div>
    </div>
  );
}
