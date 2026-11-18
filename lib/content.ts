import fs from "node:fs";
import path from "node:path";
import {
  FIRM_TYPE_LABELS,
  firmTypes,
  getCity,
  getIndex,
  stateName,
  type Firm,
  type FirmType,
} from "@/lib/data";

export type FirmFaq = { q: string; a: string };

export type FirmContent = {
  slug: string;
  name: string;
  city: string;
  state: string;
  brief: string;
  review: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  faqs: FirmFaq[];
  briefWordCount?: number;
  reviewWordCount?: number;
  generatedAt: string;
  model?: string;
  isFallback?: boolean;
};

const CACHE_LIMIT = 800;
const FALLBACK_UPDATED = "2026-11-18T12:00:00.000Z";
const cache = new Map<string, FirmContent | null>();

function readContentFile(firm: Firm): FirmContent | null {
  const file = path.join(
    process.cwd(),
    "data",
    "content",
    firm.state.toLowerCase(),
    `${firm.slug}.json`
  );
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as FirmContent;
    if (!parsed || !parsed.review || !parsed.brief) return null;
    return normalizeContent(parsed, firm);
  } catch {
    return null;
  }
}

export function getFirmContent(firm: Firm): FirmContent {
  const key = `${firm.state}/${firm.slug}`;
  if (cache.has(key)) {
    const hit = cache.get(key);
    if (hit) return hit;
  }
  const fromDisk = readContentFile(firm);
  const value = fromDisk || normalizeContent(buildFallbackContent(firm), firm);
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, value);
  return value;
}

export function hasGeneratedContent(firm: Firm) {
  const key = `${firm.state}/${firm.slug}`;
  const hit = cache.get(key);
  if (hit) return !hit.isFallback;
  const file = path.join(
    process.cwd(),
    "data",
    "content",
    firm.state.toLowerCase(),
    `${firm.slug}.json`
  );
  return fs.existsSync(file);
}

function avg(values: number[]) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function fmt(n: number | null, digits = 1) {
  if (n == null || !Number.isFinite(n)) return null;
  return Number(n.toFixed(digits));
}

function fitText(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const at = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf(","), cut.lastIndexOf("-"));
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:-]+$/, "");
}

function fitDescription(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.55) return cut.slice(0, sentence + 1);
  const at = cut.lastIndexOf(" ");
  const trimmed = (at > max * 0.55 ? cut.slice(0, at) : cut).replace(/[\s,;:-]+$/, "");
  return trimmed + ".";
}

function stripDashes(text: string) {
  return String(text || "")
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function plainWords(value: string) {
  return String(value || "")
    .replace(/\bdirectory landscape\b/gi, "directory market")
    .replace(/\bfirm landscape\b/gi, "firm market")
    .replace(/\breview landscape\b/gi, "review base")
    .replace(/\b(accounts payable|management|local|competitive|industry|business|regulatory|economic) landscape\b/gi, (m: string, p1: string) => {
      const word = p1.toLowerCase();
      const noun = word === "regulatory" ? "environment" : word === "economic" ? "economy" : "market";
      return `${p1} ${noun}`;
    })
    .replace(/\bshowcases?\b/gi, "shows")
    .replace(/\bshowcased\b/gi, "showed")
    .replace(/\bshowcasing\b/gi, "showing")
    .replace(/\bunderscores?\b/gi, "shows")
    .replace(/\bunderscored\b/gi, "showed")
    .replace(/\bunderscoring\b/gi, "showing")
    .replace(/\brobust\b/gi, "strong")
    .replace(/\bpivotal\b/gi, "important")
    .replace(/\bcrucial\b/gi, "important")
    .replace(/\bmeticulous\b/gi, "careful")
    .replace(/\bmeticulously\b/gi, "carefully")
    .replace(/\bvibrant\b/gi, "active")
    .replace(/\bgarner\b/gi, "get")
    .replace(/\bbolster\b/gi, "support")
    .replace(/\benduring\b/gi, "lasting")
    .replace(/\bintricate\b/gi, "complex")
    .replace(/\binterplay\b/gi, "relationship")
    .replace(/\bvaluable\b/gi, "useful")
    .replace(/\bnestled\b/gi, "located")
    .replace(/\brenowned\b/gi, "well-known")
    .replace(/\bbreathtaking\b/gi, "impressive")
    .replace(/\bboasts\b/gi, "has")
    .replace(/\bserves as\b/gi, "is")
    .replace(/\bstands as\b/gi, "is")
    .replace(/\bAdditionally,\s*/g, "Also, ")
    .replace(/\bFurthermore,\s*/g, "Also, ")
    .replace(/\bMoreover,\s*/g, "Also, ")
    .replace(/\bIt is important to note that\s*/gi, "")
    .replace(/\bIt's worth noting that\s*/gi, "")
    .replace(/\bat its core,\s*/gi, "")
    .replace(/\butilize\b/gi, "use")
    .replace(/\bleverage\b/gi, "use")
    .replace(/\bseamless\b/gi, "smooth");
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeTitle(title: string, firm: Firm) {
  const city = firm.city;
  const state = firm.state;
  let out = fitText(String(title || ""), 65);
  if (!out) out = fitText(`${firm.name} - ${city}, ${state}`, 65);
  if (state && !new RegExp(`\\b${state}\\b`, "i").test(out)) {
    const withState = out.replace(city, `${city}, ${state}`);
    if (withState.length <= 65) out = withState;
    else out = fitText(`${firm.name} - ${city}, ${state}`, 65);
  }
  return fitText(out, 65);
}

function trimReview(text: string, max = 700) {
  if (wordCount(text) <= max) return text;
  let parts = text.split(/\n{2,}/);
  while (wordCount(parts.join("\n\n")) > max && parts.length > 1) {
    let changed = false;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].trim().startsWith("## ")) continue;
      const sentences = parts[i].match(/[^.!?]+[.!?]+/g);
      if (!sentences || sentences.length < 2) continue;
      parts[i] = sentences.slice(0, -1).join(" ").trim();
      changed = true;
      break;
    }
    if (!changed) break;
  }
  if (wordCount(parts.join("\n\n")) > max) {
    parts = [parts.join("\n\n").split(/\s+/).slice(0, max).join(" ")];
  }
  return parts.join("\n\n");
}

