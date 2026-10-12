# Golden Plate Caterers

A premium event-catering showcase and enquiry platform for Bengaluru: Next.js (App Router) and Payload CMS 3
in one app, backed by PostgreSQL.

> **Status: all 6 phases built.** Public site, customiser with live pricing, enquiry flow with reference IDs,
> quote pages, notifications, admin dashboard/CSV, motion & cursor, SEO/OG/JSON-LD, unit + integration + e2e tests.
> See DECISIONS.md #64 for the current Lighthouse numbers. The full specification is in [BRIEF.md](BRIEF.md),
> and the decisions made along the way are in [DECISIONS.md](DECISIONS.md).

## Requirements

- Node.js 20.18+ (22 LTS recommended)
- npm 10+ (ships with Node)
- Docker (for local Postgres)

## Getting started

```bash
npm install
cp .env.example .env            # then set PAYLOAD_SECRET (openssl rand -hex 32)
npm run db:up                   # starts Postgres 17 in Docker
npm run seed                    # sample catalogue: 9 occasions, 78 dishes, 6 packages (safe to re-run)
npm run dev                     # http://localhost:3000
```

1. Open **http://localhost:3000/admin** and create the first account. It automatically becomes the **owner**.
2. Open **http://localhost:3000/design-system** to see every token and component in both themes.
3. Optionally, edit **Brand Settings** in the admin (tagline, phone, WhatsApp, hours…). The site updates on the next request.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev server, production build, production server |
| `npm run check` | Typecheck, lint, unit tests, contrast check and raw-colour check |
| `npm run typecheck` · `npm run lint` · `npm test` | Individual checks (unit tests) |
| `npm run test:int` | Integration tests against a throwaway `golden_plate_test` database (needs `npm run db:up`) |
| `npm run test:e2e` | Playwright: production build on :3200 with its own `golden_plate_e2e` DB (first run: `npx playwright install chromium`) |
| `npm run check:contrast` | WCAG AA check of every semantic colour pair in both themes |
| `npm run check:colors` | Fails if a component or page hard-codes a colour |
| `npm run generate:logo` | Regenerates the placeholder logo from the brand fonts |
| `npm run generate:pwa-icons` | Renders the installable-app PNG icons from `public/brand/favicon.svg` |
| `npm run generate:types` | Regenerates `src/payload-types.ts` after changing collections |
| `npm run generate:importmap` | Regenerates the admin import map after adding custom admin components |
| `npm run migrate:create -- <name>` | Creates a database migration after schema changes (commit it) |
| `npm run migrate` | Applies pending migrations — run as a deploy step before `npm start` |
| `npm run seed` | Loads / refreshes the sample catalogue (idempotent; never touches users, enquiries or Brand Settings) |
| `npm run db:up` / `npm run db:down` | Starts or stops local Postgres (data persists in a Docker volume) |

## Admin roles

| | Owner | Staff |
| --- | --- | --- |
| Enquiries (view, update status, notes, assign) | ✓ | ✓ |
| Packages, dishes, add-ons, occasions, cuisines, media, Site Settings | ✓ | ✓ |
| Vendors, a package's vendor, cost prices | ✓ | — (hidden entirely) |
| Users & roles, Brand Settings, deleting enquiries | ✓ | — |

The first account created becomes the owner. Search enquiries by **reference ID or phone number**; filter by status and event date from the list view.

## How an enquiry works

1. A customer customises a menu on `/menus/<slug>`. Their selection is saved on their device and the live estimate is computed by `calculateQuote()`.
2. **Send enquiry** opens the form. The server action validates it (the same Zod schema as the client), checks the honeypot and rate limit, **reloads the menu and recomputes every price**, allocates a reference such as `GPC-1026-0042`, and saves a frozen snapshot.
3. The customer lands on `/q/GPC-1026-0042-k3f9xq`, a private, unguessable, `noindex` page with WhatsApp, Call and Email buttons that are prefilled with the reference.
4. Emails go out after the response: one to the admin with a direct link to the enquiry, and a confirmation to the customer if they gave an email. During development they are printed in the terminal (`EMAIL_PROVIDER=console`).
5. Staff work the enquiry in `/admin`: change the status, add notes, assign it, or export a CSV.

## Environment variables

Every variable is documented in [.env.example](.env.example). Variables for later phases (storage, email,
WhatsApp, analytics) are listed there already and marked with their phase.

## Changing the brand, colours or fonts

See **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**. In short:

- **Name, contact details, hours, socials, reference-ID prefix:** `/admin` → Brand Settings (defaults in `src/config/brand.ts`).
- **Colours:** `src/styles/tokens.css`, then run `npm run check:contrast`.
- **Fonts:** `src/styles/fonts.ts` plus the fallback stacks in `tokens.css`.
- **Logo:** replace the files in `public/brand/`, or upload them in Brand Settings. Then run `npm run generate:pwa-icons` so the installed-app icons match.

## Installable app (PWA)

The site can be installed to a phone's home screen or a desktop like a native app:

- `src/app/manifest.ts` is the web app manifest (name from Brand Settings, icons in `public/icons/`).
- `public/sw.js` is the service worker, registered in production only. It caches static assets and the pages a visitor has opened, and shows `/offline` (with a call button) for anything else when there is no connection. Admin, API and quote pages are never cached. Bump `VERSION` in it to clear every cache.
- An **Install** button appears in the footer on browsers that support installing (Chrome, Edge, Android). On iPhone and iPad it explains Share → Add to Home Screen. It hides once the app is installed.
- Installing needs HTTPS (or `localhost`).

## Project layout

```
src/
  app/(frontend)/     public site (Phase 1: brand splash, /design-system, 404)
  app/(payload)/      Payload admin + REST API (generated, do not edit)
  collections/        Payload collections (catalogue, enquiries, vendors, users, media)
  globals/            Payload globals (Site Settings, Brand Settings)
  fields/             reusable field configs (slug, SEO, price tiers + validation)
  migrations/         committed database migrations
  access/             role-based access helpers (owner / staff)
  components/ui/      design-system components
  components/brand/   logo + admin graphics
  components/theme/   theme provider + toggle
  config/brand.ts     brand defaults
  lib/                formatting, colour/contrast, motion tokens, brand loader, env validation
  styles/             tokens.css (single source of truth), globals.css, fonts.ts
scripts/              seed data, logo generator, contrast and raw-colour checks
tests/unit/           Vitest
```

## Deploying

### Vercel
1. In the Vercel project, open **Storage** and add a **Neon** Postgres database and a **Blob** store. Vercel adds `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` to the project for you. (If Neon names the variable differently, e.g. `POSTGRES_URL`, copy its value into `DATABASE_URL`.)
2. Set the remaining env vars from `.env.example`: `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `STORAGE_DRIVER=vercel-blob`, `RATE_LIMIT_SALT` and the email settings.
3. Set the build command to `npm run migrate && npm run build` so each deploy applies new migrations first. (Or run `DATABASE_URL=… npm run migrate` yourself once per release.)
4. Open `/admin`, create the owner account and fill in **Brand Settings**. Optionally run `npm run seed` for sample menus.

Image uploads go through a Vercel function, which accepts requests up to 4.5 MB. Resize larger photos before uploading. An S3-compatible bucket (`STORAGE_DRIVER=s3`, e.g. Cloudflare R2) also works on Vercel.

### Single VPS (Docker)
```bash
cp .env.example .env.production        # real values; set POSTGRES_* too
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm migrate
```
Put Caddy or nginx in front for TLS and HTTP/2, proxying to `127.0.0.1:3000`. Uploads persist in the `media` volume, and you should back up the `pgdata` volume.
