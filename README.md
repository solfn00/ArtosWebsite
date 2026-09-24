# ארטוס | Ártos — website

Single-page Hebrew (RTL) site for Art'os, a food truck in Ein Gedi.
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## Editing content

All text, photos, links and reviews live in **`src/content/site.ts`**.
Only verified information belongs there. Empty or `null` fields hide their UI:

| Field | Effect when filled |
|---|---|
| `reviews` | the "ביקורות" section + nav link: 5 verbatim Google reviews (captured 2026-09-21); empty the array to hide |
| `googleSummary` | the 4.5 / 51 reviews snapshot; set to `null` to hide or update it when it changes |
| `site.hours` | shows opening hours in the location section |
| `site.contact.phone / whatsapp / instagram` | adds buttons to the final CTA |
| `site.mapsUrl` | the business's own Google Maps link (confirmed) |
| `menu` | the menu card: categories, items, prices |

## Images

Originals are in `source-assets/`. `npm run images` rebuilds `public/images/`,
the favicon (`src/app/icon.png`), Apple icon, and the Open Graph card.
Photos are 1000–2200px originals from the business. Drop replacements into
`source-assets/` with the same names, re-run the script, and update the
`width`/`height` values in `site.ts` if the aspect ratio changes.

## Deploy

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://artos.co.il`) so canonical/OG/JSON-LD
URLs are absolute and correct, then deploy (Vercel works with zero config).

## Checks

```bash
npm run lint          # tsc --noEmit
npm run build         # production build
npm run audit         # 11 viewport widths: overflow, hidden content, a11y basics
npm run check:motion  # proves the animations actually run
npm run check:contrast # WCAG ratios for the palette pairs
```

`npm run audit` and `npm run check:motion` need the site running
(`npm run build && npm start`), and take a URL argument to check production:
`node scripts/audit.mjs https://artos-two.vercel.app`.

## Other projects in this folder

`promo-video/` (Remotion) and `walkthrough-3d/` are separate projects. They are
excluded from the site's TypeScript config and from deploys.
