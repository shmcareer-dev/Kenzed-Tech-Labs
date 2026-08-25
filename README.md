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

## Contact flow

The contact and application forms validate in the browser with Zod, format a
message, and open WhatsApp for the visitor to send. They intentionally do not
POST to a backend. Adding an API route would break the static-only hosting
model.

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
