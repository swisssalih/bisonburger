# Bison Burger

Marketing site + ordering flow for Bison Burger (Switzerland). Single-page
site with EN/DE language toggle, a cart, and a delivery checkout form.

This branch (`feature/nodejs-express-revamp`) moves the project from a
static HTML file opened directly in a browser to a small Node.js/Express
app, without changing how the site looks.

## What changed

- **Node.js + Express backend** (`server.js`) serves the site and exposes:
  - `GET /api/menu` — reads `data/menu.json` and returns the full menu.
  - `POST /api/orders` — validates a checkout payload, computes the total
    server-side, and appends the order to `data/orders.json`.
  - `GET /api/orders` — lists placed orders (no auth yet — see Known
    limitations).
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
- **Code split out of the single HTML file** for maintainability:
  - `public/css/style.css` — all styles (unchanged rules, just moved out
    of the inline `<style>` block).
  - `public/js/main.js` — language switching, account/login (still
    client-side/localStorage — see Known limitations), cart, checkout.
  - `public/js/menu.js` — fetches and renders the menu.
- Small UX additions that don't touch the visual design language: a
  loading state while the menu fetches, a disabled/"Placing order…" state
  on the checkout button while the request is in flight, and a subtle
  fade-in on menu cards as they render.

Nothing about the page's layout, colors, fonts, or copy changed — the
menu data was extracted 1:1 from what used to be hardcoded in the HTML.

## Project structure

```
server.js            Express server + API routes
package.json
data/
  menu.json           Menu content (source of truth for /api/menu)
  orders.json          Orders placed through checkout (gitignored, created at runtime)
public/               Everything served to the browser
  index.html
  css/style.css
  js/main.js           Language/account/cart/checkout logic
  js/menu.js           Fetches /api/menu and renders menu cards
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
npm start        # http://localhost:3000
```

`npm run dev` uses `node --watch` to restart on file changes.

## Known limitations / good next steps

- **Accounts are fake.** Login/register still stores plaintext passwords
  in `localStorage` on the client (unchanged from before) — fine for a
  demo, not for real customer accounts. Needs real backend auth
  (hashed passwords, sessions) before going live.
- **`/api/orders` has no auth.** Anyone can read all placed orders. Add
  an admin login before exposing this beyond localhost.
- **Orders live in a JSON file**, not a database — fine for low volume,
  but will need a real datastore (SQLite/Postgres) if order volume grows.
- **No automated tests yet.**
