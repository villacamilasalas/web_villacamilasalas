# Villa Camila — AGENTS.md

## Project Context

Luxury rural tourism SPA (Single Page Application) based in Asturias, Spain. Style: "Modern Rural / Asturian Boutique."
**Core Priorities:** Premium editorial user experience, flawless responsive design, and optimal Core Web Vitals.

## Stack

* **Framework**: Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5.7
* **Export**: `output: "export"` — fully static SSG (no SSR). Deployed on Netlify.
* **CSS**: Tailwind CSS v4.2 (`@import 'tailwindcss'`), PostCSS via `@tailwindcss/postcss` + `autoprefixer`, `tw-animate-css` 1.3.3.
* **UI Components**: shadcn/ui (New York style, neutral base), 24 Radix UI primitives, lucide-react ^0.564 icons.
* **Icons**: lucide-react (primary), MUI Material Icons ^9.0 (WhatsApp, Instagram, Call, KeyboardArrowUp — used only in `floating-actions` and `site-footer`).
* **Carousel**: embla-carousel-react 8.6 (used in apartment detail dialog).
* **Forms**: react-hook-form ^7.71 + zod ^4.4 (client), Resend ^6.12 (server email via Netlify Function).
* **Package Manager**: pnpm.
* **Linting**: ESLint 10.4 flat config (`lint .`) — NOT `next lint`.

## Static Export & Netlify

* **Output**: `next.config.mjs` sets `output: "export"` → `pnpm build` produces `out/` directory.
* **Publish**: `netlify.toml` → publish dir `out`, functions dir `netlify/functions`.
* **Netlify Function**: `netlify/functions/contact.ts` (v2, esbuild bundler) handles POST from `/api/contact` → redirect from `netlify.toml`.
  * Honeypot bot protection (`organizacion` field).
  * Zod validation matching client schema.
  * Sends via Resend from `contacto@mail.villacamilasalas.es` to `villacamila22@hotmail.com` with rich HTML template.
  * Requires `RESEND_API` env var (NOT in `.env.example`).
