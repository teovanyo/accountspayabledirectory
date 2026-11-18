import { getIndex } from "@/lib/data";
import { BASE_URL, SITE_LASTMOD, SITEMAP_CHUNK_SIZE } from "@/lib/sitemap";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { firms } = getIndex();
  const slice = firms.slice((page - 1) * SITEMAP_CHUNK_SIZE, page * SITEMAP_CHUNK_SIZE);
  const lastmod = SITE_LASTMOD;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slice
  .map(
    (f) =>
      `  <url><loc>${BASE_URL}/firm/${f.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
  )
  .join("\n")}
</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}