function normalizeContent(content: FirmContent, firm: Firm): FirmContent {
  const brief = plainWords(stripDashes(content.brief));
  const review = trimReview(plainWords(stripDashes(content.review)), 700);
  const faqs = (content.faqs || []).map((faq) => ({
    q: plainWords(stripDashes(faq.q)),
    a: plainWords(stripDashes(faq.a)),
  }));
  return {
    ...content,
    brief,
    review,
    metaTitle: normalizeTitle(stripDashes(content.metaTitle), firm),
    metaDescription: fitDescription(stripDashes(content.metaDescription), 158),
    keywords: (content.keywords || []).map(stripDashes),
    tags: (content.tags || []).map(stripDashes),
    faqs,
    briefWordCount: wordCount(brief),
    reviewWordCount: wordCount(review),
  };
}

function typePhrase(types: FirmType[]) {
  if (types.length === 1) return FIRM_TYPE_LABELS[types[0]].toLowerCase();
  return types.map((t) => FIRM_TYPE_LABELS[t].toLowerCase()).join(" and ");
}

const TYPE_DETAIL: Record<FirmType, { services: string; audience: string }> = {
  outsourcing: {
    services:
      "A dedicated accounts payable service typically takes over invoice intake, three-way matching, general ledger coding, approval routing, vendor master maintenance, payment runs and month-end reconciliation. Many teams also handle vendor inquiries, statement reconciliation, 1099 preparation and audit support.",
    audience:
      "It usually suits businesses that have outgrown a single AP clerk but do not want to add permanent headcount, especially companies processing hundreds to tens of thousands of invoices a month across multiple entities or currencies.",
  },
  automation: {
    services:
      "AP automation platforms capture invoices from email, EDI and supplier portals, extract line-item data, apply coding and approval rules, detect duplicates, route exceptions and hand approved bills to a payment or ERP system. Most include dashboards, audit trails and integrations with tools such as NetSuite, QuickBooks, Sage Intacct, SAP, Oracle and Bill.com.",
    audience:
      "It suits finance teams that want to cut manual keying and approval chasing while keeping AP in house. The best fit is usually a company with steady invoice volume, a modern ERP or accounting system and a clear owner for process design.",
  },
  invoice: {
    services:
      "Invoice processing providers handle mailroom and email intake, scanning, OCR and data extraction, line-item validation, coding, duplicate checks, exception handling and indexing into the client's ERP or AP platform. Some also process expense receipts, customer remittances and other financial documents.",
    audience:
      "It suits companies with high paper or PDF invoice volume, shared-service centers, or backlogs that manual keying cannot clear. It is also common when a business wants to remove paper from AP without replacing its existing ERP.",
  },
  bookkeeping: {
    services:
      "Bookkeeping and accounting firms usually cover transaction recording, bank and credit card reconciliation, bill pay, accounts receivable, payroll support, month-end close, financial statements and tax-ready records. Many work inside QuickBooks Online, Xero, NetSuite or Sage.",
    audience:
      "It suits small and mid-sized businesses that want clean books without a full in-house accounting department, and companies that need AP handled as part of a broader monthly close.",
  },
  bpo: {
    services:
      "Finance and accounting BPO providers run AP, AR, payroll, general ledger, reconciliation and reporting for clients, often from shared-service or offshore delivery centers. Engagements can be staff augmentation, a managed process or a full finance function, with documented SLAs and controls.",
    audience:
      "It suits mid-market and enterprise finance organizations that want to standardize processes, reduce cost per transaction, cover multiple entities and languages, or add capacity without adding local headcount.",
  },
};

