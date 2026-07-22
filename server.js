require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const store = require('./db');

const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

const MENU_PATH = path.join(__dirname, 'data', 'menu.json');
const ADMIN_PAGE_PATH = path.join(__dirname, 'views', 'admin.html');
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(String(a || ''));
  const bufB = Buffer.from(String(b || ''));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const [user, password] = Buffer.from(encoded, 'base64').toString().split(':');
    if (timingSafeEqualStr(user, ADMIN_USER) && timingSafeEqualStr(password, ADMIN_PASSWORD)) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Bison Burger Admin"');
  res.status(401).send('Authentication required.');
}

// --- Live order notifications (Server-Sent Events) ---
const sseClients = new Set();
const trackClients = new Map(); // orderId -> Set<res>

function broadcastNewOrder(order) {
  const payload = `event: new-order\ndata: ${JSON.stringify(order)}\n\n`;
  for (const client of sseClients) client.write(payload);
}

function broadcastOrderStatus(orderId, status) {
  const adminPayload = `event: order-status\ndata: ${JSON.stringify({ id: orderId, status })}\n\n`;
  for (const client of sseClients) client.write(adminPayload);

  const trackers = trackClients.get(orderId);
  if (trackers) {
    const trackPayload = `event: status\ndata: ${JSON.stringify({ id: orderId, status })}\n\n`;
    for (const client of trackers) client.write(trackPayload);
  }
}

app.get('/api/orders/stream', requireAdmin, (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();
  res.write(': connected\n\n');

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

app.get('/api/orders/:id/track/stream', (req, res) => {
  const { id } = req.params;
  if (!store.getOrderTrackingInfo(id)) {
    return res.status(404).end();
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();
  res.write(': connected\n\n');

  if (!trackClients.has(id)) trackClients.set(id, new Set());
  trackClients.get(id).add(res);

  req.on('close', () => {
    const set = trackClients.get(id);
    if (set) {
      set.delete(res);
      if (set.size === 0) trackClients.delete(id);
    }
  });
});

// --- Menu ---
app.get('/api/menu', async (req, res, next) => {
  try {
    const menu = await readJson(MENU_PATH, { categories: [] });
    res.json(menu);
  } catch (err) {
    next(err);
  }
});

// --- Geocoding proxy (OpenStreetMap Nominatim) ---
app.get('/api/geocode', async (req, res, next) => {
  try {
    const address = (req.query.address || '').toString().trim();
    if (!address) {
      return res.status(400).json({ error: 'Missing address.' });
    }

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'ch');

    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'BisonBurgerSite/1.0 (checkout address preview)' }
    });

    if (!upstream.ok) throw new Error(`geocoding service responded ${upstream.status}`);
    const results = await upstream.json();

    if (!results.length) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    const { lat, lon, display_name } = results[0];
    res.json({ lat: Number(lat), lon: Number(lon), displayName: display_name });
  } catch (err) {
    next(err);
  }
});

// --- Orders ---
app.get('/api/orders', requireAdmin, (req, res, next) => {
  try {
    res.json(store.listOrders());
  } catch (err) {
    next(err);
  }
});

app.post('/api/orders', (req, res, next) => {
  try {
    const { customer, items, location } = req.body || {};

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Missing delivery details.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }
    for (const item of items) {
      if (typeof item.name !== 'string' || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return res.status(400).json({ error: 'Invalid cart item.' });
      }
    }

    const total = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const id = Date.now().toString(36).toUpperCase();
    const customerId = store.upsertCustomer({
      name: customer.name,
      phone: customer.phone,
      address: customer.address
    });

    const lat = location && typeof location.lat === 'number' ? location.lat : null;
    const lon = location && typeof location.lon === 'number' ? location.lon : null;

    const createdAt = store.insertOrder({
      id,
      customerId,
      address: customer.address,
      notes: customer.notes,
      lat,
      lon,
      items,
      total
    });

    const order = { id, createdAt, customer, items, total, location: lat != null ? { lat, lon } : null };
    broadcastNewOrder(order);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

app.patch('/api/orders/:id/status', requireAdmin, (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!store.ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${store.ORDER_STATUSES.join(', ')}` });
    }

    const updated = store.updateOrderStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'Order not found.' });

    broadcastOrderStatus(id, status);
    res.json({ id, status });
  } catch (err) {
    next(err);
  }
});

// Public order tracking (customers look up their own order by id, no PII exposed)
app.get('/api/orders/:id/track', (req, res, next) => {
  try {
    const info = store.getOrderTrackingInfo(req.params.id);
    if (!info) return res.status(404).json({ error: 'Order not found.' });
    res.json(info);
  } catch (err) {
    next(err);
  }
});

// --- Ratings ---
app.get('/api/ratings', (req, res, next) => {
  try {
    res.json(store.getAllRatingSummaries());
  } catch (err) {
    next(err);
  }
});

app.post('/api/ratings', (req, res, next) => {
  try {
    const { itemId, rating } = req.body || {};
    if (typeof itemId !== 'string' || !itemId) {
      return res.status(400).json({ error: 'Missing itemId.' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer from 1 to 5.' });
    }

    const summary = store.addRating(itemId, rating);
    res.status(201).json(summary);
  } catch (err) {
    next(err);
  }
});

// --- Contact ---
app.get('/api/contact-messages', requireAdmin, (req, res, next) => {
  try {
    res.json(store.listContactMessages());
  } catch (err) {
    next(err);
  }
});

app.post('/api/contact', (req, res, next) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    const id = Date.now().toString(36).toUpperCase();
    const createdAt = store.insertContactMessage({ id, name, email, message });

    res.status(201).json({ id, createdAt, name, email, message });
  } catch (err) {
    next(err);
  }
});

// --- Admin page ---
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(ADMIN_PAGE_PATH);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Bison Burger site running at http://localhost:${PORT}`);
  if (ADMIN_PASSWORD === 'changeme') {
    console.warn('Warning: using the default admin password. Set ADMIN_USER/ADMIN_PASSWORD env vars before deploying.');
  }
});
