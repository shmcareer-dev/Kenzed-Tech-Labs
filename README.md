# Kenzed Tech Lab — website

Marketing site for Kenzed Tech Lab, built with **Next.js 16 (App Router)**, **TypeScript**,
**Tailwind CSS v4**, **Prisma 7** and **MySQL/MariaDB**. The contact form is wired to the
database and there is a password-protected lead inbox at `/admin/leads`.

---

## Running it locally

You need Node 20+ and a MySQL or MariaDB server. On Windows, XAMPP's MySQL is fine — just
start it from the XAMPP control panel.

```bash
# 1. install dependencies
npm install

# 2. create your environment file
cp .env.example .env        # then edit DATABASE_URL if your MySQL isn't root/no-password

# 3. create the database
#    (or create `kenzed_web` yourself in phpMyAdmin)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS kenzed_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. apply the schema and generate the Prisma client
npx prisma migrate dev

# 5. start the dev server
npm run dev
```

Open <http://localhost:3000>.

Check everything is connected: <http://localhost:3000/api/health> should return
`{"status":"ok","database":"connected","leads":0}`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx prisma studio` | Browse the database in a GUI |
| `npx prisma migrate dev` | Create and apply a migration after editing the schema |

---

## How the project is organised

```
src/
├── app/                      routes (App Router)
│   ├── page.tsx              homepage — composes the sections below
│   ├── about|services|…      one folder per page
│   ├── services/[slug]/      generated from src/content/services.ts
│   ├── admin/leads/          password-protected lead inbox
│   ├── api/contact/          POST endpoint the contact form submits to
│   ├── api/health/           app + database liveness check
│   ├── sitemap.ts robots.ts  generated from the content files
│   └── globals.css           design tokens + component classes
│
├── content/                  ← ALL COPY LIVES HERE. Edit text without touching components.
│   ├── site.ts               company details, nav, contact info, hero stats
│   ├── services.ts           the 8 services (drives cards, pages and metadata)
│   ├── company.ts            story, mission, vision, values
│   ├── stack.ts              technology stack
│   ├── infrastructure.ts     facility highlights
│   ├── process.ts industries.ts team.ts faqs.ts
│
├── components/
│   ├── layout/               header, footer, ambient background
│   ├── sections/             page sections (Hero, ServiceGrid, ContactForm, …)
│   ├── ui/                   small primitives (Icon, Reveal, Counter, Section)
│   └── admin/                admin login form
│
├── lib/
│   ├── prisma.ts             database client (single instance)
│   ├── validation.ts         Zod schema shared by the form and the API
│   ├── seo.ts                metadata helper + JSON-LD builders
│   └── admin.ts              admin session check
│
└── generated/prisma/         Prisma client — generated, not committed
```

### The idea behind the structure

**Content is data, not markup.** Every piece of copy lives in `src/content/`. To add a
service, append an object to `src/content/services.ts` — the homepage grid, the services
index, a new `/services/your-slug` page, its metadata and the sitemap entry all follow
automatically. No component needs editing.

**Styling.** Design tokens (colours, fonts, container width) are defined once in
`src/app/globals.css` under `@theme`, which exposes them to Tailwind as normal utilities
(`text-muted`, `bg-surface`, `border-line`). Recurring visual pieces — `.card`, `.btn`,
`.eyebrow`, `.chip`, `.field-input` — are component classes in the same file. Layout and
spacing stay in the JSX as Tailwind utilities.

**Icons** are registered by name in `src/components/ui/Icon.tsx`. Content files reference
them as strings (`icon: "agent"`), so adding an icon is a one-line change in one file.

---

## The contact form

1. `ContactForm` validates with the Zod schema in `src/lib/validation.ts`.
2. It POSTs to `/api/contact`.
3. The route re-validates with the *same* schema, applies a per-IP rate limit
   (5 per minute) and a honeypot check, then writes a `Lead` row.
4. Leads appear at `/admin/leads`.

Sharing one schema between browser and server means the two can't drift apart.

### Reading the leads

Go to `/admin/leads` and enter the value of `ADMIN_TOKEN` from your `.env`.
You can change a lead's status (`NEW → CONTACTED → QUALIFIED → ARCHIVED`) from there.

> **Before deploying:** change `ADMIN_TOKEN` to something long and random. It is a single
> shared password — if more than a couple of people need access, replace it with real
> accounts (Auth.js) rather than passing the password around.

### Sending email notifications

Currently leads are only stored. To also email the team on each submission, add your
provider (Resend, SendGrid, Nodemailer) in `src/app/api/contact/route.ts` right after the
`prisma.lead.create()` call. Send it **after** the write and wrap it in its own `try/catch`,
so a mail outage never loses the lead.

---

## SEO

Built to the SEO copy deck at `../docx-content.md`:

- One `<h1>` per page, containing the target keyword.
- Per-page `title`, `description`, canonical URL and Open Graph tags via
  `pageMetadata()` in `src/lib/seo.ts`.
- JSON-LD: `Organization` + `LocalBusiness` sitewide, `Service` on each service page,
  `BreadcrumbList` on inner pages, `FAQPage` on the homepage.
- `sitemap.xml` and `robots.txt` generated from the content files, so new services appear
  automatically. `/admin` and `/api` are disallowed.
- Every service page links up to the services pillar and across to two related services.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before going live — canonical URLs, the
sitemap and JSON-LD all read from it.

---

## The 3D hero

`src/components/sections/NeuralCanvas.tsx` renders a neural-network sphere in Three.js.
It is decorative and defensive:

- Falls back to the gradient background if WebGL is unavailable.
- Renders one static frame when the visitor prefers reduced motion.
- Pauses when the browser tab is hidden.
- Disposes every geometry, material and the renderer on unmount.

Tuning values (node count, radius, particle count) are in the `CONFIG` object at the top.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Public origin — canonical URLs, sitemap, JSON-LD |
| `ADMIN_TOKEN` | Password for `/admin/leads` |

`.env` is gitignored. `.env.example` is the template — keep it in sync when adding a variable.

---

## Deploying

The app needs a Node runtime (Prisma does not run on edge) and a reachable MySQL database.

1. Point `DATABASE_URL` at the production database.
2. Set `NEXT_PUBLIC_SITE_URL` to the live domain.
3. Set a strong `ADMIN_TOKEN`.
4. Run `npx prisma migrate deploy` against production (not `migrate dev`).
5. `npm run build && npm start`.

The in-memory rate limiter in `/api/contact` is per-process. If you run more than one
instance, move it to Redis or your host's edge rate limiter.
