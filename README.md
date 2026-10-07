# Joe Bullard Acura — front-end redesign

A front-end-only, fully clickable redesign of [joebullardacura.com](https://www.joebullardacura.com). It keeps the current colors, layout and page order. The shape, type, spacing, finish, accessibility and speed are redesigned.

- **Stack:** Vite + React 19 + React Router 7. Plain CSS with custom properties. No UI kit, no Tailwind.
- **No backend.** Forms validate in the browser and show a success state with a reference number. Nothing is sent: no `fetch`, no form posts, no live APIs. Saved vehicles and the compare list live in `localStorage`.
- **Prerendered.** `npm run build` writes static HTML for all 181 routes (every page plus every vehicle). React then hydrates that HTML, so pages paint before JavaScript runs.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173 (client-rendered dev server)
npm run build      # client build + SSR build + prerender into dist/
npm run preview    # serve dist/ at http://localhost:4173
npm run check:data # sanity-check src/data/inventory.json
```

You need Node 20 or newer. `npm run build:spa` does a client-only build with no prerendering, if you ever need one.

**Deploying:** upload `dist/` to any static host. Routes live at `dist/<route>/index.html`. The host should serve `dist/<route>/index.html` for `/<route>`, and `dist/404.html` (or `index.html`) for unknown URLs, where the client router shows the 404 page. Netlify, Vercel, S3/CloudFront and nginx `try_files $uri $uri/ /404.html` all do this.

## Refreshing the inventory

1. Replace `src/data/inventory.json` with a new export in the same schema (`{ dealer, site, captured, count, vehicles: [...] }`). Copy the file in; never edit the original export.
2. Run `npm run check:data`. It checks required fields, unique stock numbers, `priceBreakdown` kinds and that every vehicle has a total line and photos.
3. Run `npm run build`. New vehicles get a detail page and a prerendered HTML file automatically. Sold vehicles drop out.

How the data is loaded: `scripts/inventory-plugin.mjs` is a small Vite plugin that turns the 2.3 MB JSON into:

- `virtual:inventory`: a slim index (about 180 KB) for listings, search and the homepage.
- `virtual:vehicle/<stock>`: one code-split chunk per vehicle (about 20 KB), loaded by the detail page.

Model counts on the homepage ("45 new in stock"), filter options, national-offer amounts and the "See what you get" features are all computed from the data. Nothing is hard-coded.

Vehicle photos load from the URLs in the data file and are never downloaded into the repo. Every image below the fold is lazy-loaded. If a photo URL fails, a "Photo coming soon" placeholder with the same alt text is shown.

## Design system (`src/styles/global.css`)

- **Colors** are exactly the 13 tokens in the brief. `--acura-red` is used only on the Service and Finance intro panels and the chat notification dot. The off-palette lime "Get E-Price" button is now `--deep-blue`. `--text-faint` (3.4:1 on white) is used only on dark backgrounds.
- **Type:** Mulish 400/600/700/800, loaded without blocking render. Body 16/1.6 with a 70ch line length, H1 32–48, H2 26–34, H3 19–22, legal 13. Prices use tabular numbers. Buttons use sentence case.
- **Shape:** pill buttons 48 px (40 px small) in primary, secondary, ghost and dark variants. Cards are 20 px radius. Inputs and selects are 48 px pills. Icon buttons are 44 px circles. Soft shadows only.
- **Liquid glass** (`.glass`, `.glass-dark`) is used only on the sticky header after scroll, nav dropdowns, the hero text panel, the price box, gallery and lightbox controls, the chat button and the bottom bar. It falls back to a solid fill when `backdrop-filter` is unsupported or `prefers-reduced-transparency` is set.
- **Accessibility:** skip link, visible focus rings (white on dark backgrounds), ARIA tabs and accordions, `<dialog>` modals with focus trap and Esc to close, form errors linked through `aria-describedby`, and reduced-motion support (the hero never auto-advances).

## Routes

| Area | Routes |
|---|---|
| Home | `/` |
| New | `/new-vehicles`, `/new-vehicles/mdx`, `/new-vehicles/adx`, `/new-vehicles/integra`, `/new-vehicles/rdx`, `/new-vehicles/tlx`, `/new-vehicles/suvs`, `/new-vehicles/specials`, `/new-lease-specials`, `/acura-national-offers`, `/reserve-your-new-acura`, `/acura-info-center`, `/acura-ev-education`, `/model-research` |
| Pre-owned | `/used-vehicles`, `/used-vehicles/precision-used`, `/used-vehicles/specials`, `/used-vehicles/suvs`, `/used-vehicles/trucks`, `/used-vehicles/under-20k`, `/used-vehicles/low-mileage`, `/why-buy-acura-certified-pre-owned` |
| Vehicle detail | `/inventory/:stock` (all 120 vehicles) |
| Sell/Trade | `/sell-to-us`, `/value-your-trade` |
| Service & Parts | `/service`, `/schedule-service`, `/service-specials`, `/service-parts-buy-now-pay-later`, `/acura-accelerated-service`, `/parts`, `/order-parts`, `/order-tires`, `/collision-center`, `/recall-lookup` |
| Specials | `/specials` (hub), plus the specials routes above |
| Finance | `/finance`, `/apply-for-financing`, `/car-payment-calculator`, `/acura-lease-return`, `/turn-in-your-honda-lease` |
| Dealership | `/about-us`, `/staff`, `/testimonials`, `/acura-precision-team`, `/blog`, `/blog/:slug`, `/leave-a-review`, `/acura-dealer-near-me`, `/used-car-dealer-near-me`, `/careers`, `/directions`, `/contact` |
| Utility | `/my-profile`, `/compare`, `/search`, `/accessibility`, `/privacy`, `/sitemap`, and a 404 for everything else |

Listing filters live in the query string, so a filtered view can be shared as a link, for example `/used-vehicles/precision-used?model=RDX` or `/new-vehicles?model=MDX&trim=Advance%20Package&sort=price-desc`.

### Listing preset rules (`src/lib/inventory.js` → `PRESETS`)

- **New Vehicle Specials:** the six new MDX units that have been in stock longest. This matches "6 MDX today". *Placeholder rule.*
- **Used Car Specials:** pre-owned units in stock 30 or more days. *Placeholder rule.*
- **Low Mileage:** pre-owned units under 30,000 miles.
- **Used Under 20K:** pre-owned units with `price < 20000`.
- **Used SUVs / Used Trucks:** the `body` field.
- **"Used" pages:** certified plus used.
- **RDX and TLX new:** zero results. These pages show a friendly empty state with a "Notify me" form and links to certified RDX and Model Research.

## [PLACEHOLDER] items to confirm before launch

On the site, each of these shows as a dashed "PLACEHOLDER" tag.

**Offers and pricing**
- 2026 MDX $539/mo lease: term and amount due at signing (hero, specials, lease page).
- ADX, MDX and Integra lease disclaimers: mileage allowance, residual and expiration ("confirm current offer").
- Featured MDX lease ($469/36 mo, $4,999 due, $32,715 lease end): mileage, acquisition fee and expiration.
- Acura National Offers: current amounts and expiration. Amounts shown are computed from the conditional offers in the inventory data.
- Service coupons: exact amounts for Fall Road-Ready Special, Don't Get Stranded, Fresh Air for Fall and Maintenance Minder Bonus. Spend & Save is final as briefed. All coupons expire 10/31/2026.
- Acura Parts Specials & Coupons: there are none yet.
- Acura Precision Certified warranty terms (Why Buy CPO).
- Honda-to-Acura lease turn-in offer.
- Which units count as New Vehicle Specials and Used Car Specials (rules above).

**Content**
- Collision Center: hours, direct phone, certifications, insurance partners. The live page currently returns a 404.
- Customer Testimonials: no quotes were invented. The page links to Google reviews.
- Blog: three placeholder post cards and article copy.
- About Us: dealership history and founding year.
- Careers: link to current openings.
- Privacy policy text.
- Acura Precision Team award criteria copy.
- Acura EV Education: current electrified lineup.
- Directions: I-65 exit number.
- Accelerated Service express-lane hours. Shuttle availability (scheduler).
- Buy Now Pay Later financing partner.
- Order Tires: live tire catalog and pricing. The page has a size-finder UI and a quote form.
- Spanish language version (the Languages menu).

**People**
- Larry Stewart's phone (251) 478-7779 is the same number as Ty Bullard's. Confirm it.
- Staff photos: every staff card currently shows initials in a round placeholder avatar.

**Brand assets**
- The Acura logo mark and favicon are simplified stand-ins. Swap in the licensed SVG.
- Acura Precision Team 2025 badge artwork.
- Joe Bullard script logo: currently set in a system script font.
- Service Department photo (homepage panel).
- Static map image: the contact band uses an SVG stand-in.
- Social profile URLs for X, Facebook and YouTube (`DEALER.social` in `src/data/site.js`).

## QA performed

- Clicked through every route in the table above at 1280 px and 360 px. Each route has exactly one H1 and breadcrumbs (except home and the 404), there is no horizontal scroll at 360 px, there are no console or page errors, and no hydration mismatches.
- Checked all 120 detail pages at 360 px. In each one the Dealer Price matches `price`, every photo is in the thumbnail strip, all 7 spec groups are present, the "Stock photo" label shows exactly on the 10 `stockPhotos` cars, and there is no horizontal scroll.
- Collected every internal link on the site and confirmed each one resolves to a real route.
- Ran interaction tests for:
  - Filters: URL sync, removable chips, sort, page 2, the one-promo-tile limit, Under 20K, certified RDX, and the mobile filter bottom sheet.
  - Forms: validation messages and `aria-describedby` links, success reference numbers, and all four scheduler steps.
  - Save and compare: the 3-vehicle compare limit, the compare page, and saved vehicles showing on My Profile.
  - Detail page: lightbox keyboard arrows and Esc, the E-Price form's required fields, and the receipt with conditional offers listed separately.
  - Homepage: hero dots and the "See details" modal.
  - Navigation: dropdowns open and close with Esc.
  - Chat: canned replies.
  - Nothing is ever POSTed.
- Lighthouse (mobile, simulated throttling) against `npm run preview`:

  | Page | Performance | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | `/` | 99 | 100 | 96 | 100 |
  | `/new-vehicles` | 99 | 100 | 96 | 100 |
  | `/inventory/A706962` (new, stock photos) | 98 | 100 | 96 | 100 |
  | `/inventory/A16923T` (certified) | 98 | 100 | 96 | 100 |

  The build sandbox could not reach the vehicle image host (`vehicle-images.carscommerce.inc`) or `acura.com`. These scores were therefore measured with photos failing to load: the "Best practices" points lost are those failed requests. Real photos will add image bytes. Above-the-fold images use `fetchpriority="high"` and everything else is lazy, but re-run Lighthouse once the site is deployed.
