import type { FirmFaq } from "@/lib/content";

export function FirmFaqList({ faqs, firmName }: { faqs: FirmFaq[]; firmName: string }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-12" aria-labelledby="firm-faq-heading">
      <h2 id="firm-faq-heading" className="font-display text-2xl tracking-tight">
        Common questions about {firmName}
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Practical questions owners ask when comparing accounts payable companies.
      </p>
      <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {faqs.map((faq) => (
          <details key={faq.q} className="group px-5 py-4 open:bg-stone-50/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
              {faq.q}
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 text-stone-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
