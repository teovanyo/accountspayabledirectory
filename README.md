# AccountsPayableDirectory.com

A US directory of accounts payable companies: outsourced AP teams, AP automation
platforms, invoice processors, bookkeeping firms and finance BPO providers.

Built with Next.js 16 (App Router), Tailwind CSS v4, and a generated dataset of
public business listings.

## Data

- `data/cities.json` — US cities (GeoNames, population >= 10,000)
- `data/firms.json` — deduplicated accounts payable providers
- `data/states.json` — state code to name map
- `data/raw/places.jsonl` — raw Google Maps scrape batches (not committed)

Pipeline:

```bash
MIN_POP=10000 node scripts/build-cities.mjs /path/to/US.txt
MIN_POP=10000 TOP_VARIANTS=500 CONCURRENCY=14 node scripts/collect.mjs
TOP=300 node scripts/collect-extra.mjs
node scripts/build-firms.mjs
node scripts/build-hero-map.mjs
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

The Dockerfile builds a standalone Next.js image on port 3000.

## Deploy

Production runs on Coolify3. Push to `main`, then trigger the Coolify deploy
(see `AGENTS.md`).
