const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const PORT = process.env.PORT || 3000;
const MENU_PATH = path.join(__dirname, 'data', 'menu.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');

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

app.get('/api/menu', async (req, res, next) => {
  try {
    const menu = await readJson(MENU_PATH, { categories: [] });
    res.json(menu);
  } catch (err) {
    next(err);
  }
});

app.get('/api/orders', async (req, res, next) => {
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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Bison Burger site running at http://localhost:${PORT}`);
});
