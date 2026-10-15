# Kool Fruits

Ordering web app for Kool Fruits, a coconut water delivery business in Jamaica.
"Fresh • Tropical • Natural"

This repo is being built in phases. **Current status: Phase 5 complete — all five
phases are done**, plus order notifications (email + a live Google Sheet) added after,
and it's deployed. The app is installable as a PWA, and [DEPLOYMENT.md](DEPLOYMENT.md)
covers the hosting setup in detail.

**Live**: [koolfruits-web.onrender.com](https://koolfruits-web.onrender.com) (customer
site) · [koolfruits-web.onrender.com/admin](https://koolfruits-web.onrender.com/admin)
(admin board) · API at [koolfruits-api.onrender.com](https://koolfruits-api.onrender.com).
Hosted on Render's free tier — the API sleeps after ~15 minutes idle and takes 30-50s to
wake on the next request; see DEPLOYMENT.md if that becomes worth paying to avoid.

- `/api` — ASP.NET Core Web API (C#, .NET 10), Entity Framework Core, SQLite (dev) /
  PostgreSQL (hosting)
- `/web` — React + Vite + TypeScript + Tailwind, installable PWA
- `/assets` — source logo and poster images

You need **both** `api` and `web` running at the same time to use the app — the web
app's dev server proxies `/api` and `/product-photos` requests to the API.

## Running the API

Requires the [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd api
dotnet run
```

The API starts on the URL printed in the console (see `api/Properties/launchSettings.json`,
default is `https://localhost:7xxx` / `http://localhost:5xxx`). On first run it will:

1. Apply EF Core migrations, creating `api/koolfruits.db` (SQLite).
2. Seed the 3 products, 6 delivery areas, and one admin user (see **Admin login** below).

### Useful endpoints to try

- `GET /api/config` — business name, tagline, WhatsApp number, currency
- `GET /api/products` — product list
- `GET /api/delivery-areas` — delivery areas + fees
- `POST /api/orders` — place an order
- `GET /api/orders/{orderNumber}?phone=...` — look up an order (e.g. `KF-00001`); the
  phone must match the one the order was placed under
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — admin session
  (cookie-based)
- `GET /api/admin/orders`, `GET /api/admin/orders/today`, `POST /api/admin/orders`,
  `PATCH /api/admin/orders/{id}/status`, `PATCH /api/admin/orders/{id}/paid` — admin order
  management, all `[Authorize]`-protected
- `GET /api/admin/customers` — customer list with aggregated order count/spend
- `GET /api/admin/sales-summary` — today/this week/this month revenue, order count, and
  quantity sold per product
- `GET|PUT /api/admin/products`, `PATCH /api/admin/products/{id}/sold-out`,
  `POST /api/admin/products/{id}/photo` (multipart upload) — product management
- `GET|POST /api/admin/delivery-areas`, `PUT /api/admin/delivery-areas/{id}` — delivery
  area management

### Admin login

A default admin account is seeded on first run from `appsettings.json` (`Admin:Username` /
`Admin:Password`, defaults `admin` / `ChangeMe123!`). **Change this before deploying** —
either edit `appsettings.json` (or an environment-specific override / user secrets) before
the first run, or delete `koolfruits.db` and restart to reseed. Sign in at `/admin` in the
web app. The session is a cookie (14 days, sliding expiration) — in production, serve `web`
and `api` under the same origin (or a reverse proxy) so the cookie is first-party; the
cookie is set `SameSite=None; Secure` outside Development, which requires HTTPS.

### Switching to PostgreSQL

The API is already wired for both providers. To use Postgres (e.g. when hosting),
set in `appsettings.json` or environment variables:

```json
{
  "Database": { "Provider": "Postgres" },
  "ConnectionStrings": { "Postgres": "Host=...;Database=...;Username=...;Password=..." }
}
```

No code changes needed — `Program.cs` picks the provider from `Database:Provider`.

### Order notifications (email + Google Sheet)

Every new order (customer-placed or manually entered by the admin) triggers two things in
the background, after the HTTP response has already gone back to whoever placed the order
— a slow or down third party never makes checkout wait or fail:

1. An email to `Email:RecipientAddress`, sent via the [Resend](https://resend.com) API
2. A new row appended to a Google Sheet, via a Google Apps Script "Web App" URL

Both are **off by default** — if unconfigured, the API logs a line and skips them, nothing
breaks. To turn them on:

**Email (Resend):**
1. Sign up at [resend.com](https://resend.com) with the email you want notifications sent
   to, verify it, then create an API key (Dashboard → API Keys).
2. Set `Email:ResendApiKey` and `Email:RecipientAddress`. Locally, use user secrets so the
   key never ends up in a committed file:
   ```bash
   cd api
   dotnet user-secrets set "Email:ResendApiKey" "re_..."
   ```
   `Email:RecipientAddress` and `Email:FromAddress` aren't secret and can just live in
   `appsettings.json`. The free Resend tier sends from `onboarding@resend.dev` without any
   domain setup, as long as the recipient is the same address that owns the Resend account
   — fine for notifying yourself, not for emailing customers.

**Google Sheet:** no Google Cloud project or API key needed — just a small Apps Script
deployed from inside the spreadsheet itself:
1. Create a Google Sheet, add a header row:
   `Date | Order # | Customer | Phone | Items | Subtotal | Delivery | Total | Payment | Address | Landmark | Area | Status`
2. **Extensions → Apps Script**, replace the starter code with a `doPost(e)` function that
   checks a shared-secret field in the posted JSON and calls `sheet.appendRow(...)` with
   the matching fields (see the webhook payload shape in
   `api/Services/GoogleSheetsNotifier.cs`).
3. **Deploy → New deployment → Web app**, execute as **Me**, who has access **Anyone** —
   and actually click through to **Deploy** (an undeployed script's URL returns a
   "page not found"-style error, not a clear "not deployed" message).
4. Set `GoogleSheets:WebAppUrl` to the deployment's URL and `GoogleSheets:SharedSecret` to
   whatever value you put in the script, both via user secrets locally:
   ```bash
   dotnet user-secrets set "GoogleSheets:WebAppUrl" "https://script.google.com/macros/s/.../exec"
   dotnet user-secrets set "GoogleSheets:SharedSecret" "<a random string>"
   ```

A couple of things worth knowing if you're debugging the webhook: curl handles the
redirect Apps Script's `/exec` URL returns differently than `HttpClient` does (plain `curl
-L` mangles the POST body across the redirect), so testing the webhook with curl can show
failures that don't actually happen through the real API — trust the API's own logs
(`System.Net.Http.HttpClient.GoogleSheetsNotifier` category) over a curl test. And editing
an **existing** deployment's "Who has access" setting doesn't always take effect — if
access errors persist, make a brand new deployment rather than editing the old one.

In production, set all four of `Email:ResendApiKey`, `Email:RecipientAddress`,
`GoogleSheets:WebAppUrl`, `GoogleSheets:SharedSecret` as real environment variables on
your host (see `DEPLOYMENT.md`), the same way as any other secret.

## Running the web app

Requires [Node.js](https://nodejs.org/) 20+. Run this in a **second terminal**, alongside
the API:

```bash
cd web
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). The dev server proxies
`/api/*` and `/product-photos/*` to the API at `http://localhost:5258` (see
`web/vite.config.ts`) — if you change the API's port, update the proxy target there too.

### What's in Phase 2

- Home page: product cards with photo, price, +/- quantity, sold-out state
- Sticky cart bar with item count and running total
- Checkout form: name, phone, delivery area (with per-area fee), address, landmark,
  ASAP or scheduled delivery time, payment method, note
- Places the order via the API, shows a confirmation screen ("Order placed! 😊 We will
  contact you soon") with the order number, and a "Send on WhatsApp" button that opens
  `wa.me` with the order pre-filled
- Remembers the customer's name/phone/address/area in the browser (`localStorage`) so
  returning visitors don't have to retype it

Mark a product sold out from `/admin/products` (Phase 4) to see the greyed-out state here.

### What's in Phase 3

- Admin login at `/admin/login`, cookie-based session, `/admin/*` redirects there if
  you're signed out
- Orders board at `/admin` — New / Preparing / Out for delivery / Delivered columns,
  big buttons to advance an order, tap-to-call and tap-for-WhatsApp on the customer's
  phone number, paid/unpaid toggle
- New orders are picked up automatically (polling every ~17s) with a chime (synthesized,
  no audio file) and a badge on the Board tab
- Today view at `/admin/today` — orders due today (ASAP orders placed today, or orders
  scheduled for today), in time order
- Manual order entry at `/admin/orders/new`, for phone/WhatsApp orders
- Layout is tuned for a tablet in both orientations (columns scroll horizontally with
  snap points so 1–2 fit on screen in portrait, more in landscape)

### What's in Phase 4

- Customers at `/admin/customers` — name, phone (tap-to-call/WhatsApp), distinct
  delivery addresses, order count, total spent
- Sales summary at `/admin/sales` — today / this week / this month revenue, order
  count, and quantity sold per product (so you know how many coconuts to buy), using
  Jamaica-local day/week/month boundaries
- Products at `/admin/products` — edit name/description/price inline, upload a new
  photo (JPEG/PNG/WebP, 5 MB max), and the "Sold out today" switch from Phase 2's
  greyed-out state now lives here. It's a plain manual toggle, not an automatic daily
  reset — flip it back on when you restock
- Delivery areas at `/admin/areas` — add new areas, edit name/fee inline, and
  deactivate areas instead of deleting them (keeps historical orders intact; a
  deactivated area disappears from the customer checkout dropdown)

### What's in Phase 5

- **PWA**: installable — "Add to Home Screen" on a phone or tablet gives it an app icon
  and a standalone window (no browser chrome). Manifest + icons live in `web/public/pwa`;
  the service worker (via `vite-plugin-pwa`) precaches the built app shell and caches
  product photos/fonts, but never caches `/api/*` — orders and the admin board always
  hit the network. The service worker only runs in a production build (`npm run build`
  + serve `dist/`), not in `npm run dev`.
- **Security fix**: looking up an order by number now also requires the phone number it
  was placed under (`GET /api/orders/{orderNumber}?phone=...`) — order numbers are
  sequential (`KF-00001`, `KF-00002`, ...), so without this anyone could have paged
  through every customer's name, address and phone number. The confirmation page passes
  this automatically from the phone it already remembers in `localStorage`.
- **Bug fix**: the orders board used to drop any order older than 2 days regardless of
  status — an order stuck in New/Preparing could silently vanish from view. Now only
  Delivered orders are subject to that cutoff.
- **Bug fix**: product photo URLs are resolved against the API's own origin
  (`resolveMediaUrl` in `web/src/api/client.ts`), so photos still load correctly if you
  deploy the web app and API to different origins (see `DEPLOYMENT.md` Option A).
- A catch-all 404 page for unmatched routes.
- [DEPLOYMENT.md](DEPLOYMENT.md) — two low-cost hosting paths (a managed platform like
  Render, or a cheap VPS with Caddy), plus a pre-launch checklist.

## Configuration

Business details (name, tagline, WhatsApp number, currency) live in `api/appsettings.json`
under `Business`, not hardcoded in source — update them there (or via environment
variables / user secrets) rather than editing code. The web app fetches this from
`GET /api/config` at load time.

## Phases

1. ✅ Project setup, database models, product + area seed data, API endpoints
2. ✅ Customer ordering page + WhatsApp hand-off
3. ✅ Admin login + orders board
4. ✅ Customers, sales summary, products/areas management
5. ✅ PWA setup, polish, and a deployment guide for a low-cost host
