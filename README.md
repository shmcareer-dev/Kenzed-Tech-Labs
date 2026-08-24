# Kenzed Tech Lab — website

Marketing site for Kenzed Tech Lab, built with **Next.js 16 (App Router)**, **TypeScript**,
**Tailwind CSS v4** and **Three.js**.

It is a **fully static site** (`output: "export"`). There is no server at runtime: no API
routes, no server actions, no database. Everything ships as pre-rendered HTML, CSS and JS,
which is why it can be hosted on GitHub Pages or dropped into any web root.

---

## Running it locally

You need Node 20+. Nothing else — no database, no services.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload (writes to `.next`) |
| `npm run build` | Static export (writes to `dist`) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check without emitting |

`next dev` and `next build` deliberately use different `distDir` values: the dev server's
Turbopack cache was otherwise ending up in the deploy artifact.

---

## How the project is organised

```
src/
├── app/                       routes (App Router)
│   ├── page.tsx               homepage
│   ├── about|services|…       one folder per page
│   ├── services/[slug]/       generated from src/content/services.ts
│   ├── sitemap.ts robots.ts   generated from the content files
│   └── globals.css            design tokens + component classes
│
├── content/                   ← ALL COPY LIVES HERE. Edit text without touching components.
│   ├── site.ts                company details, contact info, office locations
│   ├── kz.ts                  copy for the redesigned pages (services, values, process…)
│   ├── services.ts            the services that drive cards, /services/[slug] and the sitemap
│   ├── products.ts            product studio catalogue
│   ├── training.ts            training programmes and live projects
│   └── company.ts             story, mission, vision
│
├── components/
│   ├── kz/                    header, footer, 3D background, forms, diagrams, primitives
│   │   └── screens/           one client screen component per route
│   └── ui/JsonLd.tsx          renders a JSON-LD <script>
│
└── lib/
    ├── seo.ts                 pageMetadata() + JSON-LD builders
    └── validation.ts          Zod schema for the contact form
```

### The idea behind the structure

**Content is data, not markup.** Every piece of copy lives in `src/content/`. To add a
service, append an object to `src/content/services.ts` — the services index, a new
`/services/your-slug` page, its metadata and the sitemap entry all follow automatically.

**Pages are server components; screens are client components.** Each `src/app/*/page.tsx`
is a server component whose only jobs are exporting `metadata` (via `pageMetadata()`) and
rendering the matching screen from `src/components/kz/screens/`. Anything interactive lives
in the screen, which starts with `"use client"`. Copy `src/app/about/page.tsx` when adding a
page.

**Styling.** Design tokens (`--bg`, `--ink`, `--acc`, `--line`, …) are defined once in
`src/app/globals.css` and drive both light and dark themes. Recurring visual pieces —
`.kz-card`, `.kz-btn`, `.kz-eyebrow`, `.kz-pill`, `.kz-field-input` — are component classes
in the same file, with shared React wrappers in `src/components/kz/primitives.tsx`.

**Mobile first.** Layouts are designed at 360px and enhanced upward with `clamp()`. Grids
collapse to one column, tap targets clear 44px, and no rule depends on hover alone.

**Icons** are registered by name in `src/components/kz/KzIcon.tsx`. Content files reference
them as strings (`icon: "agent"`), so adding an icon is a one-line change in one file.

---

## The contact form

Because the site is static there is nothing to POST to. `KzContactForm` validates the input
in the browser against the Zod schema in `src/lib/validation.ts`, formats it as a message,
and opens a `wa.me` deep link to the number in `src/content/site.ts`. The visitor sends it
from their own WhatsApp.

The schema includes a `website` honeypot field that real people never see.

Any new form should copy this pattern — adding an API route would break the static export.

> The earlier database-backed flow (Prisma + a `/api/contact` route + a `/admin/leads`
> inbox) still exists under `_disabled/`, along with `prisma/`. Nothing in `src/` imports
> it and it is excluded from `tsconfig.json`, so it never reaches the build. It is kept as
> the only copy of that flow; delete the directory if the site will stay static.

---

## SEO

- One `<h1>` per page, containing the target keyword.
- Per-page `title`, `description`, canonical URL and Open Graph tags via `pageMetadata()`
  in `src/lib/seo.ts`.
- JSON-LD: `Organization` sitewide, `Service` on each service page, `BreadcrumbList` on
  inner pages.
- `sitemap.xml` and `robots.txt` generated from the content files, so new services appear
  automatically.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before going live — canonical URLs, the
sitemap and JSON-LD all read from it.

---

## The 3D background

`src/components/kz/Kz3DBackground.tsx` renders the Three.js scene behind every page.
`Kz3DProvider` exposes a handle to it, and each screen calls `useKzPage("<page>")` so the
scene morphs as you navigate. It is decorative and defensive:

- Falls back to the plain gradient background if WebGL is unavailable.
- Renders one static frame when the visitor prefers reduced motion.
- Pauses when the browser tab is hidden.
- Disposes every geometry, material and the renderer on unmount.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin — canonical URLs, sitemap, JSON-LD |
| `NEXT_PUBLIC_BASE_PATH` | Sub-path prefix. Empty for root-domain hosting; the GitHub Pages workflow sets `/Kenzed-Tech-Labs` |

Both are inlined at build time, so a change needs a rebuild. `.env*` is gitignored;
`.env.example` is the template — keep it in sync when adding a variable.

---

## Deploying

`npm run build` writes a self-contained static site to `dist/`. Serve that directory with
any web server — no Node runtime required.

- **GitHub Pages** — `.github/workflows/pages.yml` builds on every push to `master` and
  publishes `dist/`. It sets `NEXT_PUBLIC_BASE_PATH=/Kenzed-Tech-Labs` for that host.
- **Root-domain hosting (kenzed.in)** — leave `NEXT_PUBLIC_BASE_PATH` unset and copy `dist/`
  into the web root. `public/.htaccess` ships with it for Apache.
- **VPS cutover** — the scripts in `deploy/` handle the one-off migration: `00-inspect.sh`,
  `01-migrate-and-deploy.sh`, `02-cloudflare-dns.sh`, `03-cutover.sh`. Read each before
  running it; they act on live infrastructure.