export function buildFallbackContent(firm: Firm): FirmContent {
  const idx = getIndex();
  const cityFirms = getCity(firm.state, firm.citySlug);
  const stateFirms = idx.byState.get(firm.state) || [];
  const types = firmTypes(firm);
  const primary = types[0];
  const detail = TYPE_DETAIL[primary];
  const cityRated = cityFirms.filter((f) => f.rating != null);
  const stateRated = stateFirms.filter((f) => f.rating != null);
  const cityAvg = fmt(avg(cityRated.map((f) => f.rating as number)));
  const stateAvg = fmt(avg(stateRated.map((f) => f.rating as number)));
  const cityTypeCount = cityFirms.filter((f) => firmTypes(f).includes(primary)).length;
  const rank =
    1 + cityFirms.filter((f) => (f.reviews || 0) > (firm.reviews || 0)).length;
  const nearby = (idx.citiesByState.get(firm.state) || [])
    .filter((c) => c.city !== firm.city)
    .slice(0, 3)
    .map((c) => c.city);

  const name = firm.name;
  const cityState = `${firm.city}, ${stateName(firm.state)}`;
  const typeLabel = typePhrase(types);
  const ratingLine =
    firm.rating != null && firm.reviews != null
      ? `${name} has a public rating of ${firm.rating.toFixed(1)} out of 5 from ${firm.reviews.toLocaleString()} reviews. ${
          firm.reviews < 25
            ? "That is a small sample, so treat the score as a starting point rather than a definitive measure."
            : "The review volume is large enough to give the rating some weight, though ratings still reflect a mix of client sizes and engagements."
        }`
      : `${name} does not have a public rating yet. Buyers should ask for references, a sample invoice-to-pay workflow and a written scope before making a decision.`;

  const comparisonLine =
    cityAvg != null
      ? `Across ${cityFirms.length.toLocaleString()} listed providers in ${firm.city}, the average rating among rated firms is ${cityAvg.toFixed(
          1
        )}. Statewide, the average is ${stateAvg != null ? stateAvg.toFixed(1) : "not available"}. ${
          rank <= 10 ? `${name} ranks #${rank} in ${firm.city} by public review volume.` : ""
        }`
      : `${firm.city} has ${cityFirms.length.toLocaleString()} listed accounts payable providers. There is not yet enough rating data to calculate a reliable local average.`;

  const contactBits = [
    firm.address ? `It is at ${firm.address}.` : null,
    firm.phone ? `The phone number is ${firm.phone}.` : null,
    firm.website ? `Its website is ${firm.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const brief = `${name} is listed as a ${typeLabel} provider in ${cityState}. ${contactBits} ${firm.city} has ${cityFirms.length.toLocaleString()} accounts payable providers, and ${stateName(
    firm.state
  )} has ${stateFirms.length.toLocaleString()}. ${ratingLine}

Finance teams comparing ${firm.city}-area providers should look beyond the headline rating. Confirm the services included, the pricing model, the systems and ERP integrations, data security controls, service levels and how exceptions are handled before signing. ${detail.audience}`;

  const review = `## Overview
${name} is a ${typeLabel} provider listed in ${cityState}. ${contactBits} The firm appears in ${firm.categories.length ? firm.categories.join(", ") : "accounts payable service"} categories, which gives finance teams an initial sense of where it focuses. ${comparisonLine}

## Services and specialties
${detail.services} ${cityTypeCount > 1 ? `In ${firm.city}, ${cityTypeCount} listed providers also serve the ${FIRM_TYPE_LABELS[primary].toLowerCase()} segment, so buyers have alternatives to compare.` : `Few other listed providers in ${firm.city} focus on the same specialty, so it is worth asking how the firm handles work outside its core offering.`} Ask for a written scope that lists what is included, what is billed separately, expected turnaround times and who owns exceptions.

## What the public rating suggests
${ratingLine} A rating is most useful when read alongside the number of reviews and how recent the feedback is. Look for patterns around communication, accuracy, turnaround and support during month-end and audit periods. A high score from a small sample, or an old score with little recent activity, is less informative than a steady stream of recent reviews.

## Who it may suit
${detail.audience} It may also appeal to finance teams that value a local point of contact in ${firm.city}. ${nearby.length ? `Companies with operations in nearby areas such as ${nearby.join(", ")} should confirm coverage, time zone support and any travel or onboarding costs.` : ""}

## Questions to ask before hiring
Ask for a sample invoice-to-pay workflow, a copy of the service agreement and a pricing schedule. Confirm how invoices arrive, how coding and approvals are handled, how duplicate and fraud checks work, what the error and exception rates are, and how quickly month-end reconciliations are completed. Ask about SOC 2 or equivalent controls, data retention, access management, backup and exit procedures. Also confirm the notice period, volume commitments and what happens if invoice volume spikes.

## How it compares locally
${comparisonLine} Finance teams should compare at least three providers on the same set of questions. A smaller firm may offer more direct communication, while a larger provider may have deeper automation, coverage and controls. The right choice depends on invoice volume, ERP, entity structure, compliance needs and how much process ownership the team wants to keep.

## Verdict
${name} is a ${typeLabel} provider serving ${cityState}. ${firm.rating != null ? `Its public rating of ${firm.rating.toFixed(1)} from ${firm.reviews?.toLocaleString() || 0} reviews is a useful starting signal, but it is not a substitute for due diligence.` : `The absence of a public rating makes direct due diligence especially important.`} Validate pricing, SLAs, security and integrations before signing, and compare the firm with other ${firm.city} providers on the same criteria.`;

  const metaTitle = fitText(`${name} - ${firm.city}, ${firm.state}`, 60);
  const metaDescription = fitText(
    `Profile of ${name}, a ${typeLabel} provider in ${cityState}. Compare services, ratings, pricing signals and contact details.`,
    158
  );

  const keywords = [
    `${name} reviews`,
    `${name} accounts payable`,
    `${firm.city} accounts payable`,
    `accounts payable companies ${firm.city} ${firm.state}`,
    `${typeLabel} ${firm.city}`,
    `accounts payable services near ${firm.city}`,
  ];

  const tags = [
    FIRM_TYPE_LABELS[primary],
    ...(types.length > 1 ? types.slice(1).map((t) => FIRM_TYPE_LABELS[t]) : []),
    `${firm.city} local`,
    "Finance teams",
  ];

  const faqs: FirmFaq[] = [
    {
      q: `What accounts payable services does ${name} offer?`,
      a: `${name} is listed as a ${typeLabel} provider. Buyers should confirm the exact scope directly with the firm, since listing categories do not always capture every service, system integration or industry specialism.`,
    },
    {
      q: `Where is ${name} located?`,
      a: `${name} is listed in ${cityState}${firm.address ? ` at ${firm.address}` : ""}. ${firm.phone ? `The public phone number is ${firm.phone}.` : "A public phone number is not listed."}`,
    },
    {
      q: `What should I ask ${name} before hiring?`,
      a: "Ask for a written scope, pricing schedule, sample invoice-to-pay workflow and service levels. Confirm ERP integrations, exception handling, duplicate and fraud controls, security certifications, data ownership, reporting, volume commitments and the notice required to terminate.",
    },
  ];

  return {
    slug: firm.slug,
    name: firm.name,
    city: firm.city,
    state: firm.state,
    brief,
    review,
    metaTitle,
    metaDescription,
    keywords,
    tags,
    faqs,
    briefWordCount: wordCount(brief),
    reviewWordCount: wordCount(review),
    generatedAt: FALLBACK_UPDATED,
    model: "directory-fallback",
    isFallback: true,
  };
}

export function contentCoverage() {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data", "content-manifest.json"), "utf8")
    ) as { firmsWithContent?: number; totalFirms?: number; coverage?: number };
    return {
      firmsWithContent: manifest.firmsWithContent || 0,
      totalFirms: manifest.totalFirms || 0,
      coverage: manifest.coverage || 0,
    };
  } catch {
    return { firmsWithContent: 0, totalFirms: 0, coverage: 0 };
  }
}
