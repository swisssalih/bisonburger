# Bison Burger

Marketing site + ordering flow for Bison Burger (Switzerland). Single-page
site with EN/DE language toggle, a cart, a delivery checkout form, an
About/Contact section, and a footer.

This branch (`feature/nodejs-express-revamp`) moves the project from a
static HTML file opened directly in a browser to a small Node.js/Express
app, without changing the core visual design — aside from a deliberate
follow-up tweak (see "Hybrid theme" below) and the new About/Contact/
footer sections.

## What changed

- **Node.js + Express backend** (`server.js`) serves the site and exposes:
  - `GET /api/menu` — reads `data/menu.json` and returns the full menu.
  - `POST /api/orders` — validates a checkout payload, computes the total
    server-side, and appends the order to `data/orders.json`.
  - `GET /api/orders` — lists placed orders. **Requires admin auth.**
  - `POST /api/contact` — validates and stores a contact form submission
    in `data/contact-messages.json`.
  - `GET /api/contact-messages` — lists contact submissions. **Requires
    admin auth.**
- **Menu is now data-driven.** `data/menu.json` is the single source of
  truth for every burger, snack and drink. `public/js/menu.js` fetches
  `/api/menu` and renders the exact same card/category markup the site
  used to have hardcoded. Previously `menu.json` was an empty stub and the
  "ONLINE MENU" section rendered nothing — that section has been merged
  into "OUR MENU" instead of sitting there duplicated and empty.
- **Checkout is now real.** Placing an order posts to `/api/orders` and
  shows the order number that comes back from the server, instead of just
  clearing `localStorage` and pretending.
- **Snacks & Drinks are orderable.** Those cards had no "Order Now" button
  before (`public/js/menu.js` now renders one, reusing the existing
  `.card a` button style — same look as the burger cards).
- **About, Contact and a footer were added.** The nav already linked to
  `#about` and `#contact` but those sections didn't exist — the links
  went nowhere. Contact includes a working form (posts to `/api/contact`).
  Both sections and the footer are fully translated (EN/DE).
- **A minimal admin page** at `/admin` (also behind admin auth) lists
  placed orders and contact messages in a simple table — see "Admin
  access" below.
- **Code split out of the single HTML file** for maintainability:
  - `public/css/style.css` — all styles.
  - `public/js/main.js` — language switching, account/login (still
    client-side/localStorage — see Known limitations), cart, checkout,
    contact form.
  - `public/js/menu.js` — fetches and renders the menu.
- Small UX additions that don't touch the visual design language: a
  loading state while the menu fetches, a disabled/"Placing order…" state
  on the checkout and contact buttons while a request is in flight, and a
  subtle fade-in on menu cards as they render.

### Hybrid theme

The header and hero keep the original dark, moody look. The content
sections (menu, snacks, drinks, about, contact) were switched to a warm
off-white background with dark text — the all-dark version made the menu
hard to read. The footer stays dark to bookend the page like the header.

## Project structure

```
server.js             Express server + API routes
package.json
.env.example           Copy to .env to set PORT / admin credentials
data/
  menu.json             Menu content (source of truth for /api/menu)
  orders.json           Orders placed through checkout (gitignored, created at runtime)
  contact-messages.json Contact form submissions (gitignored, created at runtime)
views/
  admin.html            Simple orders/messages viewer, served at /admin (auth-protected)
public/                Everything served to the browser
  index.html
  css/style.css
  js/main.js            Language/account/cart/checkout/contact logic
  js/menu.js            Fetches /api/menu and renders menu cards
  images/
```

`menu_page.html` and `category_files/` at the repo root are **not** part
of the site — they're a browser "Save As" snapshot of Just Eat's
restaurant-partner pages, kept around as scraping reference material.
They aren't served by `server.js` and can be deleted once they're no
longer needed for that purpose.

## Running it

```bash
npm install
cp .env.example .env    # then edit ADMIN_USER / ADMIN_PASSWORD
npm start                # http://localhost:3000
```

`npm run dev` uses `node --watch` to restart on file changes.

## Admin access

`GET /api/orders`, `GET /api/contact-messages` and `/admin` are protected
with HTTP Basic Auth, credentials from `ADMIN_USER` / `ADMIN_PASSWORD` env
vars (defaults to `admin` / `changeme` if unset — **the server logs a
warning on startup if you're still using the default password**). Visit
`http://localhost:3000/admin` and log in with those credentials to see
placed orders and contact messages.

## Known limitations / good next steps

- **Accounts are fake.** Login/register still stores plaintext passwords
  in `localStorage` on the client (unchanged from before) — fine for a
  demo, not for real customer accounts. Needs real backend auth
  (hashed passwords, sessions) before going live.
- **Admin auth is Basic Auth over HTTP.** Fine for localhost/testing;
  put this behind HTTPS before exposing it anywhere public.
- **Orders and messages live in JSON files**, not a database — fine for
  low volume, but will need a real datastore (SQLite/Postgres) if volume
  grows.
- **No payment integration** — checkout only collects delivery details,
  assumes pay-on-delivery.
- **No automated tests yet.**
