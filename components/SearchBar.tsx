"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type City = { city: string; slug: string; state: string; stateName: string; count: number };

export function SearchBar({
  initialState = "",
  size = "lg",
  placeholder = "Search a city, firm name or ZIP…",
}: {
  initialState?: string;
  size?: "lg" | "sm";
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialState);
  const [cities, setCities] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<City | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const big = size === "lg";

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        if (res.ok) setCities(await res.json());
      } catch {
        /* offline is fine; the form still submits */
      }
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goCity(c: City) {
    setOpen(false);
    router.push(`/state/${c.state.toLowerCase()}/${c.slug}`);
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        action="/search"
        method="get"
        onSubmit={(e) => {
          if (active) {
            e.preventDefault();
            goCity(active);
            return;
          }
          if (q.trim()) {
            e.preventDefault();
            setOpen(false);
            router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }
        }}
        className="flex w-full gap-2"
        role="search"
      >
        <Command
          shouldFilter={false}
          loop
          className={`relative w-full overflow-visible rounded-xl border border-stone-300 bg-white shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
            big ? "" : ""
          }`}
        >
          <Command.Input
            name="q"
            value={q}
            onValueChange={(v) => {
              setQ(v);
              setOpen(true);
              setActive(null);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            aria-label="Search accounts payable companies by city, name or ZIP"
            className={`w-full rounded-xl bg-transparent outline-none placeholder:text-stone-500 ${
              big ? "py-3.5 pl-4 pr-28 text-base" : "py-2.5 pl-3.5 pr-24 text-sm"
            }`}
          />
          <button
            type="submit"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-brand font-semibold text-white transition hover:bg-brand-light ${
              big ? "px-5 py-2.5 text-sm" : "px-3.5 py-1.5 text-xs"
            }`}
          >
            Search
          </button>

          {open && q.trim().length >= 2 ? (
            <Command.List className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl">
              {cities.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-stone-500">Searching cities…</div>
              ) : null}
              <Command.Empty className="hidden" />
              <div className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Cities
              </div>
              <Command.Group className="pb-1">
                {cities.map((c) => (
                  <Command.Item
                    key={`${c.state}-${c.slug}`}
                    value={`${c.city} ${c.state} ${c.stateName}`}
                    onSelect={() => goCity(c)}
                    onMouseEnter={() => setActive(c)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-ink data-[selected=true]:bg-brand/5 data-[selected=true]:text-brand"
                  >
                    <span>
                      <span className="font-medium">{c.city}</span>
                      <span className="text-stone-500">, {c.state}</span>
                    </span>
                    <span className="text-xs text-stone-500">{c.count} firms</span>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Item
                value={`search ${q}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/search?q=${encodeURIComponent(q.trim())}`);
                }}
                className="mt-1 cursor-pointer rounded-lg border-t border-stone-100 px-3 py-2 text-sm text-brand data-[selected=true]:bg-brand/5"
              >
                Search all firms for “{q.trim()}” →
              </Command.Item>
            </Command.List>
          ) : null}
        </Command>
      </form>
    </div>
  );
}