* **Security Headers** (`netlify.toml` on `/*`):
  * `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
  * `Content-Security-Policy`: allows self, GTM, GA4, Trustindex CDN (`cdn.trustindex.io`) in script/connect/frame-src
  * `Strict-Transport-Security`: preload, 1 year
* **Cache**: `/_next/static/*` and `/static/*` — immutable, 1 year.

## Design System & Styling

* **Palette**: All OKLCH. Defined in `:root` / `.dark` in `app/globals.css`.
  * `--background`: oklch(0.98 0.005 85) — Warm Cream `#fdfbf7`
  * `--foreground`: oklch(0.25 0.02 250) — Charcoal
  * `--primary`: oklch(0.28 0.06 145) — Deep Forest Green `#1a2e1a`
  * `--accent`: oklch(0.50 0.12 75) — Earthy warm
  * `--radius: 0.5rem`
* **Dark mode**: Class-based (`@custom-variant dark (&:is(.dark *))`) via `next-themes` (no system sync, default light, no transition on change).
* **Typography**:
  * `font-sans`: Inter
  * `font-serif`: Montserrat (headings/titles)
  * `font-great-vibes`: Great Vibes (standout brand elements, e.g. "Villa Camila" in navbar and hero)
  * `font-mono`: Geist Mono
* **Custom CSS utilities** (in `globals.css`):
  * `.shadow-soft` / `.shadow-soft-lg` — editorial shadows using OKLCH
  * `.btn-tactile` — hover lift (-2px) + forest green shadow, active press (0px)
  * `.card-reveal` — hover lift (-8px) + soft shadow
  * `.link-underline` — animated `::after` underline on hover (0→100% width)
  * `.img-reveal` — image zoom (scale 1.05) on container hover
  * `.transition-editorial` — `all 0.4s cubic-bezier(0.16, 1, 0.3, 1)`
* **Accessibility**: All interactive elements must have minimum touch target 44x44px.

## Image Pipeline

* **Format strategy**: AVIF (primary) + WebP (fallback). Originals can be any of `.webp, .jpg, .jpeg, .png`.
* **Prebuild hooks**: `predev` and `prebuild` run `scripts/optimize-images.js && scripts/scan-images.js` sequentially.
* **`scripts/optimize-images.js`**: Walks `public/` (excludes `favicon/`), generates AVIF q75 + WebP q75 via `sharp`. Skips fresh files via mtime comparison. Uses `.tmp` atomic writes. Concurrency: 6.
* **`scripts/scan-images.js`**: Scans `public/` for folders matching `Apartamento \d+`, generates `data/apartment-images.ts` (auto-generated — DO NOT edit manually).
* **In pages**: Use `<picture>` elements with `<source srcSet="...avif" type="image/avif">` then `<source srcSet="...webp" type="image/webp">` then `<img>`.
* **next.config.mjs**: `images.unoptimized: true`, `images.deviceSizes: [480, 768, 1024, 1280]`, `images.imageSizes: [256, 384, 512]`, `images.formats: ["image/avif", "image/webp"]`.
* **Hero preload**: `<link rel="preload" as="image" href="/Exteriores/VC - Ext_006.avif" type="image/avif">` in `layout.tsx`.

## Responsive Rules (Mobile-First)

* **Hero**: Stack buttons vertically (`flex-col`) with `w-full` on mobile. Maintain `py-24` as minimum vertical padding.
* **Cards**: Enforce `aspect-[4/3]` for imagery. Adjust typography to prevent clutter on small viewports.
* **Spacing**: Section vertical padding: `py-20 sm:py-28 lg:py-36`.
* **Typography**: Apply `text-balance` to all headings to prevent orphan line breaks.

## Commands

```sh
pnpm dev                # next dev (with predev: optimize + scan images)
pnpm build              # next build (with prebuild: optimize + scan images)
pnpm start              # next start
pnpm lint               # lint .  (ESLint 10 flat config — NOT next lint)
pnpm lint:fix           # lint --fix
pnpm typecheck          # tsc --noEmit
pnpm scan-images        # node scripts/scan-images.js (standalone)
```

## Page Structure (`app/page.tsx` — SPA, "use client")

Sections in order:
1. **Header** — Sticky navbar, logo + "Villa Camila" (Great Vibes), desktop nav (6 items), "Reservar" CTA → rentitup.es, mobile Sheet menu
2. **Hero #inicio** — Picture element (avif/webp), gradient overlay, headline, subtitle, 2 CTAs
3. **Entorno #entorno** — 4 distance cards (Oviedo/Cudillero/Gijón/Somiedo), editorial feature with 4 items
4. **Qué Hacer** — `QueHacerSection` (static import)
5. **Apartamentos** — Dynamic import (`ssr: false`) of `ApartamentosSection`
6. **Opiniones #opiniones** — `TrustindexReviews` widget
7. **Contacto #contacto** — Dark green section, phone/map/hours, dynamic `ContactForm`
8. **LocationSection** — Dynamic import (`ssr: false`)
9. **SiteFooter** — CTA + brand + nav + WhatsApp
10. **FloatingActions** — Scroll-to-top, WhatsApp, Instagram, Call (MUI icons)

**WatercolorDecoration** separators between sections (3 instances).

## Components

### Site-specific (12 files in `components/`)

| Component | Lines | Description |
|-----------|-------|-------------|
| `apartment-card.tsx` | 69 | Card with aspect-[4/3] image, name (Great Vibes), guests/beds/baths/pets |
| `apartment-detail-dialog.tsx` | 441 | Full dialog with Embla carousel, fullscreen portal, amenities, policies, shared subcomponents |
| `apartamentos-section.tsx` | 58 | Grid of 6 cards, state management for dialog |
| `contact-form.tsx` | 140 | react-hook-form + zod, honeypot, POST to `/api/contact` |
| `floating-actions.tsx` | 103 | Fixed bottom-right: scroll-to-top, WhatsApp, Instagram, Call. Tooltips. MUI icons. |
| `google-analytics.tsx` | 71 | GA4 + GTM, hash change tracking, `'use client'` |
| `location-section.tsx` | 81 | Google Maps iframe, distance cards with "Como llegar" links |
| `que-hacer-section.tsx` | 284 | Category tabs (Playas/Naturaleza/Cultura/Vistas), expandable items, Camino Primitivo editorial mosaic, mobile collapsible |
| `site-footer.tsx` | 134 | 3 zones: CTA, brand (logo/phone/map/hours), nav. WhatsApp button. |
| `theme-provider.tsx` | 11 | next-themes ThemeProvider wrapper |
| `trustindex-reviews.tsx` | 60 | `'use client'` — Injects Trustindex script dynamically (inline requirement), skeleton pulse + CLS guard (`min-h-[320px] md:min-h-[480px]`). No extra wrapping styles. |
| `watercolor-decoration.tsx` | 47 | Decorative watercolor accent (left/right, full/half layout) |

### shadcn/ui (41+ files in `components/ui/`)
Standard shadcn/ui New York style. `dialog.tsx` has custom `showCloseButton` prop.

## Data Files

| File | Content |
|------|---------|
| `data/data.ts` | `distances` array — 4 locations (Oviedo, Cudillero, Gijón, Somiedo) with time, description, Google Maps link |
| `data/apartments.ts` | `Apartment` interface + 6 apartment objects with id, name, type, capacities, amenities, images, booking URLs |
| `data/apartment-images.ts` | **Auto-generated** by `scripts/scan-images.js`. Maps apartment IDs to image path arrays. |
| `data/categories.ts` | 4 categories (Playas/Naturaleza/Cultura/Vistas) with items, descriptions, images, maps, Wikiloc links |

## Apartments (6)

| # | Name | Guests | Beds | Bath | Pets | Notes |
|---|------|--------|------|------|------|-------|
| 1 | El Viandero | 4 | 2 | 1 | ✅ | — |
| 2 | El Llagar | 3 | 2 | 1 | ✅ | — |
| 3 | La Cuesta | 3 | 2 | 1 | ✅ | — |
| 4 | El Pajar | 6 | 3 | 2 | ❌ | DUPLEX, stairs |
| 5 | El Pozo | 4 | 2 | 1 | ❌ | — |
| 6 | La Figal | 4 | 2 | 1 | ❌ | — |

All have: WiFi alta velocidad, Smart TV, Cocina completa, Calefacción, Lavavajillas, Lavadora, Horno, Cafetera.

## External Services

* **Reviews**: Trustindex widget (`loader.js?05b79d07309f7483595629e00fc`) — unlimited views, no fallback needed
* **Analytics**: GA4 + Google Tag Manager (env vars `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`)
* **Booking**: rentitup.es URLs with `utm_source=ig&utm_medium=social&utm_content=link_in_bio` tracking
* **Email**: Resend API via Netlify Function (requires `RESEND_API` env var in Netlify)
* **Maps**: Google Maps directions links (data-driven), Google Maps iframe embed
* **Fonts**: Google Fonts (Inter, Great Vibes, Montserrat) loaded via `next/font/google`
* **Vercel Analytics**: NOT used (GA4/GTM instead)

## Environment Variables (`.env.example` — none in repo)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical URL (default: `https://villacamilasalas.es`) |
| `NEXT_PUBLIC_GA_ID` | ⬜ | GA4 Measurement ID (G-XXXXXXXXXX) |
| `NEXT_PUBLIC_GTM_ID` | ⬜ | GTM Container ID (GTM-XXXXXXX) |
| `RESEND_API` | ✅(Netlify) | Resend API key for contact form (NOT in `.env.example`) |

## Quirks & Gotchas

* **TypeScript**: `ignoreBuildErrors: true` in `next.config.mjs`. Type checking via `pnpm typecheck` (tsc).
* **Images**: `images.unoptimized: true` — all optimization is done by `scripts/optimize-images.js` at build time.
* **Testing**: No test framework configured.
* **CSS Architecture**: Active stylesheet is `app/globals.css`. Ignore `styles/globals.css` (unused default).
* **SPA**: No sub-routes; all content lives in root `app/page.tsx` with `"use client"` for scroll navigation.
* **Locale**: Spanish (`es_ES`). `<html lang="es">` with `suppressHydrationWarning`.
* **Fonts**: Inter, Great Vibes and Montserrat via Google Fonts (`next/font/google`), exposed as `--font-inter`, `--font-great-vibes`, `--font-montserrat` CSS vars.
* **Schema.org**: `LodgingBusiness` JSON-LD in `layout.tsx` with address, phone, sameAs.
* **Trustindex**: Script URL `https://cdn.trustindex.io/loader.js?05b79d07309f7483595629e00fc`. Must be injected inline (not via `next/script`). See `components/trustindex-reviews.tsx`.
* **CSP**: Must include `cdn.trustindex.io` in `script-src`, `connect-src`, `frame-src` (already in `netlify.toml`).
* **Resend API key**: Not in `.env.example`. Must be set manually in Netlify environment variables.
* **Lint**: Uses `lint .` (ESLint 10 flat config), NOT `next lint`.
* **pnpm workspace**: `pnpm-workspace.yaml` allows builds for `@parcel/watcher`, `esbuild`, `netlify-cli`, `sharp`, `unix-dgram`.

## Path Aliases (`tsconfig.json`)

* `@/*` → `./*` (project root)
* shadcn/ui: `@/components/ui`, `@/lib/utils`, `@/hooks`

## Code Patterns

* Favor composition over modification for shadcn/ui components.
* Keep `components/ui` files "pure" (avoid site-specific logic inside base components).
* Dynamic imports (`ssr: false`) for: `ApartamentosSection`, `LocationSection`, `ContactForm`.
* Images: use `<picture>` with AVIF + WebP sources + fallback `<img>`.
* Navigation: `scrollIntoView({ behavior: "smooth" })` + `window.location.hash`.
* Carousel: Embla (not shadcn/ui carousel) in apartment detail dialog.
* Forms: react-hook-form + zod on client; Netlify Function + Resend on server.
* Environment: use `NEXT_PUBLIC_*` prefix for client-safe env vars.

## Booking & Contact

* **Phone**: `+34689575612`
* **Email**: `villacamila22@hotmail.com` (receives contact form submissions)
* **From address** (Resend): `contacto@mail.villacamilasalas.es`
* **Booking URL Pattern**: `https://reservas.rentitup.es/search?numberOfGuests={n}&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio`
* **Address**: Villaraba, 22, Villazón, Salas, 33860, Asturias, ES

## CI/CD

* **Dependabot**: Weekly npm + GitHub Actions updates (grouped).
* **CI Workflow** (`.github/workflows/dependabot-ci.yml`): triggers on Dependabot PRs → checkout, Node 22, pnpm, frozen-lockfile, audit, lint, typecheck, build. Auto-merges minor/patch.

## SEO

* **Metadata**: Title, description, keywords, OG/Twitter cards in `layout.tsx`.
* **Favicon**: 96x96 PNG, SVG, ICO, Apple Touch Icon (180x180).
* **Manifest**: `/favicon/site.webmanifest`.
* **Robots**: Allow all (`app/robots.ts`).
* **Sitemap**: Single entry for `/`, weekly, priority 1.0 (`app/sitemap.ts`).

## Git

* **`.gitignore`**: Ignores node_modules, .next, out, .env/.env*.local, .vercel, next-env.d.ts, *.tsbuildinfo, DS_Store, debug logs.
