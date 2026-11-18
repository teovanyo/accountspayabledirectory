import { getIndex, FIRM_TYPES } from "@/lib/data";
import { BASE_URL, SITE_LASTMOD } from "@/lib/sitemap";

export async function GET() {
  const { states } = getIndex();
  const lastmod = SITE_LASTMOD;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/directory</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/about</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${BASE_URL}/site-map</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>${BASE_URL}/top-rated</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
${FIRM_TYPES.map((t) => `  <url><loc>${BASE_URL}/type/${t}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join("\n")}
${states
  .map(
    (s) =>
      `  <url><loc>${BASE_URL}/state/${s.code.toLowerCase()}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  )
  .join("\n")}
</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}
