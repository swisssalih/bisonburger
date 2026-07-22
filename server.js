require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

const MENU_PATH = path.join(__dirname, 'data', 'menu.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');
const CONTACT_PATH = path.join(__dirname, 'data', 'contact-messages.json');
const ADMIN_PAGE_PATH = path.join(__dirname, 'views', 'admin.html');

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

app.get('/api/menu', async (req, res, next) => {
  try {
    const menu = await readJson(MENU_PATH, { categories: [] });
    res.json(menu);
  } catch (err) {
    next(err);
  }
});

app.get('/api/orders', requireAdmin, async (req, res, next) => {
  try {
    const orders = await readJson(ORDERS_PATH, []);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

app.post('/api/orders', async (req, res, next) => {
  try {
    const { customer, items } = req.body || {};

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

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      id: Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      customer,
      items,
      total: Math.round(total * 100) / 100
    };

    const orders = await readJson(ORDERS_PATH, []);
    orders.push(order);
    await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

app.get('/api/contact-messages', requireAdmin, async (req, res, next) => {
  try {
    const messages = await readJson(CONTACT_PATH, []);
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    const entry = {
      id: Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      name,
      email,
      message
    };

    const messages = await readJson(CONTACT_PATH, []);
    messages.push(entry);
    await fs.writeFile(CONTACT_PATH, JSON.stringify(messages, null, 2));

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

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
