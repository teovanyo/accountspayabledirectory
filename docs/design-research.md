# Design & UI research - PropertyManagementFirms.com
_Researched 2026-10-31. Star counts and licenses pulled from the GitHub API the same day._

## 1. What the site looks like today

Reviewed the live home, city and firm pages (`~/ego/pmf-design-audit-20261031/*.png`).

**What works:** fast, clean, readable, sensible hierarchy, no visual noise, real data density.

**What holds it back:**

| Issue | Detail |
|---|---|
| No visual anchor | Text-only hero on a flat cream background; nothing says "property management" (no city photo, no map, no illustration). |
| Uniform cards | Every firm is the same grey-bordered rectangle: name, phone, URL, address, 3 pills. No logos, no photos, no differentiation, no "featured", no status ("verified", "responds fast"). |
| No map | Local-search users expect a map. Yelp, Thumbtack, Porch, Zillow all pair list + map. We already store lat/lon for every firm. |
| Search is a bare input | No autocomplete, no city/state typeahead, no "near me", no recent searches, no filter chips. |
| Type scale is timid | Body 14-16px, category pills 11px, headings 24-30px; the whole page reads as one weight. |
| Accent colour fails contrast | `#c8963e` gold on `#fbfaf7` = **2.55:1** (WCAG AA needs 4.5:1 for small text). Used for the eyebrow line. `stone-400` on white = 2.52:1 (the "More in Texas" links are close to this). |
| Data quality shows | The Austin page lists "Edison Austin Apartments", "Hanover Republic Square", "Park at Wells Branch" - apartment buildings, not management firms. Design can't fix a wrong record. |
| Three components total | `FirmCard`, `Nav`, `SearchBar`. No dialog, select, sheet, tabs, tooltip, toast, command palette. Every new feature means hand-rolling a11y. |

---

## 2. Open-source foundations worth adopting

### Component system - **shadcn/ui** (MIT, 127k★)
Copy-in components on Radix primitives + Tailwind. Fits this repo exactly (Next 16 + Tailwind 4, no runtime dependency, components live in your tree). Gives Dialog, Select, Combobox, Sheet, Tabs, Tooltip, Command, Pagination, Skeleton, Toast.
→ `github.com/shadcn-ui/ui` · `ui.shadcn.com`

Supporting primitives (all MIT):
- **Radix UI** - headless a11y primitives (`radix-ui.com`)
- **Radix Colors** - 30 scales, APCA-tested, dark mode included (`github.com/radix-ui/colors`, 1.7k★)
- **cmdk** - command palette / searchable combobox (`github.com/pacocoursey/cmdk`) - perfect for city typeahead
- **Vaul** (8.7k★) - mobile bottom sheet for filters
- **Sonner** (13k★) - toast for "link copied", claim form, etc.
- **nuqs** (10.9k★) - type-safe URL state for filters/sort (shareable, SEO-safe)

Alternatives if you want batteries instead of copy-paste:
- **HeroUI** (Apache-2.0, 31k★) - most polished "designed" React library, built-in themes
- **Mantine** (MIT, 32k★) - biggest component set, great forms/dates
- **Radix Themes** (MIT, 8.8k★) - fast to ship, opinionated
- **daisyUI** (MIT, 43k★) - pure Tailwind classes, zero JS

### Animated component collections (copy-paste, MIT)
- **Magic UI** (`magicuidesign/magicui`, 23k★) - marquees, bento grids, number tickers, animated lists
- **Origin UI** (`origin-space/ui-experiments`, 1.4k★) - large set of beautifully designed shadcn layouts/forms
- **Motion** (`motiondivision/motion`, 35k★, MIT - the renamed Framer Motion) - the one animation lib worth adding
- **AutoAnimate** (`formkit/auto-animate`, 14k★, MIT) - 1 line to animate list filtering

### Directory products/templates to study or fork (real code)
| Repo | ★ | License | Why it matters |
|---|---|---|---|
| `nolly-studio/cult-directory-template` | 681 | - | Next.js + shadcn + Supabase directory: listing cards, categories, submission flow. Best visual reference. |
| `MkThingsHQ/mkdirs` | 293 | Apache-2.0 | Full directory boilerplate: listings, categories/collections/tags, search, submissions, payments, blog, newsletter, theming. |
| `9d8dev/directory` | 84 | MIT | Minimal Next.js directory - clean structure to copy. |
| `AbdulBasit313/nextjs-directory-site-starter` | 11 | MIT | Small, readable starter. |
| `ever-works/directory-web-template` | 20 | AGPL-3.0 | Full-featured (AGPL - copy patterns, not code). |

### Maps & geo (this is the biggest missing feature)
| Tool | ★ | License | Note |
|---|---|---|---|
| **MapLibre GL JS** | 12k | BSD-3 | Open-source Mapbox GL fork; vector maps, clusters, popups |
| **OpenFreeMap** | 6.3k | free service | Free vector tiles, **no API key, no limits** - drop-in styles for MapLibre |
| **Protomaps** | 768 | BSD-3 | Self-hosted PMTiles basemaps; zero vendor |
| **Leaflet** | 45.8k | BSD-2 | Simpler raster map if you don't want WebGL |
| **Photon** (komoot) | 3.2k | Apache-2.0 | OSM geocoder with a free public endpoint - city/ZIP autocomplete without Google |

