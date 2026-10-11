# Build "Golden Plate Caterers" — a premium event-catering showcase & enquiry platform (Bangalore)

You are a senior full-stack engineer and award-level product designer. Build a production-quality web application for a new catering company. Work in phases (listed at the end). **Before writing code, produce a short plan (architecture, folder structure, data model, design tokens) and wait for my approval.** After each phase, stop, summarise what was built, and tell me how to run and verify it.

---

## 1. Business context

- We are a catering company starting in **Bangalore, India**. We partner with many independent caterers but **we are the only brand the customer sees**. Vendor names, logos, phone numbers and branding must **never** appear anywhere on the public site (pages, images, filenames, alt text, metadata, API responses, page source).
- We cater events: House Warming (Gruhapravesha), Birthday, Anniversary, Party, Engagement, Wedding, Wedding Reception, Naming Ceremony, Corporate events. Event types must be editable by admins.
- Customers browse menus/packages, **customise** them, see a live **indicative price**, then send an enquiry.
- **No online payment.** Payment happens person-to-person after we talk. The site's job is to turn interest into a clean enquiry with a reference ID.
- **No customer accounts.** Customers never need to log in.

---

## 2. Brand

- **Name:** Golden Plate Caterers (short form for compact spaces: "Golden Plate"). Tagline: "Every occasion, served in gold."
- **Everything brand-related must be configurable from one place**, with no code changes elsewhere:
  - `src/config/brand.ts` (or an admin "Brand Settings" global in the CMS, preferred): name, short name, tagline, logo (SVG for light + dark), favicon, phone, WhatsApp number, email, business hours, address/service area, social links, reference ID prefix (default `GPC`).
- Create an original placeholder logo as SVG: an elegant wordmark ("Golden Plate" in the display serif, with "CATERERS" in small, widely tracked caps beneath) plus a simple mark — a thin gold circle (the plate) with a subtle inner ring and a small highlight arc suggesting shine. Provide a monochrome version and a version for each theme. Keep it in `public/brand/` so it can be swapped for a real one.
- The **gold plate** is the visual motif across the site: circular reveals, rings in loaders and the cursor, a slow gold sheen on hover, and a hero where a plate catches the light as you scroll. Use it with restraint so it reads luxurious, not gaudy.

---

## 3. Tech stack (use latest stable versions)

- **Next.js (App Router) + TypeScript (strict)** — one app, one deployment. Server Components by default; client components only where interaction or animation needs them.
- **Payload CMS 3** running inside the same Next.js app as the admin panel (`/admin`), with **PostgreSQL** (`@payloadcms/db-postgres`). Local dev via Docker Compose for Postgres.
- **Tailwind CSS v4**, driven entirely by CSS variables from the design system (section 5).
- **Motion** (motion.dev, formerly Framer Motion) for component and page transitions. **GSAP + ScrollTrigger** for scroll-driven sequences. **Lenis** for smooth scrolling (synced with ScrollTrigger).
- **next-themes** for light/dark mode with no flash on load.
- **React Hook Form + Zod** for forms, with Zod schemas shared between client and server.
- **Resend** (or SMTP via Nodemailer, configurable) for email notifications.
- Images: Payload uploads with `next/image`. Support local storage in dev and an S3-compatible/Cloudinary adapter in prod via env vars.
- `.env.example` with every variable documented. No secrets in code.

Do **not** split into separate backend services. One monolith is enough at this scale.

---

## 4. Data model (Payload collections)

