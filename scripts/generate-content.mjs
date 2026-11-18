#!/usr/bin/env node
/**
 * Generate editorial briefs and reviews for accounts payable companies.
 *
 * Usage:
 *   DEEPSEEK_API_KEY=... node scripts/generate-content.mjs --limit 25 --concurrency 8
 *   node scripts/generate-content.mjs --state TX --limit 100
 *   node scripts/generate-content.mjs --slugs some-firm-slug,another-slug --refresh
 *
 * The script is resumable: it skips firms that already have a content file unless
 * --refresh is passed. Content is written one JSON file per firm under
 * data/content/<state>/<slug>.json so the site can read it on demand.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const OUT_DIR = path.join(DATA, "content");
const LOG_FILE = path.join(DATA, "content-generation.log");
const MANIFEST_FILE = path.join(DATA, "content-manifest.json");
const FAILURES_FILE = path.join(DATA, "content-generation-failures.json");

const API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_LIMIT = 50;
const MAX_ATTEMPTS = 3;
const REVIEW_MIN = 500;
const REVIEW_MAX = 720;
const REVIEW_TARGET_MIN = 560;
const REVIEW_TARGET_MAX = 650;
const BRIEF_MIN = 130;
const BRIEF_MAX = 260;

function loadEnvFile() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    if (process.env[m[1]]) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[m[1]] = value;
  }
}

function parseArgs(argv) {
  const opts = {
    limit: DEFAULT_LIMIT,
    concurrency: DEFAULT_CONCURRENCY,
    model: DEFAULT_MODEL,
    refresh: false,
    dryRun: false,
    top: true,
    minReviews: 0,
    requireWebsite: false,
    states: null,
    slugs: null,
    maxTokens: 2400,
    temperature: 0.55,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`Missing value for ${arg}`);
      return v;
    };
    switch (arg) {
      case "--limit":
        opts.limit = Number(next());
        break;
      case "--concurrency":
        opts.concurrency = Number(next());
        break;
      case "--model":
        opts.model = next();
        break;
      case "--refresh":
        opts.refresh = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--min-reviews":
        opts.minReviews = Number(next());
        break;
      case "--require-website":
        opts.requireWebsite = true;
        break;
      case "--state":
      case "--states":
        opts.states = next()
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        break;
      case "--slugs":
        opts.slugs = next()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "--max-tokens":
        opts.maxTokens = Number(next());
        break;
      case "--temperature":
        opts.temperature = Number(next());
        break;
      case "--no-top":
        opts.top = false;
        break;
      case "--verbose":
        opts.verbose = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!Number.isFinite(opts.limit) || opts.limit < 0) opts.limit = DEFAULT_LIMIT;
  if (!Number.isFinite(opts.concurrency) || opts.concurrency < 1) opts.concurrency = DEFAULT_CONCURRENCY;
  return opts;
}

function printHelp() {
  console.log(`Generate firm briefs and reviews with DeepSeek.

Options:
  --limit N            Number of firms to process (default ${DEFAULT_LIMIT})
  --concurrency N      Parallel requests (default ${DEFAULT_CONCURRENCY})
  --model NAME         DeepSeek model (default ${DEFAULT_MODEL})
  --state XX,YY        Only these states
  --slugs a,b          Only these firm slugs
  --min-reviews N      Only firms with at least N public reviews
  --require-website    Only firms with a website
  --refresh            Overwrite existing content
  --dry-run            Show selection without calling the API
  --no-top             Keep the natural dataset order instead of priority order
  --max-tokens N       Max completion tokens (default 2400)
  --temperature N      Sampling temperature (default 0.55)
  --verbose            Print each firm result

Environment:
  DEEPSEEK_API_KEY     Required. Also read from .env.local
`);
}

function loadFirms() {
  const file = path.join(DATA, "firms.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const STATE_NAMES = JSON.parse(fs.readFileSync(path.join(DATA, "states.json"), "utf8"));

function stateName(code) {
  return STATE_NAMES[code] || code;
}

function typeOf(firm) {
  const text = `${firm.name} ${(firm.categories || []).join(" ")}`;
  const types = [];
  if (/homeowners association|housing association|hoa|association management|community association/i.test(text))
    types.push("hoa");
  if (/commercial|office space rental|office building/i.test(text)) types.push("commercial");
  if (/vacation|short[- ]term|short term apartment/i.test(text)) types.push("short-term");
  if (/apartment|condominium|multifamily/i.test(text)) types.push("apartment");
  return types.length ? [...new Set(types)] : ["residential"];
}

function avg(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function fmt(n, digits = 1) {
  if (n == null || !Number.isFinite(n)) return null;
  return Number(n.toFixed(digits));
}

function buildContext(firms) {
  const byCity = new Map();
  const byState = new Map();
  for (const f of firms) {
    const cityKey = `${f.state}/${f.citySlug}`;
    if (!byCity.has(cityKey)) byCity.set(cityKey, []);
    byCity.get(cityKey).push(f);
    if (!byState.has(f.state)) byState.set(f.state, []);
    byState.get(f.state).push(f);
  }
  const cities = JSON.parse(fs.readFileSync(path.join(DATA, "cities.json"), "utf8"));
  const citiesByState = new Map();
  for (const c of cities) {
    if (!citiesByState.has(c.state)) citiesByState.set(c.state, []);
    citiesByState.get(c.state).push(c);
  }
  return { byCity, byState, citiesByState };
}

function distanceMiles(a, b) {
  if (!a || !b || a.lat == null || a.lon == null || b.lat == null || b.lon == null) return Infinity;
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function cityFor(firm, context) {
  const list = context.citiesByState.get(firm.state) || [];
  const wanted = firm.city.toLowerCase();
  return (
    list.find((c) => c.name.toLowerCase() === wanted) ||
    list.find((c) => c.name.toLowerCase().startsWith(wanted)) ||
    null
  );
}

function localContext(firm, context) {
  const cityKey = `${firm.state}/${firm.citySlug}`;
  const cityFirms = context.byCity.get(cityKey) || [];
  const stateFirms = context.byState.get(firm.state) || [];
  const cityRated = cityFirms.filter((f) => f.rating != null);
  const stateRated = stateFirms.filter((f) => f.rating != null);
  const cityAvg = avg(cityRated.map((f) => f.rating));
  const stateAvg = avg(stateRated.map((f) => f.rating));
  const reviews = firm.reviews || 0;
  const rank = 1 + cityFirms.filter((f) => (f.reviews || 0) > reviews).length;
  const cityTypes = {};
  for (const f of cityFirms) {
    for (const t of typeOf(f)) cityTypes[t] = (cityTypes[t] || 0) + 1;
  }
  const city = cityFor(firm, context);
  const nearby = city
    ? (context.citiesByState.get(firm.state) || [])
        .filter((c) => c.name !== city.name && (c.population || 0) > 0)
        .map((c) => ({ c, d: distanceMiles(city, c) }))
        .filter((x) => Number.isFinite(x.d))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map((x) => x.c.name)
    : [];
  return {
    cityFirmCount: cityFirms.length,
    stateFirmCount: stateFirms.length,
    cityAvgRating: fmt(cityAvg),
    stateAvgRating: fmt(stateAvg),
    cityRatedCount: cityRated.length,
    stateRatedCount: stateRated.length,
    reviewRank: rank > 10 ? null : rank,
    cityTypes,
    nearbyCities: nearby,
  };
}

function priorityScore(firm) {
  const reviews = Math.min(firm.reviews || 0, 10000);
  const rating = firm.rating || 0;
  return (
    (firm.website ? 1_000_000 : 0) +
    (firm.phone ? 5_000 : 0) +
    reviews * 10 +
    Math.round(rating * 250) +
    (firm.address ? 100 : 0)
  );
}

function contentPath(firm) {
  return path.join(OUT_DIR, firm.state.toLowerCase(), `${firm.slug}.json`);
}

function hasContent(firm) {
  return fs.existsSync(contentPath(firm));
}

function selectFirms(firms, opts) {
  let selected = firms;
  if (opts.slugs) {
    const set = new Set(opts.slugs);
    selected = selected.filter((f) => set.has(f.slug));
  }
  if (opts.states) {
    const set = new Set(opts.states);
    selected = selected.filter((f) => set.has(f.state));
  }
  if (opts.minReviews) selected = selected.filter((f) => (f.reviews || 0) >= opts.minReviews);
  if (opts.requireWebsite) selected = selected.filter((f) => !!f.website);
  if (!opts.refresh) selected = selected.filter((f) => !hasContent(f));
  if (opts.top) {
    selected = [...selected].sort(
      (a, b) => priorityScore(b) - priorityScore(a) || a.name.localeCompare(b.name)
    );
  }
  if (opts.limit >= 0) selected = selected.slice(0, opts.limit);
  return selected;
}

function buildPrompt(firm, context) {
  const lc = localContext(firm, context);
  const types = typeOf(firm).join(", ");
  const cityTypeLine = Object.entries(lc.cityTypes)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${t}: ${n}`)
    .join("; ");
  return `You are a senior editor writing company profiles for AccountsPayableDirectory.com, a free US directory of accounts payable companies. Write an original, factual, useful editorial profile - not a sales page and not a generic essay.

COMPANY DATA
- Name: ${firm.name}
- City: ${firm.city}, ${stateName(firm.state)} (${firm.state})
- Address: ${firm.address || "not listed"}
- Phone: ${firm.phone || "not listed"}
- Website: ${firm.website || "not listed"}
- Public rating: ${firm.rating != null ? `${firm.rating} out of 5` : "not listed"}
- Public review count: ${firm.reviews != null ? firm.reviews : "not listed"}
- Listed categories: ${(firm.categories || []).join(", ")}
- Directory-assigned property types: ${types}

LOCAL CONTEXT (computed from directory records, do not contradict)
- Firms listed in ${firm.city}: ${lc.cityFirmCount}
- Firms listed in ${stateName(firm.state)}: ${lc.stateFirmCount}
- Average rating of rated firms in ${firm.city}: ${lc.cityAvgRating ?? "not enough data"}
- Average rating of rated firms in ${stateName(firm.state)}: ${lc.stateAvgRating ?? "not enough data"}
- This firm's rank by public review volume in ${firm.city}: ${lc.reviewRank ? `#${lc.reviewRank}` : "outside the top 10"}
- Property-type mix in ${firm.city} (firms can have more than one type): ${cityTypeLine || "not available"}
- Nearby cities: ${lc.nearbyCities.join(", ") || "not available"}

RULES
- Use only the facts above. Never invent a founding year, owner, fee, license, award, staff size, response time, service guarantee, client name, or specific service that is not supported by the categories.
- Do not refer to "the data provided", "directory data", the prompt, the directory record, or yourself as an AI. Write as a human editor. State facts directly ("The firm has 10,840 public reviews") rather than attributing them to a dataset.
- General industry guidance is allowed when clearly framed as advice, e.g. "Owners should ask..." or "A typical residential manager..." Do not present general industry norms as this company's verified terms.
- Be specific to this city, state, and property-type mix. Avoid sentences that could be pasted onto any other firm unchanged. Be direct when the data supports a statement; use "likely" only when inferring a service that is not explicitly listed.
- Mention the public rating and review count honestly. If the sample is small (under 25 reviews), say the sample is small and should be treated cautiously. If there is no rating, say so and explain what to check instead.
- Never fabricate customer quotes or testimonials.
- The review must be 560-650 words. Count words carefully. Do not pad with repetition. Use Markdown H2 headings (##) for sections.
- The brief must be 150-200 words, in two short paragraphs separated by a blank line.
- Meta title must be 60 characters or fewer and must include the company name, the city, the state abbreviation, and the phrase "Accounts Payable" (or "Property Manager"). If the company name already contains "Accounts Payable", do not repeat the phrase a second time.
- Meta description must be 150-158 characters and must include the company name and the city.
- Use regular hyphens (-), not em dashes or en dashes, in all output.
- Write plain, human prose. Avoid not-X-but-Y contrasts, one-line closers, staged openers ("Here's the thing"), forced triads, dashes as connectors, overused AI words (delve, testament, landscape, showcase, robust, pivotal, crucial, meticulous, vibrant, underscore, highlight), inflated significance, sales language, borrowed authority, and references to "this profile", "directory data", or "provided data".
- Keywords should be realistic search phrases, not comma-stuffed fragments.
- FAQs must be answerable from the facts above or from general guidance. Do not invent company-specific facts.

OUTPUT STRICT JSON ONLY, with exactly these keys:
{
  "brief": "150-200 words, two paragraphs separated by \\n\\n. Summarize the company, its listed specialties, location, and who it may suit.",
  "review": "560-650 words. Use ## headings in this order: Overview; Services and specialties; What the public rating suggests; Who it may suit; Questions to ask before hiring; How it compares locally; Verdict. Write in third person, editorial voice.",
  "metaTitle": "60 characters or fewer, include the company name, city, state and 'Accounts Payable'",
  "metaDescription": "150-158 characters, accurate, no hype, include the company name and city",
  "keywords": ["6-10 realistic search phrases"],
  "tags": ["4-8 short specialty or audience tags, e.g. 'Vacation rentals', 'HOA management', 'Investor services'"],
  "faqs": [
    {"q": "question", "a": "40-70 word factual answer"}
  ]
}`;
}

function stripJsonFence(text) {
  let s = String(text || "").trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  return s;
}

function wordCount(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function cleanDashes(value) {
  return String(value || "").replace(/[\u2014\u2013]/g, "-");
}

function fitText(text, max) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf(","), cut.lastIndexOf("-"));
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:-]+$/, "");
}

function fitDescription(text, max = 158) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.55) return cut.slice(0, sentence + 1);
  const at = cut.lastIndexOf(" ");
  const trimmed = (at > max * 0.55 ? cut.slice(0, at) : cut).replace(/[\s,;:-]+$/, "");
  return trimmed + ".";
}

function validate(raw, firm) {
  const problems = [];
  if (!raw || typeof raw !== "object") return { ok: false, problems: ["response was not a JSON object"] };

  const brief = cleanDashes(raw.brief).trim();
  const review = cleanDashes(raw.review).trim();
  const metaTitle = cleanDashes(raw.metaTitle).trim();
  const metaDescription = cleanDashes(raw.metaDescription).trim();
  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords.map((s) => cleanDashes(s).trim()).filter(Boolean)
    : [];
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((s) => cleanDashes(s).trim()).filter(Boolean)
    : [];
  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs
        .filter((f) => f && typeof f === "object")
        .map((f) => ({ q: cleanDashes(f.q).trim(), a: cleanDashes(f.a).trim() }))
        .filter((f) => f.q && f.a)
        .slice(0, 4)
    : [];

  const briefWords = wordCount(brief);
  const reviewWords = wordCount(review);

  if (briefWords < BRIEF_MIN || briefWords > BRIEF_MAX)
    problems.push(`brief is ${briefWords} words; must be ${BRIEF_MIN}-${BRIEF_MAX}`);
  if (reviewWords < REVIEW_MIN || reviewWords > REVIEW_MAX)
    problems.push(`review is ${reviewWords} words; must be ${REVIEW_MIN}-${REVIEW_MAX}`);
  if (!metaTitle) problems.push("metaTitle is empty");
  if (!metaDescription) problems.push("metaDescription is empty");
  if (!keywords.length) problems.push("keywords is empty");
  if (!tags.length) problems.push("tags is empty");
  if (!faqs.length) problems.push("faqs is empty");
  if (faqs.some((f) => wordCount(f.a) < 20 || wordCount(f.a) > 100))
    problems.push("one or more FAQ answers are outside 20-100 words");

  const cityLower = firm.city.toLowerCase();
  const currentTitle = metaTitle || "";
  const titleHasPm = /property\s+manage(ment|r)/i.test(currentTitle);
  const titleHasCity = currentTitle.toLowerCase().includes(cityLower);
  const fallbackTitle = `${firm.name} Accounts Payable - ${firm.city}, ${firm.state}`;
  const cleanTitle = fitText(!titleHasPm || !titleHasCity ? fallbackTitle : currentTitle, 60);

  const currentDesc = metaDescription || "";
  const descHasPm = /property\s+manage(ment|r)/i.test(currentDesc);
  const descHasCity = currentDesc.toLowerCase().includes(cityLower);
  const fallbackDesc = `Profile of ${firm.name}, a accounts payable company in ${firm.city}, ${stateName(
    firm.state
  )}. Compare services, ratings, contact details and local firms.`;
  const cleanDesc = fitDescription(!descHasPm || !descHasCity ? fallbackDesc : currentDesc, 158);

  const cleanKeywords = [...new Set(keywords)].slice(0, 12);
  const cityKey = `${firm.city} accounts payable`.toLowerCase();
  if (!cleanKeywords.some((k) => k.toLowerCase().includes(firm.name.toLowerCase())))
    cleanKeywords.unshift(`${firm.name} reviews`);
  if (!cleanKeywords.some((k) => k.toLowerCase().includes(cityLower)))
    cleanKeywords.push(`${firm.city} accounts payable`);
  if (!cleanKeywords.some((k) => k.toLowerCase().includes("accounts payable")))
    cleanKeywords.push(cityKey);

  const clean = {
    brief,
    review,
    metaTitle: cleanTitle,
    metaDescription: cleanDesc,
    keywords: cleanKeywords.slice(0, 14),
    tags: [...new Set(tags)].slice(0, 8),
    faqs: faqs.length
      ? faqs
      : [
          {
            q: `What should I ask ${firm.name} before hiring?`,
            a: "Ask about fees, the management agreement term, maintenance markups, leasing and renewal charges, owner reporting, and who handles emergencies. Confirm licensing and insurance in writing before signing.",
          },
        ],
  };

  return {
    ok: problems.length === 0,
    problems,
    content: clean,
    briefWords,
    reviewWords,
  };
}

function readApiKey() {
  loadEnvFile();
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. Add it to .env.local or pass it in the environment."
    );
  }
  return key;
}

async function callDeepSeek({ apiKey, model, messages, maxTokens, temperature }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature,
      max_tokens: maxTokens,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`DeepSeek ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    err.retryable = res.status === 429 || res.status >= 500;
    throw err;
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`DeepSeek returned non-JSON: ${text.slice(0, 300)}`);
  }
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned an empty completion");
  return { content, usage: json.usage || {}, model: json.model || model };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateOne(firm, context, opts, apiKey) {
  const basePrompt = buildPrompt(firm, context);
  let lastProblems = [];
  let lastContent = "";
  let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const correction =
      attempt === 1
        ? ""
        : `\n\nYour previous output had these problems:\n- ${lastProblems.join(
            "\n- "
          )}\n\nRewrite the complete JSON and fix every problem. Keep the review between ${REVIEW_TARGET_MIN} and ${REVIEW_TARGET_MAX} words and the brief between 150 and 200 words.`;
    let result;
    try {
      result = await callDeepSeek({
        apiKey,
        model: opts.model,
        messages: [{ role: "user", content: basePrompt + correction }],
        maxTokens: opts.maxTokens,
        temperature: opts.temperature,
      });
    } catch (err) {
      if (err.retryable && attempt < MAX_ATTEMPTS) {
        const wait = Math.min(30000, 1500 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 1000);
        log(`  retry ${firm.slug} in ${Math.round(wait / 1000)}s (${err.message})`);
        await sleep(wait);
        continue;
      }
      throw err;
    }

    totalUsage.prompt_tokens += result.usage.prompt_tokens || 0;
    totalUsage.completion_tokens += result.usage.completion_tokens || 0;
    totalUsage.total_tokens += result.usage.total_tokens || 0;
    lastContent = result.content;

    let parsed;
    try {
      parsed = JSON.parse(stripJsonFence(result.content));
    } catch (err) {
      lastProblems = [`the response was not valid JSON (${err.message})`];
      continue;
    }

    const checked = validate(parsed, firm);
    if (checked.ok) {
      return {
        slug: firm.slug,
        name: firm.name,
        city: firm.city,
        state: firm.state,
        ...checked.content,
        briefWordCount: checked.briefWords,
        reviewWordCount: checked.reviewWords,
        generatedAt: new Date().toISOString(),
        model: result.model,
        usage: totalUsage,
      };
    }

    lastProblems = checked.problems;
    log(`  validation ${firm.slug}: ${checked.problems.join("; ")}`);
  }

  const err = new Error(`validation failed after ${MAX_ATTEMPTS} attempts: ${lastProblems.join("; ")}`);
  err.partial = lastContent.slice(0, 1000);
  throw err;
}

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch {
    // logging should never break generation
  }
}

function writeContent(content, firm) {
  const file = contentPath(firm);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(content, null, 2) + "\n");
}

function countExisting(firms) {
  let count = 0;
  for (const f of firms) if (hasContent(f)) count++;
  return count;
}

function writeManifest(firms, startedAt, stats, opts) {
  const byState = {};
  let total = 0;
  for (const f of firms) {
    if (!hasContent(f)) continue;
    total++;
    byState[f.state] = (byState[f.state] || 0) + 1;
  }
  const manifest = {
    totalFirms: firms.length,
    firmsWithContent: total,
    coverage: firms.length ? Number(((total / firms.length) * 100).toFixed(1)) : 0,
    byState,
    lastRun: {
      startedAt,
      finishedAt: new Date().toISOString(),
      model: opts.model,
      requested: stats.requested,
      succeeded: stats.succeeded,
      failed: stats.failed,
      promptTokens: stats.promptTokens,
      completionTokens: stats.completionTokens,
      totalTokens: stats.totalTokens,
      elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    },
  };
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = readApiKey();
  const firms = loadFirms();
  const context = buildContext(firms);
  const selected = selectFirms(firms, opts);
  const already = countExisting(firms);

  log(
    `Selected ${selected.length} firm(s). ${already.toLocaleString()}/${firms.length.toLocaleString()} already have content. Model: ${opts.model}.`
  );

  if (opts.dryRun) {
    for (const f of selected.slice(0, 20)) {
      const lc = localContext(f, context);
      console.log(
        `${f.slug} | ${f.city}, ${f.state} | rating ${f.rating ?? "-"} (${f.reviews ?? 0}) | city firms ${lc.cityFirmCount} | website ${f.website ? "yes" : "no"}`
      );
    }
    if (selected.length > 20) console.log(`... and ${selected.length - 20} more`);
    return;
  }
  if (!selected.length) {
    log("Nothing to do.");
    return;
  }

  const startedAt = Date.now();
  const stats = {
    requested: selected.length,
    succeeded: 0,
    failed: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    failures: [],
  };
  let stopping = false;
  process.on("SIGINT", () => {
    if (stopping) process.exit(130);
    stopping = true;
    log("Stopping after in-flight requests. Press Ctrl+C again to force quit.");
  });

  let next = 0;
  const results = [];
  async function worker() {
    while (true) {
      if (stopping) return;
      const idx = next++;
      if (idx >= selected.length) return;
      const firm = selected[idx];
      const started = Date.now();
      try {
        const content = await generateOne(firm, context, opts, apiKey);
        writeContent(content, firm);
        stats.succeeded++;
        stats.promptTokens += content.usage.prompt_tokens || 0;
        stats.completionTokens += content.usage.completion_tokens || 0;
        stats.totalTokens += content.usage.total_tokens || 0;
        results.push({ slug: firm.slug, ms: Date.now() - started, reviewWords: content.reviewWordCount });
        if (opts.verbose || stats.succeeded % 10 === 0) {
          const elapsed = (Date.now() - startedAt) / 1000;
          const rate = stats.succeeded / Math.max(elapsed, 1);
          const remaining = selected.length - stats.succeeded - stats.failed;
          const eta = rate > 0 ? Math.round(remaining / rate) : null;
          log(
            `[${stats.succeeded + stats.failed}/${selected.length}] ${firm.slug} ok in ${Math.round(
              (Date.now() - started) / 1000
            )}s | review ${content.reviewWordCount}w | ${rate.toFixed(2)}/s | ${
              eta == null ? "?" : `eta ${Math.floor(eta / 60)}m${eta % 60}s`
            }`
          );
        }
      } catch (err) {
        stats.failed++;
        stats.failures.push({ slug: firm.slug, name: firm.name, error: err.message, partial: err.partial });
        log(`[${stats.succeeded + stats.failed}/${selected.length}] ${firm.slug} FAILED: ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(opts.concurrency, selected.length) }, () =>
    worker()
  );
  await Promise.all(workers);

  fs.writeFileSync(FAILURES_FILE, JSON.stringify(stats.failures, null, 2) + "\n");
  const manifest = writeManifest(firms, startedAt, stats, opts);
  const elapsed = (Date.now() - startedAt) / 1000;
  log(
    `Done. ${stats.succeeded} succeeded, ${stats.failed} failed in ${Math.round(elapsed)}s. ` +
      `Tokens: ${stats.promptTokens.toLocaleString()} in / ${stats.completionTokens.toLocaleString()} out. ` +
      `Coverage: ${manifest.firmsWithContent.toLocaleString()}/${manifest.totalFirms.toLocaleString()} (${manifest.coverage}%).`
  );
  if (stats.failures.length) log(`Failures written to ${path.relative(ROOT, FAILURES_FILE)}`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
