export function GET() {
  const body = `User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Disallow: /search
Disallow: /api/

Sitemap: https://accountspayabledirectory.com/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