- **Vendors** (admin-only, never exposed publicly): internal code (e.g. `V07`), name, contact person, phone, email, notes, active flag. Admins with role `staff` cannot read this collection.
- **EventTypes**: name, slug, description, hero image, display order.
- **Cuisines**: name, slug (South Indian, North Indian, Chettinad, Andhra, Kerala, Udupi, Continental, …).
- **Packages**: title, slug, vendor (relation, hidden from the public API), event types (many), cuisines (many), diet (`veg` | `non-veg` | `jain` | `mixed`), short description, rich description, gallery, min guests, max guests, **price tiers** (array of `{ minGuests, maxGuests, pricePerPlate }`), **cost price per plate** (admin-only field, owner role only), featured flag, published flag, SEO fields.
- **Sections** (inside a package, as an array or relation): title (e.g. "Starters"), description, **selection rule** `{ min, max }` (e.g. choose 3 of 8), sort order.
- **MenuItems**: name, description, diet tag, spice level, image, `isPremium`, `surchargePerPlate` (0 if standard), default-selected flag. Items belong to a section.
- **AddOns** (per package, or global and reusable): name, description, image, pricing type `per_plate` | `flat`, price, category (live counter, beverages, service staff, decor, transport, banana-leaf service, …).
- **Enquiries**:
  - `referenceId` — unique, human-friendly, format `GPC-MMYY-NNNN` (e.g. `GPC-1026-0042`), generated server-side with a safe sequence (no collisions under concurrency).
  - Customer name, phone (Indian format validation, E.164 storage), optional email, event type, event date, area/locality in Bangalore, guest count, notes.
  - **Snapshot** — a JSON copy of the selected package, sections, chosen items, add-ons and every price line at the moment of submission, so later menu edits never change old quotes.
  - Estimated total, status (`new` | `contacted` | `negotiating` | `confirmed` | `completed` | `lost`), internal notes, assigned-to, timestamps, consent flag + timestamp, source (UTM params).
  - Admin list view searchable by reference ID **and** phone number; filterable by status and event date.
- **Users** (admin only): roles `owner` (everything, including vendor data and cost prices) and `staff` (enquiries, packages; no vendor identities or cost prices).
- **Globals**: Brand Settings (section 2), Site Settings (homepage content, FAQ, testimonials, SEO defaults, pricing disclaimer text).

Seed script: 3 event types, 4 cuisines, 2 vendors, 6 realistic Bangalore-style packages (veg and non-veg, ₹350–₹1,500 per plate, with sections, items, premium swaps and add-ons) so the UI can be judged with real-looking data.

---

## 5. Design system — the most important part

The site must look and feel like an **Awwwards / FWA-level** site: editorial, warm, premium, confident typography, generous whitespace, purposeful motion. It should feel like modern Indian luxury hospitality, not generic SaaS: warm gold, candlelight, polished brass and fine plating, with a hint of banana-leaf green, done in a modern minimal way.

### 5.1 Tokens (single source of truth)

- Define every token as CSS custom properties in `src/styles/tokens.css`, mapped into Tailwind v4 `@theme`. Components use **semantic tokens only** (`--color-bg`, `--color-surface`, `--color-text`, `--color-accent`…), never raw hex values.
- Changing the brand palette or fonts must only require editing `tokens.css` (and optionally the Brand Settings global). Document this in `DESIGN_SYSTEM.md`.
- Token groups: color (primitive palette, then semantic), typography (families, fluid type scale using `clamp()`, weights, line heights, letter spacing), spacing scale, radii, shadows/elevation, borders, z-index, motion (durations, easing curves, stagger amounts), breakpoints, container widths.

### 5.2 Palette (starting point; refine for contrast)

Primitives:
- Golds: Gold `#C9A24B`, Light gold `#E2C27A`, Deep gold `#9C7A2E`, Champagne `#F0DFB4`
- Supporting: Banana-leaf green `#2F5D46`, Sage `#8DA47E`, Saffron `#E39B3A` (sparingly), Chili `#B8432F` (errors/alerts only)
- Lights: Ivory `#F8F3EA`, Cream `#F1E9DA`, Sand `#E5D8C1`
- Darks: Espresso `#16120E`, Cocoa `#211B15`, Walnut `#2C241C`, Ink `#1E1913`

**Light theme** (never pure white): background Ivory `#F8F3EA`, surfaces Cream and slightly lighter ivory cards, text Ink, accent Deep gold for text and links (for contrast) and Gold for fills and decorative elements, secondary Banana-leaf green, subtle paper grain overlay at very low opacity.

**Dark theme** (never pure black): background warm Espresso `#16120E`, surfaces Cocoa `#211B15` / Walnut `#2C241C`, text warm off-white `#F3EADB`, accent Light gold `#E2C27A` with soft golden glows instead of hard shadows. Dark mode should feel like an evening reception lit by warm lights.

- A reusable **gold gradient / sheen** token (e.g. `--gradient-gold: linear-gradient(135deg, #9C7A2E, #E2C27A 45%, #C9A24B)`) for the logo mark, key dividers and the primary CTA hover state. Never use it for body text.

- All text/background pairs must meet **WCAG AA** contrast. Write a small script or test that checks the semantic pairs.
- Theme toggle: an animated sun/moon (or diya flame) morph in the header. Respect system preference by default and persist the choice. No flash of the wrong theme.

