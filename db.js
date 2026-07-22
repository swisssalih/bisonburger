const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'bisonburger.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    address TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    lat REAL,
    lon REAL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const ORDER_STATUSES = ['new', 'preparing', 'sent', 'delivered'];

function upsertCustomer({ name, phone, address }) {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);

  if (existing) {
    db.prepare('UPDATE customers SET name = ?, address = ?, updated_at = ? WHERE id = ?')
      .run(name, address, now, existing.id);
    return existing.id;
  }

  const result = db
    .prepare('INSERT INTO customers (name, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(name, phone, address, now, now);
  return Number(result.lastInsertRowid);
}

function insertOrder({ id, customerId, address, notes, lat, lon, items, total }) {
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO orders (id, customer_id, address, notes, lat, lon, items, total, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(id, customerId, address, notes || null, lat ?? null, lon ?? null, JSON.stringify(items), total, createdAt);
  return createdAt;
}

function listOrders() {
  const rows = db.prepare(`
    SELECT o.id, o.address, o.notes, o.lat, o.lon, o.items, o.total, o.status, o.created_at,
           c.name AS customer_name, c.phone AS customer_phone
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ORDER BY o.created_at DESC
  `).all();

  return rows.map(row => ({
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    total: row.total,
    items: JSON.parse(row.items),
    customer: { name: row.customer_name, phone: row.customer_phone, address: row.address, notes: row.notes },
    location: row.lat != null && row.lon != null ? { lat: row.lat, lon: row.lon } : null
  }));
}

function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}

function getOrderTrackingInfo(id) {
  const row = db.prepare('SELECT id, status, total, created_at FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  return { id: row.id, status: row.status, total: row.total, createdAt: row.created_at };
}

function insertContactMessage({ id, name, email, message }) {
  const createdAt = new Date().toISOString();
  db.prepare('INSERT INTO contact_messages (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email, message, createdAt);
  return createdAt;
}

function listContactMessages() {
  return db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all()
    .map(row => ({ id: row.id, name: row.name, email: row.email, message: row.message, createdAt: row.created_at }));
}

function addRating(itemId, rating) {
  const createdAt = new Date().toISOString();
  db.prepare('INSERT INTO ratings (item_id, rating, created_at) VALUES (?, ?, ?)').run(itemId, rating, createdAt);
  return getRatingSummary(itemId);
}

function getRatingSummary(itemId) {
  const row = db.prepare('SELECT AVG(rating) AS average, COUNT(*) AS count FROM ratings WHERE item_id = ?').get(itemId);
  return {
    itemId,
    average: row.count > 0 ? Math.round(row.average * 10) / 10 : 0,
    count: row.count
  };
}

function getAllRatingSummaries() {
  const rows = db.prepare('SELECT item_id, AVG(rating) AS average, COUNT(*) AS count FROM ratings GROUP BY item_id').all();
  const summary = {};
  for (const row of rows) {
    summary[row.item_id] = { average: Math.round(row.average * 10) / 10, count: row.count };
  }
  return summary;
}

module.exports = {
  ORDER_STATUSES,
  upsertCustomer,
  insertOrder,
  listOrders,
  updateOrderStatus,
  getOrderTrackingInfo,
  insertContactMessage,
  listContactMessages,
  addRating,
  getAllRatingSummaries
};
