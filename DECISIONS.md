# Decisions

Choices made where the brief was ambiguous or needed refining. Each entry records what was decided and why.

## Phase 1 — Foundation

1. **Stack versions.** Next.js 16.4 and Payload 3.90 with `@payloadcms/db-postgres`, React 19.2, Tailwind 4.3, TypeScript 5.9 (TypeScript 7 is not yet supported by the Next/Payload toolchain). The package manager is **npm** (the user's preference), with `legacy-peer-deps=true` in `.npmrc`, the same as the Payload template, because npm's peer auto-install crashes on Vitest's optional browser peers.
2. **Light-mode accent text is bronze `#7A5E22` (new primitive `gold-700`).** The brief's deep gold `#9C7A2E` reaches only about 3.6:1 on ivory, which fails AA for body text. Deep gold is kept for large display type (`accent-display`, 3:1 or better) and for fills.
3. **Light-mode error text is `#A63A27` (new primitive `chili-deep`).** Chili `#B8432F` measured 4.48:1 on cream, just under AA. Chili-light `#E07A63` is used for errors in dark mode.
4. **Extra neutrals** (`sand-deep`, `stone`, `umber`, `walnut-light`, `taupe`, `mushroom`, `parchment`, `ivory-50`, `clay`, `saffron-deep`) were added so that muted text and form-control borders meet AA (4.5:1 for text, 3:1 for UI). `npm run check:contrast` checks 62 pairs per theme.
5. **Theming uses `light-dark()` plus `color-scheme`.** Semantic tokens are declared on `:root` and on every `[data-theme]` element. Tailwind's CSS optimiser (Lightning CSS) rewrites `light-dark()` for older Safari using variables that resolve where they are declared. Re-declaring on `[data-theme]` keeps nested theme overrides working, for example a dark section on a light page.
6. **Fonts are Fraunces (display) and Inter Tight (body),** loaded through `next/font/google`. Both include ₹ (U+20B9) in their `latin-ext` subset, which `next/font` serves on demand. Swapping fonts means editing `src/styles/fonts.ts` (the font import) and the fallback stacks in `tokens.css`. `next/font` cannot be configured from CSS alone.
7. **Brand configuration has two layers:** `src/config/brand.ts` (typed defaults) and the **Brand Settings** Payload global (owner-editable overrides). `getBrand()` merges them, caches the result under the `brand` tag, and revalidates immediately when the global is saved. If the database is unreachable, or a saved value is invalid, the site renders with the defaults rather than failing.
8. **The placeholder logo is generated, not hand-drawn.** `scripts/generate-logo.ts` outlines the Fraunces and Inter Tight glyphs to SVG paths so the logo renders the same everywhere (including `<img>` tags, emails and OG images). The same geometry drives the inline React `<Logo>`. The favicon sits on a dark disc with heavier strokes so it stays legible at 16px on any browser chrome.
9. **Media privacy.** Uploaded filenames are replaced with a content hash (`gp-<sha256-16>.<ext>`). Raster images are re-encoded to WebP through sharp, which drops EXIF, GPS and camera metadata. This prevents vendor or photographer names leaking through filenames or metadata.
10. **Roles.** The first account ever created becomes `owner`. Only owners can create, delete or re-role users, or edit Brand Settings. Staff can only edit their own profile, and the `role` field ignores staff writes.
11. **GraphQL is disabled.** The public site reads data only through a server-only data layer (Phase 3), which reduces the API surface for vendor-data leaks.
12. **Database schema:** dev uses Payload's schema push. Production applies the committed migrations in `src/migrations/` through an explicit deploy step (`npm run migrate`), not on boot. Running them on boot also runs them during `next build` and can block on an interactive prompt.
13. **`/design-system` access:** open in development; in production it requires an admin login unless `DESIGN_SYSTEM_PUBLIC=true`. It is always `noindex`.
14. **Primitives:** Radix UI for accessible behaviour (Dialog, Popover, Select, Tabs, Accordion, Checkbox, RadioGroup), sonner for toasts, react-day-picker 9 for dates. The date picker is a popover on desktop and a bottom sheet with 48px targets on phones.
15. **The accordion does not animate height.** The brief limits animation to `transform` and `opacity`, so panels fade and rise in while the height changes instantly.
16. **Caching uses `unstable_cache` for now.** Next 16 recommends opting into Cache Components (`use cache`). That changes rendering semantics app-wide and needs checking against Payload's admin routes, so it will be revisited in Phase 3 when the public data layer is built.
17. **All money is integer rupees** (no paise) throughout pricing, storage and display.

## Phase 2 — Data & admin

18. **The seed has more than the brief's minimum.** The brief asks for 3 event types and 4 cuisines. The seed loads all **9 occasions** named in the brief and **7 cuisines**, because the packages and the occasions gallery need them to look realistic. It also loads 2 vendors, 6 packages (₹350–₹1,500 per plate), 78 dishes and 10 add-ons. The seed is idempotent: records are matched by slug, code or name.
19. **Dishes are a library, with per-section overrides.** A package section lists dishes and can set `premium` (inherit / standard / premium), the surcharge and the pre-selection for each one. The same dish can be standard in one menu and premium in another without duplicating it.
20. **Sections are an array inside each package.** Their sort order is the array order (drag to reorder), and each has a `{min, max}` selection rule. Validation rejects `min > max` and a `max` larger than the number of dishes.
21. **Price tiers are validated.** They must be contiguous, non-overlapping and exactly span the package's minimum to maximum guests, so every guest count has one price. The validator is `validatePriceTiers`, which is unit tested.
22. **Vendor isolation in the data layer:**
    - Anonymous users can't read any catalogue collection through the API; the public site will use a server-only data layer in Phase 3.
    - `Packages.vendor` and `Packages.costPricePerPlate` have field-level access for owners only, so staff neither see nor write them.
    - The Vendors collection is owner-only and hidden from staff in the admin navigation.
    - Verified with owner, staff and anonymous users against a seeded database.
23. **Enquiries can't be created through the API** (`create: () => false`). Only the server-side enquiry action (Phase 4) creates them, using `overrideAccess`. Staff can update status, notes and assignment; only owners can delete.
24. **Reference-ID counters** live in a hidden `enquiry-counters` collection: one row per `MMYY` period. Phase 4 increments it with an atomic SQL upsert.
25. **Media storage** is local by default, Vercel Blob with `STORAGE_DRIVER=vercel-blob` (the default for Vercel: no extra account), or any S3-compatible store with `STORAGE_DRIVER=s3` (AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces). The Blob plugin is always registered (disabled unless selected) with `alwaysInsertFields`, so `media` has the same columns in every environment and one set of migrations fits all drivers. Blob files are served directly from its CDN. Direct browser uploads (`clientUploads`) are off: they would store the original filename publicly before the rename hook runs. The cost is Vercel's 4.5 MB request limit per upload. There is no official Payload Cloudinary adapter, so Cloudinary is not wired. If you need it, a third-party Cloudinary plugin can be added behind the same `STORAGE_DRIVER` switch.
26. **Seed images are generated** abstract "thali from above" illustrations made with sharp. No stock photos or identifiable content. Replace them with real photography before launch.
27. **The admin dashboard and CSV export** (brief §8) are built in Phase 4 together with the enquiry flow they summarise.

## Phase 3 — Public browsing

28. **Public data layer.** The site reads everything through `src/lib/data/*`:
    - The code is server-only and uses explicit `select` whitelists.
    - It maps to DTOs defined in `src/lib/data/types.ts`, which contain no vendor or cost fields.
    - Pages never call Payload directly.
    - Media URLs are made relative when they are on the same site, so `next/image` optimises them. An S3/CDN host is allowed through `S3_PUBLIC_URL`.
29. **Caching.** Production caches catalogue data with `unstable_cache` under the `catalog` and `site-settings` tags. Every catalogue collection and global clears its tag on change. Development skips caching so seed runs show immediately.
30. **`/menus` filters live in the URL** (`?occasion=&cuisine=&diet=&min=&max=&guests=&sort=`), so they can be shared and the browser back button works.
    - Parsing and filtering are pure functions (`src/lib/catalog/filters.ts`, unit tested).
    - Filtering happens on the server; the catalogue is small, so it filters in memory after one cached query.
    - The controls update optimistically while results reload.
31. **Diet filter semantics:**
    - "Veg" shows pure-veg kitchens, i.e. veg **and Jain** menus.
    - "Jain" shows Jain menus only.
    - "Non-veg" shows non-veg **and mixed** menus.
    - A mixed menu is never shown under "Veg", because families asking for veg usually mean a pure-veg kitchen.
32. **Budget filter.** Without a guest count, a menu matches if any of its tier prices fall inside the range. With a guest count, the menu's exact per-plate price for that count must fall inside the range, and cards show that price.
33. **The `/menus` loading boundary sits inside a `(list)` route group**, so it doesn't wrap `/menus/[slug]`. That keeps unknown slugs as real HTTP 404s, because `notFound()` runs before streaming starts.
34. **Headline emphasis.** Admins mark gold italic words in CMS headlines with `*asterisks*` (for example "served *in gold*"). No rich-text editor is needed for one-line headlines.
35. **The footer and the final call to action are always dark** (`data-theme="dark"`), giving the "evening reception" band in both themes.
36. **Phase 3 placeholders that later phases replace:**
    - The package call to action links to `/contact?menu=<slug>` until the Phase 4 customiser exists.
    - Occasions are a swipeable row on every screen size until Phase 5 adds the pinned horizontal scroll.
    - The marquee is CSS-only until Phase 5 makes it react to scroll velocity.

## Phase 4 — Customiser & enquiry

37. **One price engine.** `calculateQuote()` in `src/lib/pricing/calculate.ts` is a single pure function used by the customiser for the live estimate and by the server action on submit. It is unit tested: tiers and their boundaries, premium surcharges, per-plate and flat add-ons, section rules, out-of-range guest counts, and unknown or duplicate ids. The server **reloads the package from the database and recomputes every price**; client totals are never sent.
38. **Estimate when guests are out of range.** If the guest count is outside the menu's range, the estimate still shows using the nearest tier, but the quote is invalid and can't be sent until the count is fixed.
39. **Selection rules in the UI:**
    - A section with `max: 1` behaves like a radio group: picking another dish swaps the choice.
    - In a section with `max > 1`, once the maximum is reached the remaining dishes are disabled, with a "Remove one to pick another" hint.
    - Every section shows a live "Done" or "Choose N more" badge.
    - The Send button stays disabled until all rules pass, and lists jump links to any section that needs attention.
40. **Saved selections.** The in-progress selection is saved to `localStorage` per package. All storage access is wrapped in try/catch. On load, ids that no longer exist in the menu are dropped and the guest count is clamped. The server render always uses the chef's defaults; after hydration the customiser remounts with the saved selection, which avoids a hydration mismatch.
41. **Reference IDs** have the format `GPC-MMYY-NNNN`, with the month in Asia/Kolkata time. They come from **one atomic SQL upsert** on `enquiry_counters` (`INSERT … ON CONFLICT (period) DO UPDATE SET value = value + 1 RETURNING value`), so concurrent submissions can't collide. An integration test fires 50 requests in parallel and gets 50 unique, contiguous numbers. NNNN grows past 9,999 if needed.
42. **Quote URLs** are `/q/<ref>-<token>`, where the token is 6 characters from a 31-character unambiguous alphabet (about 887 million combinations). Tokens are compared in constant time. A wrong or missing token returns the same 404 as an unknown reference. Quote pages are `noindex, nofollow`, rendered dynamically, and show only the customer's first name and a masked phone number (`+91 ••••• •3210`).
43. **The snapshot is self-contained.** `QuoteSnapshotV1` stores the package title, chosen dishes, add-ons, every price line and the disclaimer text. Later menu edits never change an existing quote. It never contains vendor or cost data, and a unit test asserts that.
44. **Spam and abuse:**
    - A honeypot field rejects bots silently.
    - Rate limiting allows 5 enquiries per 10 minutes and 20 per day per client. It is stored in Postgres with an atomic upsert and keyed by a salted SHA-256 of the IP; raw IPs are never stored.
    - The same Zod schema validates the form on the client and the server.
45. **Phone numbers** must be Indian mobiles (10 digits starting 6–9). The form accepts common formats (`+91`, a leading `0`, spaces, dashes) and stores E.164 (`+91XXXXXXXXXX`).
46. **Notifications** run in Next's `after()`, so they never slow down or fail an enquiry:
    - Email providers: `console` (development default), `resend` (HTTP API, no SDK) or `smtp` (Nodemailer, loaded lazily).
    - The admin email goes to `ADMIN_NOTIFY_EMAIL`, falling back to the brand email, and links straight to the enquiry in `/admin`.
    - The customer gets a confirmation only if they gave an email.
    - The WhatsApp admin alert sits behind the `WhatsAppNotifier` interface. It does nothing unless `WHATSAPP_NOTIFY_ENABLED=true`; then it POSTs `{to, text}` to a webhook.
47. **Admin:**
    - The dashboard shows counts by status (each links to a filtered list), enquiries created today, and events in the next 7 days.
    - CSV export is at `GET /api/enquiries/export.csv[?status=…]`, for admins only. It is UTF-8 with a BOM for Excel and protects against spreadsheet formula injection. It has no vendor or cost columns.
48. **General enquiries** (without a package) can be sent from `/contact`. The `?menu=<slug>` parameter prefills a note.
49. **Overlay layering.** A `--z-popover` level (550) sits above modals and drawers, so date pickers and selects work inside the enquiry drawer. Closing overlays get `pointer-events: none`, so a fade-out can never swallow clicks.
50. **Integration tests** (`npm run test:int`) run against a throwaway `golden_plate_test` database. It is dropped, recreated and seeded on every run, and never touches development data. They cover atomic reference IDs, rate limiting, the first-user owner rule, anonymous API denial, staff isolation, and that no public data-layer output contains any vendor name, code, contact, phone or cost field.

## Phase 5 — Motion & polish

51. **Motion is progressive enhancement.** An inline script in `<head>` adds `motion-ready` to `<html>` before first paint, but only when `prefers-reduced-motion` is not set. All "start hidden" styles are scoped to `.motion-ready`. Without JS, or with reduced motion, every element is visible with no animation, and the global reduced-motion rule collapses any remaining transitions.
52. **Above-the-fold entrances are pure CSS keyframes** (`.reveal-load`, `.split-load`) that start with the stylesheet. They never wait for JavaScript or an IntersectionObserver, which protects LCP. Below-the-fold reveals use **one** page-level IntersectionObserver (`RevealObserver`) that sets `data-revealed` on `[data-reveal]` elements. Server components only add an attribute and ship no JS of their own.
53. **Headline reveals** are word masks (`SplitText`). Screen readers read the plain sentence once, and the animated words are `aria-hidden`. The `*emphasis*` convention keeps working.
54. **Scroll engine:**
    - Lenis smooths **wheel and trackpad** scrolling only; touch keeps native momentum. It is off under reduced motion, and it pauses while a Radix dialog locks scrolling (`data-scroll-locked`). Scrollable overlays carry `data-lenis-prevent`.
    - GSAP and ScrollTrigger are **dynamically imported** only by components that use them (`ScrollScene`), and they stay out of the initial bundle.
    - Scenes run inside `gsap.matchMedia()`, so they only exist at the intended breakpoint without reduced motion, and are fully reverted on resize or unmount.
55. **Scroll scenes:**
    - The hero plate rotates, its highlight arc sweeps around the rim and the dish image drifts, all scrubbed to scroll.
    - "How it works" pins on desktop, with a gold progress line and steps lighting up in turn.
    - Occasions become a pinned horizontal scroll on desktop and stay a native swipe carousel on phones and tablets.
    - The marquee's speed and direction follow scroll velocity through Web Animations `playbackRate`, with no re-layout.
56. **Custom cursor:**
    - Mouse only: it needs `(pointer: fine) and (hover: hover)` and no reduced motion.
    - The dot tracks exactly, the ring follows with a lerp, and `requestAnimationFrame` sleeps once the ring settles. It uses transforms only.
    - States come from `data-cursor`: `view`, `customise` and `drag` show labels, and `magnetic` pulls the element. Headlines invert beneath a disc using `mix-blend-mode: difference`.
    - The native cursor is hidden only on the public site, never in form fields (the caret stays visible), and never in `/admin`, because the provider is mounted only in the site layout.
57. **Page transitions** use a Motion `LazyMotion` curtain in `(site)/template.tsx`: an espresso panel with a gold edge wipes up in about 560 ms while the new page fades in. It is skipped on the first page load (LCP), never intercepts input, and is off under reduced motion. Filter changes on `/menus` replace only the query string, so they don't trigger it.
58. **Micro-interactions:**
    - The primary button gets a sheen sweep on hover.
    - Package cards tilt up to ±4° (mouse only) and lift.
    - The price counter eases to each new value.
    - Checkbox ticks draw in.
    - Toasts slide in.
    - Section headings and card grids fade up in a stagger.
59. **Bundle trims:**
    - The calendar (react-day-picker and date-fns) and the enquiry form (React Hook Form and Zod) are code-split and preloaded when the visitor hovers or focuses the control that opens them. That cut the menu page's initial JS from about 368 KB to about 292 KB gzipped.
    - GSAP, ScrollTrigger and Lenis load lazily.
    - Remaining budget work is part of the Phase 6 Lighthouse pass.

## Phase 6 — SEO, performance & QA

60. **SEO:**
    - Every page has metadata and a canonical URL.
    - `sitemap.xml` and `robots.txt` live at the app root. `robots.txt` disallows `/admin`, `/api/`, `/q/` and `/design-system`.
    - Open Graph images are generated with `next/og` in brand colours: one for the site, one per menu and one per occasion.
    - JSON-LD: `FoodEstablishment` (from Brand Settings only), `Menu` with an `AggregateOffer` and per-plate `UnitPriceSpecification`s, `BreadcrumbList`, and `FAQPage`. None of it contains vendor data.
    - Quote pages send `noindex` as both a meta tag and an `X-Robots-Tag` header, plus `Cache-Control: private, no-store`.
61. **Analytics.** GA4 loads only when `NEXT_PUBLIC_GA4_ID` is set, after the page is interactive, with `anonymize_ip`. One delegated click listener turns `data-analytics` links into `whatsapp_click`, `call_click` and `email_click` events. `package_view`, `customise_change` and `enquiry_submit` fire from their components. No personal data is ever sent as an event parameter.
62. **Security headers** on every response: `nosniff`, `strict-origin-when-cross-origin`, `SAMEORIGIN` framing, a restrictive Permissions-Policy and HSTS. The `X-Powered-By` header is removed.
63. **Performance work:**
    - CSS is inlined (`experimental.inlineCss`).
    - Fraunces loads weight-only and isn't preloaded.
    - ₹ comes from ~2 KB one-glyph fonts with `unicode-range`, so the latin-ext font files never download. Fonts went from about 500 KB to 129 KB.
    - The logo wordmark is a cached CSS-mask SVG instead of inline paths.
    - Hero entrances are transform-only, so LCP is never hidden behind an animation.
    - The FAQ uses native `<details>`, with no JS.
    - Lazily loaded: the mobile nav drawer, sonner toasts, the Motion curtain (after the first navigation), and the cursor, Lenis, reveal and analytics bundle.
64. **Lighthouse (mobile, simulated slow 4G, `next start` on localhost over HTTP/1.1):**
    - Accessibility, Best Practices and SEO score **100** on every page tested.
    - Performance scores **87–89**, and 91 on `/faq`.
    - CLS is 0–0.001 and TBT is 10–40 ms.
    - The observed LCP is about 0.17 s, but the simulated LCP is 3.6–3.9 s, driven by the number of early framework script requests over HTTP/1.1.
    - **Remaining gap:** re-measure on the real deployment (HTTP/2 on Vercel or behind Caddy/nginx), where I expect the score to be higher. I haven't verified that. If it is still under 90, the next levers are reducing the number of client components in the shared layout and trimming the React payload.
65. **Tests:**
    - Unit (Vitest): pricing, references, validation, filters, CSV, JSON-LD, tokens, contrast.
    - Integration (`npm run test:int`, against a real Postgres).
    - E2E (`npm run test:e2e`): Playwright on a production build with its own `.next-e2e` build directory, a `golden_plate_e2e` database and port 3200. It covers the full journey on desktop and mobile, form validation and the honeypot, axe WCAG 2.1 AA checks on 7 pages, a vendor-leak crawl of every sitemap URL and anonymous API endpoint, and SEO essentials.
66. **Deployment:** Vercel (zero config) or a single VPS with `Dockerfile` (standalone output) and `docker-compose.prod.yml` (app, Postgres and a media volume, plus a `migrate` one-off).

## Sample photography

67. **Seed photos come only from Pexels** (free for commercial use, no attribution required; https://www.pexels.com/license/).
    - `scripts/seed/photo-sources.ts` holds 42 curated sources with their source pages.
    - Every occasion and package gets its own photo. Dishes are mapped by keyword and diet, so a veg dish never shows meat.
    - One photo was rejected because it showed another restaurant's logo.
    - Images from other caterers' websites are never used. They're copyrighted and could expose another brand.
    - Re-running the seed reuses photos it has already imported and deletes only unreferenced images the seed itself created; user uploads are never touched.
    - Replace these with your own event photography before launch.
