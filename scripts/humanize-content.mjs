#!/usr/bin/env node
/**
 * Rewrite generated firm profiles with the Humanizer skill's rules.
 * Source: https://github.com/blader/humanizer (MIT)
 *
 * Usage:
 *   DEEPSEEK_API_KEY=... node scripts/humanize-content.mjs --limit 100 --concurrency 10
 *   node scripts/humanize-content.mjs --slugs some-firm --refresh
 *
 * The script is resumable. It skips files with humanizedAt unless --refresh.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const CONTENT = path.join(DATA, "content");
const LOG_FILE = path.join(DATA, "humanize-content.log");
const FAILURES_FILE = path.join(DATA, "humanize-content-failures.json");
const API_URL = "https://api.deepseek.com/chat/completions";
const BALANCE_URL = "https://api.deepseek.com/user/balance";
const MODEL = "deepseek-chat";
const MAX_ATTEMPTS = 2;
const REVIEW_MIN = 500;
const REVIEW_MAX = 700;
const BRIEF_MIN = 110;
const BRIEF_MAX = 240;

const RULES = `You are a human editor using the Humanizer rules. Rewrite the profile so it reads like a person wrote it. Keep every fact exactly: names, city, state, address, phone, website, rating, review count, categories, local firm counts, averages, rank, nearby cities, and all claims in the source. Do not add facts, dates, quotes, or numbers. Do not remove facts.

Remove AI tells:
- not-X-but-Y contrasts and split versions ("This isn't X. It's Y.")
- one-line closers and dramatic fragments ("That is the real win.")
- deep-sounding sayings ("At its core", "the real question is")
- staged openers ("Here's the thing", "Let's dive in")
- arguing with no one ("This isn't about...", "To be clear...")
- forced triads
- repeated sentence openings
- dashes as connectors (use periods, commas, colons, parentheses)
- stacked qualifiers
- overused AI words: delve, testament, landscape, showcase, robust, pivotal, crucial, meticulous, vibrant, underscore, highlight, bolster, garner, enduring, intricate, interplay, valuable, key (adjective)
- inflated significance ("marking a pivotal moment", "stands as a testament")
- vague association ("associated with", "in connection with")
- shallow -ing riders (highlighting, reflecting, showcasing, ensuring)
- sales language (nestled, in the heart of, breathtaking, renowned)
- borrowed authority (experts believe, industry reports)
- "serves as / stands as / boasts / features" when "is / has" works
- chatbot residue, knowledge-limit disclaimers, and references to "this profile", "this review", "directory data", "directory records", "provided data", "the source", or "AI"
- a heading repeated in the first sentence

Never write a sentence about the profile, the directory, the data, the source, or what information is or is not included. If the source text contains such a sentence, delete it or replace it with a fact from the listing.

Write plainly. Use active voice. Vary sentence length. Do not mention that you rewrote anything. Keep the seven H2 sections: Overview; Services and specialties; What the public rating suggests; Who it may suit; Questions to ask before hiring; How it compares locally; Verdict. Use regular hyphens only, never em dashes or en dashes.

Review: 540-620 words. This is a hard minimum: if the draft is under 540 words, add specific guidance about fees, maintenance approvals, owner reporting, or questions to ask, using only facts already in the source. Do not pad with repetition. Brief: 145-185 words in two short paragraphs.
Keep the same FAQ questions and answers, but rewrite them plainly. Return 3-4 FAQs.

Return JSON only:
{"brief":"...","review":"...","faqs":[{"q":"...","a":"..."}]}`;

function loadEnvFile() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m || process.env[m[1]]) continue;
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
    limit: 100,
    concurrency: 10,
    refresh: false,
    dryRun: false,
    slugs: null,
    minBalance: 0.8,
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
      case "--refresh":
        opts.refresh = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--slugs":
        opts.slugs = next().split(",").map((s) => s.trim()).filter(Boolean);
        break;
      case "--min-balance":
        opts.minBalance = Number(next());
        break;
      case "--verbose":
        opts.verbose = true;
        break;
      case "--help":
      case "-h":
        console.log(
          "Usage: node scripts/humanize-content.mjs [--limit N] [--concurrency N] [--slugs a,b] [--refresh] [--min-balance 0.8] [--dry-run]"
        );
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!Number.isFinite(opts.limit) || opts.limit < 0) opts.limit = 100;
  if (!Number.isFinite(opts.concurrency) || opts.concurrency < 1) opts.concurrency = 10;
  return opts;
}

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch {
    // ignore
  }
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function wordCount(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function cleanDashes(text) {
  return String(text || "")
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

const META_SENTENCE =
  /(?:^|(?<=[.!?])\s)(?:[^.!?]*(?:this profile|this review|this article|public directory information|directory data|directory records?|provided data|the source|compiled from|based on (?:public )?(?:listing|directory|business) (?:data|records?)|does not include verified|information was compiled)[^.!?]*[.!?])\s*/gi;

