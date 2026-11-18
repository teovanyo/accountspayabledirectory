import { BadgeCheck, Clock3 } from "lucide-react";
import type { FirmContent } from "@/lib/content";

type Block =
  | { type: "h2"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseReview(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split(/\r?\n/);
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "p", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "ul", items: list });
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = line.slice(3).trim();
      blocks.push({ type: "h2", text, id: slugify(text) });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[-*]\s+/, "").trim());
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\d+[.)]\s+/, "").trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function FirmReview({ content }: { content: FirmContent }) {
  const blocks = parseReview(content.review);
  const headings = blocks.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2");
  const updated = formatDate(content.generatedAt);

  return (
    <article className="mt-10">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-stone-500">
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="h-4 w-4 text-brand" aria-hidden />
          Editorial profile
        </span>
        <span className="text-stone-300">·</span>
        <span>Based on public listing data</span>
        {updated ? (
          <>
            <span className="text-stone-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              Updated {updated}
            </span>
          </>
        ) : null}
      </div>

      {headings.length > 2 ? (
        <nav
          aria-label="In this review"
          className="mt-5 rounded-xl border border-stone-200 bg-white px-5 py-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            In this review
          </p>
          <ol className="mt-2 grid gap-x-6 gap-y-1 text-sm text-stone-700 sm:grid-cols-2">
            {headings.map((h, i) => (
              <li key={h.id} className="flex gap-2">
                <span className="tabular-nums text-stone-400">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#${h.id}`} className="hover:text-brand hover:underline">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="mt-6 max-w-none">
        {blocks.map((block, i) => {
          if (block.type === "h2") {
            return (
              <h2
                key={`${block.id}-${i}`}
                id={block.id}
                className="mt-9 scroll-mt-24 font-display text-2xl tracking-tight text-ink first:mt-0"
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "ul") {
            return (
              <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-stone-700">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="mt-4 text-[15px] leading-7 text-stone-700">
              {block.text}
            </p>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 px-5 py-4 text-[12px] leading-relaxed text-stone-600">
        <p>
          <strong className="font-semibold text-stone-700">About this review.</strong> This is an
          editorial summary based on public business listing data. It is not a customer review, a
          rating of service quality, or an endorsement. Fees, licensing, service
          scope and terms change; confirm them directly with the firm before signing anything.
        </p>
      </div>
    </article>
  );
}