### Type, icons, imagery, texture
- **Fonts (all OFL, self-host via Fontsource, MIT, 6.2k★):** Inter (20k★) or Geist (3.7k★) for UI; **Newsreader / Instrument Serif / Fraunces** for a display serif that makes a directory feel editorial rather than generic.
- **Icons:** Lucide (ISC, 25k★, already the shadcn default), Phosphor (MIT), Tabler (MIT, 22.5k★), Heroicons (MIT, 23.9k★), **Simple Icons** (CC0, 26k★) for brand/social marks.
- **Imagery:** Unsplash / Pexels (free commercial use) for city hero photos; unDraw (free, no attribution) or Open Peeps (CC0) for empty states and the "how it works" section.
- **Texture:** Hero Patterns (free SVG backgrounds), SVG Backgrounds. Use sparingly.
- **Favicons per firm:** Google's `s2/favicons` or logo.dev free tier gives each card a real logo - instant visual differentiation.
- **Charts:** Tremor (Apache-2.0, 3.7k★) for "firms per state" / growth stats on state pages.

---

## 3. Patterns worth copying from the category

From the directory/template research (Directify, GeoDirectory, Radius, Yelp/Thumbtack/Clutch):

1. **Split view**: sticky list left, map right on desktop; toggle on mobile. This is the single most expected local-directory affordance.
2. **Two-field search**: "What" + "Where" (city/ZIP), with location auto-detect. We have one field.
3. **Filter chips above the list**: property type (residential / commercial / HOA / short-term), rating, has website, verified. We already store categories + ratings.
4. **Featured / claimed rows** visually distinct (border, badge, logo) - the future monetisation hook.
5. **Trust row under the hero**: counts, "X cities", "updated <date>", "data from public business profiles", review aggregates.
6. **City landing pages with a local hero image + intro paragraph + top-10 table** (we have the pages, not the visual layer).
7. **Empty/zero states with illustration + nearby cities** instead of a bare "no results".

---

## 4. Accessibility findings (measured)

| Pair | Ratio | Verdict |
|---|---|---|
| accent `#c8963e` on paper `#fbfaf7` | **2.55:1** | fails AA - used for eyebrow text |
| `stone-400 #a8a29e` on white | **2.52:1** | fails AA - small meta links |
| `stone-500 #78716c` on white | 4.80:1 | passes AA |
| brand `#0f3d3e` on white | 11.95:1 | passes AAA |
| ink `#17232b` on paper | 15.34:1 | passes AAA |

Also missing: skip link, visible `:focus-visible` ring on cards/links, `aria-current` on nav, `<main id="main">` landmark, and 11px pills are below comfortable minimum (12-13px).

---

## 5. Prioritised plan

### Phase 1 - high impact, ~1 day
- Add a **city hero** on state/city pages (Unsplash image + gradient overlay) and a **trust bar** on home.
- **Fix contrast**: darken accent to `#8a6420` (4.6:1) or use it only on dark; bump pills to 12px; add focus rings + skip link.
- **Bigger type scale** (hero 56/64px desktop, section 32px) + display serif for H1s.
- **Firm logos** on cards via favicon/logo service, plus a "Reviewed by N" line and a category icon.
- **Filter chips + sort** (rating, review count, name) with `nuqs` URL state.
- **City autocomplete** in the search bar (Photon or local city index) with `cmdk`.
- **Clean the data**: drop apartment buildings/complexes that aren't management firms (Austin currently shows 5+).

### Phase 2 - the directory-defining feature, ~2-3 days
- **Map + list split view** with MapLibre + OpenFreeMap, clustered pins, hover sync, "search this area".
- **Firm page upgrade**: map embed, hours, photo strip (if available), "similar firms", sticky contact card, schema improvements.
- **State/city stats** with Tremor (firms per city, rating distribution) - also good SEO content.
- **Claim listing** flow (shadcn Dialog + form + Sonner toast), email capture, "verified" badge.

### Phase 3 - polish & growth
- Motion (staggered cards, auto-animate filtering), skeleton loading, empty-state illustrations.
- Dark mode via Radix Colors tokens.
- Blog/guides (Astro-like MDX) with the same design system for SEO.
- Saved searches / compare firms (localStorage first).

---

## 6. License cheat sheet

MIT/ISC/Apache/BSD/OFL/CC0 - all safe for commercial use: shadcn, Radix, Radix Colors, HeroUI, Mantine, daisyUI, Headless UI, cmdk, Vaul, Sonner, nuqs, Motion, AutoAnimate, Lucide, Phosphor, Tabler, Heroicons, Simple Icons, MapLibre, Leaflet, Protomaps, Photon, Tremor, Open Props, Inter/Geist/Newsreader (OFL), unDraw, Open Peeps, Hero Patterns.
**Check before copying code:** cult-directory-template (no licence stated → reference only), Mkdirs (Apache-2.0, keep NOTICE), ever-works (AGPL-3.0 - copyleft), OpenFreeMap styles (check per-style licence).