### 5.3 Typography

- Display: an expressive serif with high contrast (e.g. **Fraunces** or **Cormorant Garamond**) for headlines, set large with tight tracking.
- Body/UI: a clean grotesk (e.g. **Inter Tight**, **Manrope** or **General Sans**).
- Load via `next/font`. Fonts are swappable through tokens.
- Fluid type scale from mobile to desktop; huge editorial hero headlines on desktop.

### 5.4 Components

Build a small, consistent library in `src/components/ui` (Button variants, Link, Badge/Diet tag, Card, Chip/Filter, Input, Select, Date picker, Stepper (guest count), Checkbox/Radio cards, Modal/Drawer, Tabs, Accordion, Toast, Skeleton, Price display in ₹ with Indian number formatting `en-IN`). Add a `/design-system` route (dev only, or behind the admin login) that shows all tokens and components in both themes.

---

## 6. Motion, cursor & interaction

### 6.1 Custom cursor (desktop / fine pointer only)

- A small dot plus a trailing ring with spring physics (lerped, not laggy).
- **Context-aware states:** grows and inverts (`mix-blend-mode: difference`) over headlines; shows a label ("View", "Customise", "Drag") over package cards, carousels and CTAs; **magnetic pull** on primary buttons and icons; shrinks on text inputs (native caret visible).
- Hidden on touch devices (`pointer: coarse`) and when `prefers-reduced-motion` is on; the native cursor is restored in those cases. Never hide the native cursor in form fields or the admin panel.
- Implement with `requestAnimationFrame` and transforms only (no layout thrash). Make it a single provider component with a tiny API (`data-cursor="view"` attributes on elements).

### 6.2 Scroll & page motion

- Lenis smooth scrolling, synced with GSAP ScrollTrigger.
- **Hero:** split-text reveal of the headline (line and word masks), a subtle parallax food image collage, and a slow ambient gradient/grain. Optional: a top-down golden plate where dishes drift into place around it as you scroll, and the gold rim catches the light.
- **Section reveals:** clip-path and mask reveals, staggered fades, image scale-on-scroll.
- **Pinned storytelling section** "How it works" (Browse → Customise → Get your reference → We call you), with progress tied to scroll.
- **Horizontal scroll gallery** of event types on desktop; becomes a swipeable carousel on mobile.
- Marquee of cuisines/occasions with velocity that reacts to scroll speed.
- **Page transitions** between routes (curtain/overlay wipe in brand colors) with Motion; keep them under 600 ms.
- Micro-interactions: button hover fills, card tilt/lift, animated price counter when the estimate changes, checkbox ticks that draw in, toast slide-ins.
- **Accessibility first:** every animation respects `prefers-reduced-motion` (fall back to simple fades or none). Motion must never block content or interaction.

### 6.3 Performance budget (non-negotiable)

- Lighthouse on mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- Animate only `transform` and `opacity`. Lazy-load GSAP-heavy sections. Use `next/image` with proper sizes and AVIF/WebP. Do not ship large client bundles to pages that don't need them.

---

## 7. Pages & UX

1. **Home** — hero; occasions (event types); featured packages; "How it works" pinned section; why choose us; cuisines marquee; testimonials; FAQ; final CTA with phone, WhatsApp and email.
2. **Menus / Packages** (`/menus`) — filterable grid by event type, cuisine, diet (Veg / Non-veg / Jain), budget per plate (range slider), guest count. Filters sync with the URL (shareable). Sort by price or popularity. Empty and loading states designed.
3. **Event type landing pages** (`/occasions/[slug]`) — SEO pages like "Wedding Reception Catering in Bangalore", with relevant packages.
4. **Package detail & customiser** (`/menus/[slug]`) — the core experience:
   - Gallery, description, diet/cuisine badges, per-plate price by guest tier.
   - Guest count stepper (validated against min/max), event date.
   - Each section shows its rule ("Choose 3 of 8"); the UI enforces min/max with clear feedback. Premium items show "+₹40/plate".
   - Add-ons as selectable cards (per-plate or flat).
   - **Sticky price summary** (side panel on desktop, bottom sheet on mobile): base per-plate × guests, premium surcharges, per-plate add-ons, flat add-ons, **indicative total** with an animated counter, and the disclaimer "Indicative estimate — final price confirmed on call."
   - All price calculation lives in **one pure, unit-tested function** shared by client and server. The server **recomputes** the price on submit and never trusts client totals.
   - The customer's in-progress selection is saved to localStorage (wrapped in try/catch) so a refresh doesn't lose it.
