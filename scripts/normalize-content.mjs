#!/usr/bin/env node
/**
 * Normalize generated firm content after a batch:
 * - keep meta titles at 60 chars and remove duplicated "Accounts Payable"
 * - keep meta descriptions at 158 chars, ending cleanly
 * - trim reviews above 700 words at a sentence boundary
 * - recompute word counts
 *
 * Usage: node scripts/normalize-content.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data", "content");
const dryRun = process.argv.includes("--dry-run");

function cleanDashes(value) {
  return String(value || "")
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}


function plainWords(value) {
  return String(value || "")
    .replace(/\bgovernance landscape\b/gi, "governance environment")
    .replace(/\bdirectory landscape\b/gi, "directory market")
    .replace(/\bfirm landscape\b/gi, "firm market")
    .replace(/\breview landscape\b/gi, "review base")
    .replace(/\b(accounts payable|management|rental|association|local|competitive|industry|business|regulatory|economic) landscape\b/gi, (m, p1) => {
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

function wordCount(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
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

function dedupePropertyManagement(title, firmName) {
  if (!/property\s+manage(ment|r)/i.test(firmName)) return title;
  const matches = [...title.matchAll(/property\s+management/gi)];
  if (matches.length <= 1) return title;
  let out = title;
  for (let i = matches.length - 1; i >= 1; i--) {
    const m = matches[i];
    out = out.slice(0, m.index) + out.slice(m.index + m[0].length);
  }
  return out
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[|:,-]+\s*$/g, "")
    .replace(/\s*[|:,-]+\s*(?=[A-Z])/g, " - ")
    .trim();
}

function normalizeTitle(title, firm) {
  let out = dedupePropertyManagement(String(title || ""), firm.name || "");
  const city = firm.city || "";
  const state = firm.state || "";
  const hasPm = /property\s+manage(ment|r)/i.test(out);
  const nameHasPm = /property\s+manage(ment|r)/i.test(firm.name || "");

  if (!hasPm) {
    const replaced = out.replace(/\bproperty\b/i, "Accounts Payable");
    if (replaced !== out && replaced.length <= 65) out = replaced;
    else out = fitText(`${firm.name} Accounts Payable - ${city}, ${state}`, 65);
  }

  if (state && !new RegExp(`\\b${state}\\b`, "i").test(out) && city) {
    const withState = out.replace(city, `${city}, ${state}`);
    if (withState.length <= 65) out = withState;
    else {
      const compact = out.replace(city, `${city} ${state}`);
      if (compact.length <= 65) out = compact;
      else out = fitText(`${firm.name}${nameHasPm ? "" : " Accounts Payable"} - ${city}, ${state}`, 65);
    }
  }

  return fitText(out, 65);
}

function trimReview(text, max = 700) {
  if (wordCount(text) <= max) return text;
  let parts = String(text).split(/\n{2,}/);
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
    const words = parts.join("\n\n").split(/\s+/);
    parts = [words.slice(0, max).join(" ")];
  }
  return parts.join("\n\n");
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

const files = walk(OUT_DIR);
let changed = 0;
let titleFixes = 0;
let descFixes = 0;
let reviewFixes = 0;

for (const file of files) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    continue;
  }
  const before = JSON.stringify(data);
  const firmName = data.name || "";

  data.brief = plainWords(cleanDashes(data.brief));
  data.review = plainWords(cleanDashes(data.review));
  data.metaTitle = cleanDashes(data.metaTitle);
  data.metaDescription = cleanDashes(data.metaDescription);
  data.keywords = (data.keywords || []).map(cleanDashes);
  data.tags = (data.tags || []).map(cleanDashes);
  data.faqs = (data.faqs || []).map((faq) => ({
    q: plainWords(cleanDashes(faq.q)),
    a: plainWords(cleanDashes(faq.a)),
  }));

  const title = normalizeTitle(String(data.metaTitle || ""), {
    name: firmName,
    city: data.city || "",
    state: data.state || "",
  });
  if (title !== data.metaTitle) {
    data.metaTitle = title;
    titleFixes++;
  }

  let desc = fitDescription(String(data.metaDescription || ""), 158);
  const city = data.city || "";
  const state = data.state || "";
  const nameHasCity = city && desc.toLowerCase().includes(city.toLowerCase());
  const nameHasCompany = firmName && desc.toLowerCase().includes(firmName.toLowerCase());
  if (desc.length < 120 || !nameHasCity || !nameHasCompany) {
    desc = fitDescription(
      `Profile of ${firmName}, a accounts payable company in ${city}, ${state}. Compare services, ratings and contact details.`,
      158
    );
  }
  if (desc !== data.metaDescription) {
    data.metaDescription = desc;
    descFixes++;
  }

  const review = trimReview(String(data.review || ""), 700);
  if (review !== data.review) {
    data.review = review;
    reviewFixes++;
  }

  data.briefWordCount = wordCount(data.brief);
  data.reviewWordCount = wordCount(data.review);

  if (JSON.stringify(data) !== before) {
    changed++;
    if (!dryRun) fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  }
}

console.log(
  `${dryRun ? "Would change" : "Changed"} ${changed}/${files.length} files ` +
    `(titles ${titleFixes}, descriptions ${descFixes}, reviews ${reviewFixes}).`
);
