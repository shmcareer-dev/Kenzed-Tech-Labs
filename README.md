# Kenzed Tech Lab website

The marketing site for Kenzed Tech Lab. It is built with Next.js 16 (App
Router), TypeScript, Tailwind CSS v4, Motion, GSAP, Lenis, and Lottie.

The project is a fully static export. There are no runtime API routes, server
actions, or database services: production receives pre-rendered HTML, CSS,
JavaScript, and media from `dist/`.

## Local development

Use Node.js 20 or newer:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files |
| `npm run build` | Create the static production export in `dist/` |

Development and production builds deliberately use separate Next.js output
directories so the development cache never enters a release.

## Project structure

```text
src/
├── app/                  App Router routes, metadata, and global styles
├── components/
│   ├── kz/               shared site components and route screens
│   └── ui/               small framework-level UI helpers
├── content/              editable company, service, product, and training copy
└── lib/                  SEO and form validation helpers
public/                   static artwork, icons, Lottie files, and server rules
```

Route files are server components responsible for metadata and rendering their
matching screen. Interactive screens and motion components are client
components. Shared company facts and page copy live in `src/content/` so they
can be updated without editing presentation code.

Design tokens and shared classes live in `src/app/globals.css`. Layouts are
mobile-first, enhance progressively at larger breakpoints, respect reduced
motion, and keep touch targets usable without hover.

Several components carry their own scoped stylesheet in a JS template literal
(`const KZ*_CSS = ` ... `) because hover, `:focus-visible`, attribute selectors,
media queries and `prefers-reduced-motion` cannot be expressed as React style
props. Two consequences bite:

- **A backtick inside one of those CSS comments ends the template literal** and
  the file stops parsing. Write `data-kz-run`, not the backticked form.
- **Those sheets are unlayered, so they beat `@layer components` regardless of
  specificity.** A `padding` shorthand in a component sheet silently overrode
  `.kz-wrap`'s `padding-inline` and cost the footer its gutter on every page.
  Prefer the longhand that says only what you mean.

## The 3D system

There is no WebGL on this site. Everything that reads as three-dimensional is
hand-authored isometric SVG in `src/components/kz/KzSpatial3D.tsx`, lit from
the upper left and drawn as three planes — a **top** in key light, a **front**
in half light, and a **side** in shade. Holding that value order, with a wide
gap between the three, is the entire reason flat vector shapes read as solids.

Four rules keep the set coherent:

- Every object is drawn against the shared `<defs>` from `spatialDefs()` and
  wrapped in the two-part shadow filter — a tight dark contact term plus a
  wide accent bloom. A single soft accent blur reads as haze, not as light.
- Every silhouette carries `edge(id)`, which is `vector-effect:
  non-scaling-stroke`. These render from 22px to 152px; an authored 1-user-unit
  stroke in a 96-unit viewBox is a quarter of a device pixel at the small end.
- Each kind gets its own material from `textureFor()` — circuit traces under
  silicon, scanlines under a display, a node mesh under a model. One shared
  hatch made every object look like the same material cut to a different
  silhouette.
- No CSS `perspective` and no rotation in the float keyframes. Both promote the
  icon to a resampled raster layer and cost every edge in the drawing far more
  than the few degrees of tilt are worth.

`kindForLabel()` and `kindForCategory()` route content strings to a kind. Both
are ordered **most specific first** and that ordering is load-bearing: a broad
test placed early swallows every label a later, narrower test was written for.
Add new branches above the fallback, and check the result — the mapping is
what decides whether a page shows twelve different objects or the same one
twelve times.

## Contact flow

The contact and application forms validate in the browser with Zod, format a
message, and open WhatsApp for the visitor to send. They intentionally do not
POST to a backend. Adding an API route would break the static-only hosting
model.

The phone number and email address live in exactly one place,
`src/content/site.ts`, which also exports the derived renderings every call
site should use — `phoneDigits` for `tel:` and `wa.me`, `phoneDisplay` for the
grouped human form, `phoneHref`, `waHref()` and `emailHref`. Never re-derive
any of these locally; three components used to, and the same number rendered
in three different groupings on one page.

## The legal shelf

`/terms`, `/privacy`, `/cookies` and `/refund` are generated from
`src/content/legal.ts` by one renderer, `KzLegal`. The documents describe this
site as it is actually built — no server, no database, no analytics, no
cookies — which is why they are short and specific rather than boilerplate.

**If that changes, the affected section changes in the same commit.** Restoring
anything from `_disabled/api`, adding an analytics tag, or introducing a
payment flow all invalidate named sections of the privacy and cookie policies.
The documents are dated from `LEGAL_EFFECTIVE` / `LEGAL_ISO` in that file, and
the date is what search engines and readers check first.

These are plain-English drafts written against how the site behaves, not
solicitor-reviewed instruments. Have them reviewed before relying on them
commercially.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin used by canonicals, sitemap, and JSON-LD |
| `NEXT_PUBLIC_BASE_PATH` | Optional sub-path; empty for `kenzed.in` |

Use an ignored local environment file for overrides. Values are inlined during
the build, so every change requires a new export.

## Deployment

`npm run build` creates a self-contained site in `dist/`.

- GitHub Pages is published by `.github/workflows/pages.yml` on pushes to
  `master`. The workflow supplies `/Kenzed-Tech-Labs` as its base path.
- The root-domain build leaves the base path empty and is synchronized to the
  `kenzed.in` web root as an atomic release with a server-side backup.
- `public/.htaccess` is part of the production export and must be preserved so
  clean route URLs resolve correctly on the live web server.

Before publishing, run lint, type-checking, and a clean production build. Never
copy `.next/`, local environment files, or deployment archives into the web
root.

**Release bundles in `deploy/` go stale silently.** They are snapshots of a
past `dist/`, and nothing revalidates them: `kenzed-web-dist.tar.gz` and
`kenzed-20260825-3d-34b5d51.tar.gz` still contain the pre-2026-08-26 phone
number and email, long after the source was corrected. Publish
`kenzed-20260826-dist.tar.gz` or a newer bundle you generate yourself; treat
the two older archives as history, not as deployables.
