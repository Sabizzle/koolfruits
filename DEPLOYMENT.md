# Deploying Kool Fruits

What needs to end up hosted somewhere:

1. The **API** (`/api`) — an ASP.NET Core app, needs a place to run a long-lived process.
2. A **PostgreSQL database** (or just keep SQLite — see the VPS option below; for one
   delivery business's order volume, SQLite is genuinely fine).
3. The **web app** (`/web`) — a static build (`web/dist`) that can be served by any
   static host or CDN.
4. **Persistent storage** for product photos uploaded from `/admin/products` — they're
   saved to disk at `api/wwwroot/product-photos`. If your host wipes the filesystem on
   every deploy, uploaded photos will vanish.

Two reasonable paths, depending on how hands-on you want to be.

## Option A — Managed platform (Render, Railway, or similar)

Least setup, no server maintenance, costs a bit more per month. These steps describe
Render specifically, but Railway/Fly.io follow the same shape.

1. Push this repo to GitHub.
2. **Database**: create a small Postgres instance on Render. Copy its connection string.
3. **API — Web Service**, pointed at the `/api` folder:
   - Build command: `dotnet publish -c Release -o out`
   - Start command: `dotnet out/KoolFruits.Api.dll`
   - Environment variables:
     - `ASPNETCORE_ENVIRONMENT=Production`
     - `Database__Provider=Postgres`
     - `ConnectionStrings__Postgres=<the connection string from step 2>`
     - `Admin__Username` / `Admin__Password` — a real, strong password (not the dev default)
     - `Business__WhatsAppNumber`, `Business__Name`, `Business__Tagline`, `Business__Currency`
       if they differ from `appsettings.json`
     - `Cors__AllowedOrigins__0=https://<your-web-app-url>`
     - `Email__ResendApiKey`, `Email__RecipientAddress` and `GoogleSheets__WebAppUrl`,
       `GoogleSheets__SharedSecret` — order notifications (see README "Order
       notifications"); omit any of these to leave that notification off
   - **Persistent disk**: mount one at `/app/wwwroot/product-photos` so uploaded photos
     survive redeploys. Pick an always-on plan, not a free/sleeping tier — a sleeping
     instance means customers briefly can't place orders until it wakes up.
4. **Web app — Static Site**, pointed at the `/web` folder:
   - Build command: `npm install && npm run build`
   - Publish directory: `web/dist`
   - Environment variable at build time: `VITE_API_BASE_URL=https://<your-api-url>`
     (the static site and API get different URLs on Render, so the frontend needs the
     full API URL instead of relying on relative `/api/...` paths)
   - Add a rewrite rule `/*` → `/index.html` so React Router routes still work on a
     page refresh (e.g. `/admin/today`)
5. In the API's `Cors:AllowedOrigins`, make sure it matches the static site's exact URL
   from step 4. The admin login cookie is set `SameSite=None; Secure` outside
   Development specifically so this cross-origin setup works — it requires HTTPS on
   both sides, which Render provides automatically.
6. (Optional) Point a custom domain at the static site, and another at the API, through
   Render's domain settings.

## Option B — A single cheap VPS (DigitalOcean, Hetzner, Linode, Vultr)

Cheapest long-term, and simpler in one way: serving the web app and API from the same
domain means no cross-origin cookie/CORS complexity at all — it's exactly like the dev
proxy setup. Costs you server maintenance (OS updates, restarts) instead.

1. Provision the smallest Ubuntu box they offer (1 GB RAM is enough for this app).
2. Install the [.NET 10 runtime](https://dotnet.microsoft.com/download) and
   [Caddy](https://caddyserver.com/docs/install) (automatic HTTPS, minimal config).
   You can skip installing Postgres and keep SQLite — it's a single file, backs up by
   copying it, and comfortably handles a small delivery business's order volume. Install
   Postgres instead only if you specifically want it.
3. Build the frontend **on your own machine** (not the server) and copy the result up:
   ```bash
   cd web
   npm install
   npm run build
   scp -r dist/* youruser@your-server:/var/www/koolfruits/
   ```
4. Publish and copy up the API:
   ```bash
   cd api
   dotnet publish -c Release -o out
   scp -r out/* youruser@your-server:/opt/koolfruits-api/
   ```
5. Run the API as a `systemd` service so it restarts on crash or reboot. Create
   `/etc/systemd/system/koolfruits-api.service`:
   ```ini
   [Unit]
   Description=Kool Fruits API
   After=network.target

   [Service]
   WorkingDirectory=/opt/koolfruits-api
   ExecStart=/usr/bin/dotnet /opt/koolfruits-api/KoolFruits.Api.dll
   Restart=always
   RestartSec=5
   Environment=ASPNETCORE_ENVIRONMENT=Production
   Environment=ASPNETCORE_URLS=http://localhost:5258
   Environment=Admin__Username=admin
   Environment=Admin__Password=<a real, strong password>
   Environment=Email__ResendApiKey=<your Resend API key>
   Environment=Email__RecipientAddress=<where order emails should go>
   Environment=GoogleSheets__WebAppUrl=<your Apps Script /exec URL>
   Environment=GoogleSheets__SharedSecret=<the matching secret from the script>
   # Omit Database__Provider to keep SQLite, or set it + ConnectionStrings__Postgres
   # the same way as Option A if you installed Postgres.

   [Install]
   WantedBy=multi-user.target
   ```
   Then: `sudo systemctl enable --now koolfruits-api`
6. Point Caddy at both. `/etc/caddy/Caddyfile`:
   ```
   your-domain.com {
       handle /api/* {
           reverse_proxy localhost:5258
       }
       handle /product-photos/* {
           reverse_proxy localhost:5258
       }
       handle {
           root * /var/www/koolfruits
           try_files {path} /index.html
           file_server
       }
   }
   ```
   `sudo systemctl reload caddy` — Caddy fetches and renews the HTTPS certificate
   automatically.
7. Uploaded product photos land in `/opt/koolfruits-api/wwwroot/product-photos` on the
   server's own disk — already persistent, nothing extra to configure. Note: a future
   `dotnet publish` + `scp` redeploy of the API will overwrite that `wwwroot` folder, so
   either exclude `product-photos` from the copy step or back it up first.
8. Back up `/opt/koolfruits-api/koolfruits.db` (if using SQLite) on a schedule — even a
   daily cron job that copies it to another machine is enough for this scale.

## Which to pick?

- **Option A** if you'd rather pay a bit more monthly than ever touch a Linux terminal.
- **Option B** if you're comfortable with basic server administration and want the
  lowest ongoing cost — and you can skip Postgres entirely by keeping SQLite.

Exact pricing on either platform changes over time — check current plans before
committing, and specifically avoid any "free" tier that sleeps the API when idle, since
that makes the storefront intermittently unreachable for customers.

## Production checklist

- [ ] `Admin:Username` / `Admin:Password` changed to a real, strong password (set via
      environment variables, not committed to `appsettings.json`)
- [ ] `ASPNETCORE_ENVIRONMENT=Production`
- [ ] `Cors:AllowedOrigins` set to your real frontend URL (Option A only — remove
      `localhost:5173`)
- [ ] `Business:WhatsAppNumber` and the other `Business:*` values are your real details
- [ ] HTTPS is active on whatever serves the web app and the API — the admin cookie
      requires it outside Development
- [ ] Product-photo uploads are on storage that survives a redeploy (persistent disk on
      Option A, or just note the `wwwroot` overwrite caveat on Option B)
- [ ] `Email:ResendApiKey` / `Email:RecipientAddress` and `GoogleSheets:WebAppUrl` /
      `GoogleSheets:SharedSecret` are set if you want order notifications in production
      (each pair is independently optional — unset either and that notification just
      stays off)
- [ ] A database backup routine is in place
- [ ] Placed a real test order and logged into `/admin` against the live URLs before
      sharing the site with customers

No manual migration step is needed on deploy — the API applies EF Core migrations and
seeds the database automatically on startup (see `Program.cs`), the same way it does
locally.
