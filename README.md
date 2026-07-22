# Bison Burger

Marketing site + ordering flow for Bison Burger (Switzerland). Single-page
site with EN/DE language toggle, a cart, a delivery checkout form (with a
live address map), an About/Contact section, and a footer.

This branch (`feature/nodejs-express-revamp`) moves the project from a
static HTML file opened directly in a browser to a small Node.js/Express
app backed by SQLite, with a from-scratch light/warm redesign (see
"Design" below).

## What changed

- **Node.js + Express backend** (`server.js`) serves the site and exposes:
  - `GET /api/menu` — reads `data/menu.json` and returns the full menu.
  - `POST /api/orders` — validates a checkout payload, computes the total
    server-side, upserts the customer and stores the order in SQLite.
  - `GET /api/orders` — lists placed orders. **Requires admin auth.**
  - `GET /api/orders/stream` — Server-Sent Events feed that pushes a
    `new-order` event the instant an order comes in. **Requires admin
    auth.**
  - `GET /api/geocode?address=...` — proxies OpenStreetMap Nominatim so
    the checkout map can show where an address actually is.
  - `POST /api/contact` / `GET /api/contact-messages` — same pattern for
    the contact form (the GET requires admin auth).
- **Real database.** `db.js` uses Node's built-in `node:sqlite` module
  (no native build step, no extra dependency) against
  `data/bisonburger.db`, with `customers` and `orders` tables (customers
  are upserted by phone number, so repeat orders update the same row) and
  a `contact_messages` table. Replaces the earlier JSON-file storage.
- **Live order notifications.** Placing an order broadcasts over SSE to
  anyone with `/admin` open — the new order appears instantly, the row
  flashes, the browser tab title changes, and a short beep plays (Web
  Audio, no audio file needed). No external notification service
  required; the tradeoff is that `/admin` needs to be open on some
  screen for the "instant" part — orders themselves are always saved
  regardless.
- **Address map on checkout.** Typing a delivery address (debounced)
  geocodes it via `/api/geocode` and drops a pin on a Leaflet/OpenStreetMap
  map right in the cart modal, so the customer can visually confirm it
  before ordering. The resolved lat/lon is stored with the order, and the
  admin page links straight to it on OpenStreetMap.
- **Menu is now data-driven.** `data/menu.json` is the single source of
  truth for every burger, snack and drink; `public/js/menu.js` fetches
  `/api/menu` and renders it.
- **Snacks & Drinks are orderable**, and **About/Contact/footer** sections
  exist now (the nav used to link to `#about`/`#contact` with nothing
  there) — both fully translated EN/DE, Contact has a working form.
- **Code split out of the single HTML file:**
  - `public/css/style.css` — all styles.
  - `public/js/main.js` — language switching, account/login (still
    client-side/localStorage — see Known limitations), cart, checkout,
    contact form.
  - `public/js/menu.js` — fetches and renders the menu.
  - `public/js/map.js` — checkout address geocoding + Leaflet map.

### Design

Full visual redesign — the previous dark/hybrid look is gone. Warm ivory
background, deep-charcoal ink text, a single red-orange accent, soft
shadows and generous rounding throughout. The hero keeps a photo
background (with a warm gradient overlay, not flat black) since that
contrast is expected for a food hero; the footer is a dark charcoal band
to bookend the page. Everything in between — menu, about, contact,
modals — is light.

## Project structure

```
server.js              Express server + API routes
db.js                   SQLite schema + data access (node:sqlite)
package.json
.env.example            Copy to .env to set PORT / admin credentials
data/
  menu.json              Menu content (source of truth for /api/menu)
  bisonburger.db          SQLite database (gitignored, created at runtime)
views/
  admin.html              Live orders/messages viewer, served at /admin (auth-protected)
public/                 Everything served to the browser
  index.html
  css/style.css
  js/main.js              Language/account/cart/checkout/contact logic
  js/menu.js              Fetches /api/menu and renders menu cards
  js/map.js               Checkout address geocoding + Leaflet map
  images/
```

`menu_page.html` and `category_files/` at the repo root are **not** part
of the site — they're a browser "Save As" snapshot of Just Eat's
restaurant-partner pages, kept around as scraping reference material.
They aren't served by `server.js` and can be deleted once they're no
longer needed for that purpose.

## Running it

Requires **Node.js 22.5+** (uses the built-in `node:sqlite` module —
tested on Node 24).

```bash
npm install
cp .env.example .env    # then edit ADMIN_USER / ADMIN_PASSWORD
npm start                # http://localhost:3000
```

`npm run dev` uses `node --watch` to restart on file changes.

## Admin access

`GET /api/orders`, `GET /api/orders/stream`, `GET /api/contact-messages`
and `/admin` are protected with HTTP Basic Auth, credentials from
`ADMIN_USER` / `ADMIN_PASSWORD` env vars (defaults to `admin` / `changeme`
if unset — **the server logs a warning on startup if you're still using
the default password**).

Visit `http://localhost:3000/admin`, log in, and leave the tab open on a
till/tablet/laptop in the kitchen — new orders will pop in live with a
sound, no polling or refreshing needed.

## Known limitations / good next steps

- **Accounts are fake.** Login/register still stores plaintext passwords
  in `localStorage` on the client (unchanged from before) — fine for a
  demo, not for real customer accounts. Needs real backend auth
  (hashed passwords, sessions) before going live.
- **Admin auth is Basic Auth over HTTP.** Fine for localhost/testing;
  put this behind HTTPS before exposing it anywhere public.
- **Order notification depends on `/admin` being open.** If nobody has it
  open, the order still saves to the database, but nobody gets pinged. If
  that turns out to be a problem in practice, adding a Telegram bot or
  email fallback on top of `broadcastNewOrder()` in `server.js` is a small
  addition.
- **Nominatim (the free geocoder) has a soft rate limit** (~1 req/sec) and
  asks for a descriptive `User-Agent`, which `/api/geocode` already sets.
  Fine at this traffic level; if that ever becomes a bottleneck, swap in
  a paid geocoder behind the same endpoint.
- **No payment integration** — checkout only collects delivery details,
  assumes pay-on-delivery.
- **No automated tests yet.**
