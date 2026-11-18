import fs from "node:fs";
import path from "node:path";

export const BASE_URL = "https://accountspayabledirectory.com";

function latestDataMtime() {
  const candidates = [
    path.join(process.cwd(), "data", "firms.json"),
    path.join(process.cwd(), "data", "content-manifest.json"),
  ];
  let latest = 0;
  for (const file of candidates) {
    try {
      const stat = fs.statSync(file);
      if (stat.mtimeMs > latest) latest = stat.mtimeMs;
    } catch {
      // ignore missing files
    }
  }
  return latest;
}

export const SITE_LASTMOD = new Date(latestDataMtime() || Date.now()).toISOString();
export const SITEMAP_CHUNK_SIZE = 10000;