5. **Enquiry form** (drawer or step) — name, phone, optional email, event type, date, area/locality, guest count (prefilled), notes, and a consent checkbox linking to the privacy policy. Rate-limited, honeypot field, server-side Zod validation. A general enquiry (without a package) is also allowed.
6. **Quote confirmation & quote page** (`/q/[referenceId]`):
   - Big, clearly readable reference ID with a copy button.
   - Three contact actions:
     - **WhatsApp:** `https://wa.me/<number>?text=` with a prefilled, URL-encoded message: "Hi Golden Plate Caterers, I'd like to discuss quote GPC-1026-0042 — Wedding Reception, 300 guests, 14 Dec 2026. <quote link>".
     - **Call:** `tel:` link, with the text "Please mention your reference GPC-1026-0042".
     - **Email:** `mailto:` with subject "Quote GPC-1026-0042 – Wedding Reception, 14 Dec 2026" and the quote link in the body.
   - The quote page shows the full snapshot (menu, add-ons, price lines), is printable (print stylesheet), `noindex`, and uses a non-guessable URL (reference ID plus a short random token, e.g. `/q/GPC-1026-0042-k3f9`) so people can't enumerate other quotes. It shows the customer's first name only, never their full phone number.
   - Business hours shown near the contact actions.
7. **About, Contact, FAQ, Privacy Policy, Terms** — the privacy policy is written with India's DPDP Act in mind (placeholder legal text clearly marked for review).
8. **Global:** header with logo, nav, theme toggle and a "Call / WhatsApp" quick action; footer with phone, email, hours, service area and socials; a floating WhatsApp/call button on mobile; a custom 404 page with personality.

---

## 8. Notifications & admin workflow

- On every new enquiry: an email to the admin address with all details and a direct link to the enquiry in `/admin`, and a confirmation email to the customer if they gave an email.
- Optional (env-flagged): send a WhatsApp notification to the admin via a configurable provider webhook. Keep it behind an interface so a provider can be plugged in later.
- Admin dashboard home: counts by status, today's new enquiries, upcoming events this week.
- CSV export of enquiries.

---

## 9. SEO, analytics, quality

- Metadata API for every page, Open Graph images (generated with `next/og` using brand tokens), `sitemap.xml`, `robots.txt`, canonical URLs, JSON-LD (`LocalBusiness` / `FoodEstablishment` for the business, `Offer`/`Menu` where appropriate). **No vendor data in any of it.**
- Analytics: GA4 via env var, plus custom events (`package_view`, `customise_change`, `enquiry_submit`, `whatsapp_click`, `call_click`, `email_click`).
- Accessibility: semantic HTML, keyboard navigable (including the customiser), visible focus states styled with tokens, ARIA where needed, alt text on all images.
- Tests: Vitest unit tests for price calculation, reference ID generation and validation schemas; Playwright e2e test for browse → customise → enquire → quote page; an automated check that vendor fields never appear in public API or page responses.
- ESLint + Prettier, strict TypeScript, no `any`.
- A `README.md` covering setup, env vars, seeding, deploying (Vercel or a single VPS with Docker), and how to change brand, colors and fonts.

---

## 10. Build phases (stop after each one for review)

1. **Foundation** — project setup, Payload + Postgres + Docker Compose, design tokens, fonts, light/dark theming, brand config, base UI components, `/design-system` page.
2. **Data & admin** — collections, roles and access control, seed script, admin list views (search by reference ID and phone).
3. **Public browsing** — home page (static content first), menus listing with filters, occasion pages, package detail (read-only).
4. **Customiser & enquiry** — selection rules, price engine with tests, sticky summary, enquiry form, reference ID generation, snapshot, quote page, WhatsApp/call/email actions, emails.
5. **Motion & polish** — custom cursor, Lenis + GSAP scroll sequences, page transitions, micro-interactions, reduced-motion fallbacks.
6. **SEO, performance & QA** — metadata, JSON-LD, OG images, Lighthouse pass against the budgets, accessibility audit, e2e tests, README.

When something in this brief is ambiguous, pick the option that best serves a fast, beautiful, trustworthy experience for an Indian family planning an event on their phone, note the decision in `DECISIONS.md`, and continue.