const META_REPLACEMENTS = [
  [/,?\s*according to (?:the )?(?:public )?(?:directory|listing) (?:data|records?)[^.]*/gi, ""],
  [/\baccording to directory records\b/gi, ""],
  [/\bin directory records\b/gi, "in the public listing"],
  [/\bin the directory record\b/gi, "in the public listing"],
  [/\bdirectory-assigned property type\b/gi, "listed property type"],
  [/\bdirectory records assign\b/gi, "the listing categorizes"],
  [/\bdirectory records show\b/gi, "the listing shows"],
  [/\bthis profile examines\b/gi, "this review covers"],
  [/\bthis profile\b/gi, "this review"],
  [/\bpublic directory information\b/gi, "public listing information"],
];

const WORD_REPLACEMENTS = [
  [/\bdelve\b/gi, "look"],
  [/\btestament\b/gi, "sign"],
  [/\bshowcase\b/gi, "show"],
  [/\bshowcasing\b/gi, "showing"],
  [/\brobust\b/gi, "strong"],
  [/\bpivotal\b/gi, "important"],
  [/\bcrucial\b/gi, "important"],
  [/\bmeticulous\b/gi, "careful"],
  [/\bmeticulously\b/gi, "carefully"],
  [/\bvibrant\b/gi, "active"],
  [/\bunderscore\b/gi, "show"],
  [/\bhighlight\b/gi, "show"],
  [/\bbolster\b/gi, "support"],
  [/\bgarner\b/gi, "get"],
  [/\benduring\b/gi, "lasting"],
  [/\bintricate\b/gi, "complex"],
  [/\binterplay\b/gi, "relationship"],
  [/\bvaluable\b/gi, "useful"],
  [/\bnestled\b/gi, "located"],
  [/\brenowned\b/gi, "well-known"],
  [/\bboasts\b/gi, "has"],
  [/\bserves as\b/gi, "is"],
  [/\bstands as\b/gi, "is"],
  [/\bAdditionally,\s*/g, "Also, "],
  [/\bFurthermore,\s*/g, "Also, "],
  [/\bMoreover,\s*/g, "Also, "],
  [/\bIn addition,\s*/g, "Also, "],
  [/\bIt is important to note that\s*/gi, ""],
  [/\bIt's worth noting that\s*/gi, ""],
  [/\bThat is the real win\.\s*/gi, ""],
  [/\bThat distinction matters\.\s*/gi, ""],
  [/\bLet that sink in\.\s*/gi, ""],
  [/\bRead that again\.\s*/gi, ""],
  [/\bAt its core,\s*/gi, ""],
];

function cleanup(text) {
  let out = cleanDashes(text);
  for (const [re, replacement] of META_REPLACEMENTS) out = out.replace(re, replacement);
  for (const [re, replacement] of WORD_REPLACEMENTS) out = out.replace(re, replacement);
  out = out.replace(META_SENTENCE, "");
  out = out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/^\s*[-:]\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return out;
}

function trimReview(text, max = 700) {
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

function normalize(raw, original) {
  const problems = [];
  const brief = cleanup(raw?.brief || "");
  let review = cleanup(raw?.review || "");
  review = trimReview(review, 700);
  const faqs = Array.isArray(raw?.faqs)
    ? raw.faqs
        .filter((f) => f && typeof f === "object")
        .map((f) => ({ q: cleanup(f.q || ""), a: cleanup(f.a || "") }))
        .filter((f) => f.q && f.a)
        .slice(0, 4)
    : [];

  const bw = wordCount(brief);
  const rw = wordCount(review);
  if (bw < BRIEF_MIN || bw > BRIEF_MAX) problems.push(`brief is ${bw} words; must be ${BRIEF_MIN}-${BRIEF_MAX}`);
  if (rw < REVIEW_MIN || rw > REVIEW_MAX) problems.push(`review is ${rw} words; must be ${REVIEW_MIN}-${REVIEW_MAX}`);
  if (faqs.length < 2) problems.push("fewer than 2 FAQs");
  if (faqs.some((f) => wordCount(f.a) < 10 || wordCount(f.a) > 200))
    problems.push("an FAQ answer is outside 10-200 words");

  return {
    ok: problems.length === 0,
    problems,
    brief,
    review,
    faqs: faqs.length ? faqs : original.faqs || [],
    briefWords: bw,
    reviewWords: rw,
  };
}

async function callDeepSeek(apiKey, payload, correction = "") {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: RULES },
        { role: "user", content: JSON.stringify(payload) },
        ...(correction ? [{ role: "user", content: correction }] : []),
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2300,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`DeepSeek ${res.status}: ${text.slice(0, 300)}`);
    err.retryable = res.status === 429 || res.status >= 500;
    throw err;
  }
  const json = JSON.parse(text);
  return {
    content: json.choices?.[0]?.message?.content || "",
    usage: json.usage || {},
  };
}

