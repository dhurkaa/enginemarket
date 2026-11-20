# EngineMarket.eu

Used car engines, tested and graded, shipped on a pallet from Slovakia to the EU. Every engine has a test
sheet (compression per cylinder, checks, donor car, mileage proof, included parts, fitment), a grade
(R, A, B, C) that sets its warranty, and a free 48-hour reservation before the fit is confirmed by VIN
and paid by bank transfer.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, next-intl, zod and Playwright. The
visual system is the taste-skill kit (`public/assets`), kept unchanged.

> Everything in `data/`, `config/site.ts`, `content/legal.en.ts` and `messages/en.json` that states a
> price, a mileage, a compression value, a time or a policy is placeholder data. See
> [PLACEHOLDER_DATA.md](PLACEHOLDER_DATA.md) before launch.

## Run it

Requirements: Node 20.9 or newer (developed on Node 24), npm.

```bash
npm install
cp .env.example .env.local      # optional: without mail settings, mail is printed to the console
npm run dev                     # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (after `build`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Playwright acceptance tests (builds and starts its own server on port 3100) |

The tests use the installed Google Chrome (`channel: "chrome"`). On a machine without Chrome, run
`npx playwright install chromium` once and set `PW_CHANNEL=""`.

## Where things live

```
app/                     pages (App Router) and API routes
  page.tsx               home: code search, choose your car, how it works, test sheet, grades, stock, sourcing
  engines/page.tsx       stock list (filters, sort, cards/table, pages of 25; all state in the URL)
  engines/[slug]/        engine test sheet: /engines/cffb-volkswagen-2-0-tdi-cr-em-0006
  grades, delivery, sourcing, trade-account, contact, legal/[doc]
  api/stock              GET list (same query as the page) and GET /api/stock/:id (live status)
  api/reserve            POST: 48-hour hold, 409 if someone else holds it
  api/question, api/sourcing, api/trade-account   POST: mailed to sales
  sitemap.ts, robots.ts, not-found.tsx, error.tsx, global-error.tsx
components/              UI (server and client components)
config/site.ts           phone, email, hours, VAT, grades and warranty months, company details
data/engines.json        the stock (placeholder), read only through lib/stock.ts
data/delivery.json       delivery price and days per country (placeholder)
lib/stock.ts             the one data module: swap JSON for a database or API here
lib/reservations.ts      reservation store (JSON file); swap readAll/writeAll for a database
lib/mailer.ts            Resend, SMTP or console
lib/validation.ts        zod schemas shared by forms and API routes
messages/en.json         every word on the site (next-intl)
content/legal.en.ts      terms, privacy, imprint, cookies
public/assets/           taste-skill kit (system.css/js, motion, layout, moments): do not edit
public/engines/<id>/     engine photographs (the client's own for em-0001 to em-0005)
tests/                   Playwright acceptance tests
```

## Data

Engines follow the brief's shape (`id, code, make, family, fuel, displacementCc, powerKw, mileageKm, grade,
priceEur, compressionBar, specCompressionBar, checks, donor, included, fits, photos, status`) plus
`aliases` (other ways the code is written, such as `OM651` for `OM651.913`), `mileageProof` and
`photoAlt`. Prices include VAT. Grades and warranty months are in `config/site.ts`.

To move stock to a database, reimplement the exports of `lib/stock.ts` (`getAllEngines`, `getEngineById`,
`getEngineBySlug`, `queryStock`, `getCarCatalogue`, …) against it. Pages and API routes import nothing else.

## Mail

Set `RESEND_API_KEY` (Resend) or `SMTP_HOST` and friends (any SMTP server); see `.env.example`.
`MAIL_TO` receives every form; the buyer gets a copy of a reservation. With neither set, mail is logged to the
server console and the forms still succeed, so development needs no mail account.

## Reservations in production

The default store is a JSON file with one writer at a time. That is correct for one server (a VPS, a
container). On Vercel, functions run in several instances with no shared disk, so a reservation made in
one may not be seen by another. Before launch on Vercel, replace `readAll` and `writeAll` in
`lib/reservations.ts` with a shared store: Vercel Postgres or Neon (SQL), Upstash Redis (one key per engine
with a 48-hour expiry), or SQLite through Prisma on a single server.

## Deploy (Vercel)

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, **Add New → Project**, import the repository. The framework preset is Next.js; keep the
   default build command (`next build`) and output.
3. Under **Environment Variables** add `NEXT_PUBLIC_SITE_URL`, `MAIL_FROM`, `MAIL_TO` and either
   `RESEND_API_KEY` or the `SMTP_*` set.
4. Replace the reservation store (above), then **Deploy**.
5. Add the domain `enginemarket.eu` under **Settings → Domains** and point DNS as Vercel shows.
6. Verify the sender domain at your mail provider (SPF, DKIM) so reservation mails arrive.

Any Node host works too: `npm ci && npm run build && npm run start` behind a reverse proxy, with
`RESERVATIONS_FILE` on a persistent disk.

## Languages

English is the only locale today. All copy is in `messages/en.json`; legal texts in `content/legal.en.ts`.
To add Slovak, Czech or German: copy `messages/en.json` to `messages/sk.json` (and so on) and translate the
values, add the code to `i18n/config.ts`, add `content/legal.sk.ts`, and choose the locale in
`i18n/request.ts` (by domain, a cookie or a `/sk` path segment with next-intl's routing).

## Quality checks

- `npm run build`, `npm run lint`, `npm run typecheck` and `npm test` pass.
- Acceptance criteria 1 to 8 of the brief each have a test in `tests/acceptance.spec.ts`.
- The taste-skill checker and finish gate ran on the built pages; see the build report.
