"use client";

import { useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import { stealthAgentsHref } from "@/components/StealthAgentsAd";

const STORAGE_KEY = "apd-stealth-ribbon-dismissed";

export function StealthAgentsRibbon() {
  const barRef = useRef<HTMLDivElement>(null);

  const hide = () => {
    if (barRef.current) barRef.current.style.display = "none";
  };

  const dismiss = () => {
    hide();
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage access errors
    }
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem("${STORAGE_KEY}")==="1"){var s=document.currentScript;s&&s.parentElement&&s.parentElement.querySelectorAll("[data-stealth-ribbon]").forEach(function(n){n.style.display="none"})}}catch(e){}`,
        }}
      />
      <div ref={barRef} data-stealth-ribbon className="relative bg-brand-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-3 gap-y-1 px-10 py-2 text-center">
          <span className="hidden rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent sm:inline">
            Ad
          </span>
          <p className="text-[12.5px] leading-snug text-white/90 sm:text-[13px]">
            <span className="font-semibold text-white">Stealth Agents</span> accounts payable
            assistants
            <span className="hidden sm:inline">
              {" "}
              handle invoice processing, vendor setup, payment runs and month-end close.
            </span>
          </p>
          <a
            href={stealthAgentsHref("sitewide-ribbon")}
            target="_blank"
            rel="sponsored noopener"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-accent hover:underline sm:text-[13px]"
          >
            See AP assistants
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
        <button
          type="button"
          aria-label="Dismiss advertisement"
          onClick={dismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </>
  );
}