async function getBalance(apiKey) {
  const res = await fetch(BALANCE_URL, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) return null;
  const json = await res.json();
  const usd = json.balance_infos?.find((b) => b.currency === "USD");
  return usd ? Number(usd.total_balance) : null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function humanizeOne(file, apiKey) {
  const original = JSON.parse(fs.readFileSync(file, "utf8"));
  const payload = {
    name: original.name,
    city: original.city,
    state: original.state,
    address: original.address || null,
    phone: original.phone || null,
    website: original.website || null,
    rating: original.rating ?? null,
    reviews: original.reviews ?? null,
    categories: original.categories || [],
    brief: original.brief,
    review: original.review,
    faqs: original.faqs || [],
  };

  let lastProblems = [];
  let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const correction =
      attempt === 1
        ? ""
        : `\n\nYour previous rewrite had these problems:\n- ${lastProblems.join(
            "\n- "
          )}\n\nRewrite the full JSON and fix every problem. The review must be at least 540 words and no more than 620. Add specific, source-grounded detail if it is short. Keep the brief between 145 and 185 words.`;
    let result;
    try {
      result = await callDeepSeek(apiKey, payload, correction);
    } catch (err) {
      if (err.retryable && attempt < MAX_ATTEMPTS) {
        await sleep(1500 + Math.random() * 1000);
        continue;
      }
      throw err;
    }
    totalUsage.prompt_tokens += result.usage.prompt_tokens || 0;
    totalUsage.completion_tokens += result.usage.completion_tokens || 0;
    totalUsage.total_tokens += result.usage.total_tokens || 0;

    let parsed;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      lastProblems = ["response was not valid JSON"];
      continue;
    }
    const checked = normalize(parsed, original);
    if (checked.ok) {
      return {
        ...original,
        brief: checked.brief,
        review: checked.review,
        faqs: checked.faqs,
        briefWordCount: checked.briefWords,
        reviewWordCount: checked.reviewWords,
        humanizedAt: new Date().toISOString(),
        humanizer: "blader/humanizer",
        usage: totalUsage,
      };
    }
    lastProblems = checked.problems;
  }
  const err = new Error(lastProblems.join("; "));
  throw err;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  loadEnvFile();
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const balance = await getBalance(apiKey);
  log(`Starting. DeepSeek balance: ${balance == null ? "unknown" : "$" + balance.toFixed(2)}`);

  let files = walk(CONTENT);
  if (opts.slugs) {
    const set = new Set(opts.slugs);
    files = files.filter((f) => set.has(path.basename(f, ".json")));
  }
  if (!opts.refresh) {
    files = files.filter((f) => {
      try {
        const c = JSON.parse(fs.readFileSync(f, "utf8"));
        return !c.humanizedAt;
      } catch {
        return false;
      }
    });
  }
  files.sort();
  if (opts.limit >= 0) files = files.slice(0, opts.limit);

  log(`${files.length} file(s) selected.`);
  if (opts.dryRun) {
    for (const f of files.slice(0, 20)) console.log(f);
    return;
  }
  if (!files.length) return;

  const startedAt = Date.now();
  const stats = { ok: 0, failed: 0, promptTokens: 0, completionTokens: 0, failures: [] };
  let stopping = false;
  let balanceCheckAt = 0;
  let lastBalance = balance;

  process.on("SIGINT", () => {
    if (stopping) process.exit(130);
    stopping = true;
    log("Stopping after in-flight requests. Press Ctrl+C again to force quit.");
  });

  let next = 0;
  async function worker() {
    while (!stopping) {
      const idx = next++;
      if (idx >= files.length) return;
      const file = files[idx];
      const slug = path.basename(file, ".json");
      try {
        const updated = await humanizeOne(file, apiKey);
        fs.writeFileSync(file, JSON.stringify(updated, null, 2) + "\n");
        stats.ok++;
        stats.promptTokens += updated.usage?.prompt_tokens || 0;
        stats.completionTokens += updated.usage?.completion_tokens || 0;
        if (opts.verbose || stats.ok % 25 === 0) {
          const elapsed = (Date.now() - startedAt) / 1000;
          const rate = stats.ok / Math.max(elapsed, 1);
          const remaining = files.length - stats.ok - stats.failed;
          const eta = rate > 0 ? Math.round(remaining / rate) : null;
          log(
            `[${stats.ok + stats.failed}/${files.length}] ${slug} ok (${updated.reviewWordCount}w) | ${rate.toFixed(
              2
            )}/s | ${eta == null ? "?" : `eta ${Math.floor(eta / 60)}m${eta % 60}s`}`
          );
        }
        if (stats.ok - balanceCheckAt >= 250) {
          balanceCheckAt = stats.ok;
          const b = await getBalance(apiKey);
          if (b != null) {
            lastBalance = b;
            if (b < opts.minBalance) {
              log(`Balance $${b.toFixed(2)} is below the $${opts.minBalance} floor. Stopping.`);
              stopping = true;
              return;
            }
          }
        }
      } catch (err) {
        stats.failed++;
        stats.failures.push({ slug, error: err.message });
        log(`[${stats.ok + stats.failed}/${files.length}] ${slug} FAILED: ${err.message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(opts.concurrency, files.length) }, () => worker())
  );

  fs.writeFileSync(FAILURES_FILE, JSON.stringify(stats.failures, null, 2) + "\n");
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  const cost =
    (stats.promptTokens * 0.28 + stats.completionTokens * 0.56) / 1e6;
  log(
    `Done. ${stats.ok} humanized, ${stats.failed} failed in ${Math.floor(elapsed / 60)}m${elapsed % 60}s. ` +
      `Approx cost $${cost.toFixed(2)}. Balance now $${lastBalance == null ? "?" : lastBalance.toFixed(2)}.`
  );
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
