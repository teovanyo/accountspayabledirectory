"use client";

import { useState } from "react";

function domainOf(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "PM";
}

export function FirmLogo({ name, website, size = 40 }: { name: string; website: string | null; size?: number }) {
  const domain = domainOf(website);
  const [failed, setFailed] = useState(!domain);

  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-lg border border-stone-200 bg-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {failed ? (
        <span className="text-[11px] font-bold tracking-wide text-brand">{initials(name)}</span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
          alt=""
          width={size - 12}
          height={size - 12}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-[60%] w-[60%] object-contain"
        />
      )}
    </span>
  );
}
