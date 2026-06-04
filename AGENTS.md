# Villa Camila — AGENTS.md

## Project Context

Luxury rural tourism SPA (Single Page Application) based in Asturias, Spain. Style: "Modern Rural / Asturian Boutique."
**Core Priorities:** Premium editorial user experience and flawless responsive design.

## Stack

* **Framework**: Next.js 16.2.6 (App Router), React 19, TypeScript 5.7
* **CSS**: Tailwind CSS v4 (using `@import 'tailwindcss'`).
* **PostCSS**: Via `@tailwindcss/postcss` + `tw-animate-css`.
* **UI Components**: shadcn/ui (New York style), Radix UI primitives, lucide-react icons.
* **Package Manager**: pnpm.

## Design System & Styling

* **Palette**: OKLCH. Primary: Deep Forest Green (`0.28 0.06 145`). Background: Warm Cream (`0.98 0.005 85`).
* **Typography**:
* `font-sans`: Inter.
* `font-serif`: Montserrat (use for headings and titles).
* `font-great-vibes`: Great Vibes (use for standout brand elements).


* **Visual Philosophy**:
* **Whitespace**: Generous and intentional.
* **Editorial**: Clean layouts, `tracking-widest` for labels, `leading-relaxed` for readability.
* **Interaction**: Use custom CSS utilities: `.btn-tactile` (hover lift), `.card-reveal` (soft shadow/lift), `.img-reveal` (smooth zoom).
* **Accessibility**: All interactive elements must have a minimum touch target of 44x44px.



## Responsive Rules (Mobile-First)

* **Hero**: Stack buttons vertically (`flex-col`) with `w-full` on mobile. Maintain `py-24` as minimum vertical padding.
* **Cards**: Enforce `aspect-[4/3]` for imagery. Adjust typography to prevent clutter on small viewports.
* **Spacing**: Section vertical padding: `py-16` (mobile) / `py-32` (desktop).
* **Typography**: Apply `text-balance` to all headings to prevent orphan line breaks.

## Commands

```sh
pnpm dev       # next dev
pnpm build     # next build
pnpm start     # next start
pnpm lint      # eslint .

```

## Quirks & Gotchas

* **TypeScript**: `ignoreBuildErrors: true` set in `next.config.mjs`.
* **Images**: `images.unoptimized: true` in `next.config.mjs`.
* **Testing**: No test framework configured.
* **CSS Architecture**: Active stylesheet is `app/globals.css`. Ignore `styles/globals.css` (unused default).
* **SPA**: No sub-routes or API routes; all content lives in root `app/layout.tsx`.
* **Locale**: Spanish (`es_ES`).
* **Fonts**: Inter, Great Vibes and Montserrat via Google Fonts (exposed as `--font-inter`, `--font-great-vibes` and `--font-montserrat` CSS vars).
* **External Services**: Vercel Analytics, Rentitup.es booking links.

## Path Aliases (`tsconfig.json`)

* `@/*` → `./*` (project root)
* shadcn/ui: `@/components/ui`, `@/lib/utils`, `@/hooks`

## Code Patterns

* Favor composition over modification for `shadcn/ui` components.
* Keep `components/ui` files "pure" (avoid site-specific logic inside base components).
* Utilize `tw-animate-css` and custom transitions in `globals.css` for motion.

## Booking & Contact

* **Phone**: `+34689575612`
* **Booking URL Pattern**: `[https://reservas.rentitup.es/listings/](https://reservas.rentitup.es/listings/){id}?...`