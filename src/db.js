/**
 * db.js — SQLite database layer via sql.js
 *
 * Schema
 * ──────
 * ingredients      — raw materials / pantry stock
 * products         — finished bakery items for sale
 * orders           — customer orders (header)
 * order_items      — line items per order (detail)
 * order_status_log — full audit trail of status changes
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'cassia.db');
const DATA_DIR  = path.dirname(DB_PATH);

let db;

// ── Order ID generator ───────────────────────────────────────────────────────
// Format: CBS-YYYYMMDD-XXXXXX  (6 random uppercase alphanumeric chars)
function generateOrderId(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const ymd = d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `CBS-${ymd}-${suffix}`;
}

// ── Bootstrap ───────────────────────────────────────────────────────────────

export async function initDB() {
  const SQL = await initSqlJs();

  // Load existing DB file or create fresh
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new SQL.Database();
  }

  createSchema();
  migrateFromJSON();
  persist();

  console.log('SQLite DB ready →', DB_PATH);
  return db;
}

// Persist in-memory DB to disk after every write
function persist() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Schema ──────────────────────────────────────────────────────────────────

function createSchema() {
  db.run(`PRAGMA journal_mode = WAL;`);
  db.run(`PRAGMA foreign_keys = ON;`);

  // ── Ingredients ──────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id            TEXT    PRIMARY KEY,
      name          TEXT    NOT NULL,
      category      TEXT    NOT NULL DEFAULT '',
      quantity      REAL    NOT NULL DEFAULT 0,
      unit          TEXT    NOT NULL DEFAULT '',
      min_stock     REAL    NOT NULL DEFAULT 0,
      cost_per_unit REAL    NOT NULL DEFAULT 0,
      notes         TEXT    NOT NULL DEFAULT '',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ing_category ON ingredients(category);`);

  // ── Finished products ─────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id            TEXT    PRIMARY KEY,
      name          TEXT    NOT NULL,
      category      TEXT    NOT NULL DEFAULT '',
      quantity      REAL    NOT NULL DEFAULT 0,
      unit          TEXT    NOT NULL DEFAULT '',
      min_stock     REAL    NOT NULL DEFAULT 0,
      price         REAL    NOT NULL DEFAULT 0,
      notes         TEXT    NOT NULL DEFAULT '',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_prod_category ON products(category);`);

  // ── Orders (header) ───────────────────────────────────────────────────────
  // Migrate old INTEGER-PK table to TEXT-PK if needed
  const orderCols = db.exec(`PRAGMA table_info(orders)`);
  const oldIntPK = orderCols.length &&
    orderCols[0].values.some(r => r[1] === 'id' && r[2] === 'INTEGER');
  if (oldIntPK) {
    db.run(`ALTER TABLE orders RENAME TO orders_old`);
    db.run(`ALTER TABLE order_items RENAME TO order_items_old`);
    db.run(`ALTER TABLE order_status_log RENAME TO order_status_log_old`);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT    PRIMARY KEY,
      first_name    TEXT    NOT NULL,
      last_name     TEXT    NOT NULL,
      email         TEXT    NOT NULL,
      mobile        TEXT    NOT NULL DEFAULT '',
      pickup_date   TEXT    NOT NULL,
      notes         TEXT    NOT NULL DEFAULT '',
      payment_id    TEXT    NOT NULL DEFAULT '',
      amount_paid   REAL    NOT NULL DEFAULT 0,
      status        TEXT    NOT NULL DEFAULT 'pending'
                            CHECK(status IN ('pending','confirmed','ready','completed','cancelled')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_email       ON orders(email);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_pickup_date ON orders(pickup_date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);`);

  // ── Order items (detail) ──────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   TEXT    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_name  TEXT    NOT NULL,
      price      TEXT    NOT NULL DEFAULT '',
      quantity   INTEGER NOT NULL DEFAULT 1
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`);

  // Copy old orders with generated IDs if migration happened
  if (oldIntPK) {
    try {
      const old = db.exec(`SELECT * FROM orders_old`);
      if (old.length) {
        const { columns, values } = old[0];
        values.forEach(row => {
          const o = Object.fromEntries(columns.map((c, i) => [c, row[i]]));
          const newId = generateOrderId(o.created_at);
          db.run(`INSERT OR IGNORE INTO orders (id,first_name,last_name,email,mobile,pickup_date,notes,payment_id,amount_paid,status,created_at,updated_at)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [newId, o.first_name||'', o.last_name||'', o.email||'', o.mobile||'',
             o.pickup_date||'', o.notes||'', o.payment_id||'', o.amount_paid||0,
             o.status||'pending', o.created_at||'', o.updated_at||'']);
          // migrate items
          const items = db.exec(`SELECT * FROM order_items_old WHERE order_id=?`, [o.id]);
          if (items.length) {
            items[0].values.forEach(irow => {
              db.run(`INSERT INTO order_items (order_id,item_name,price,quantity) VALUES (?,?,?,?)`,
                [newId, irow[2]||'', irow[3]||'', irow[4]||1]);
            });
          }
        });
      }
      db.run(`DROP TABLE IF EXISTS orders_old`);
      db.run(`DROP TABLE IF EXISTS order_items_old`);
      db.run(`DROP TABLE IF EXISTS order_status_log_old`);
      console.log('Migrated orders to TEXT primary key');
    } catch (e) { console.warn('Order migration warning:', e.message); }
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      first_name    TEXT    NOT NULL,
      last_name     TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      mobile        TEXT    NOT NULL DEFAULT '',
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);

  // Add mobile to orders if upgrading from older schema
  try { db.run(`ALTER TABLE orders ADD COLUMN mobile TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  // Add username to users if upgrading from older schema
  try { db.run(`ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username != ''`); } catch (_) {}
  // Add extra_emails to campaigns if upgrading from older schema
  try { db.run(`ALTER TABLE campaigns ADD COLUMN extra_emails TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}
  // Add excluded_emails to campaigns if upgrading from older schema
  try { db.run(`ALTER TABLE campaigns ADD COLUMN excluded_emails TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}

  // ── Order status audit log ────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS order_status_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      old_status TEXT    NOT NULL DEFAULT '',
      new_status TEXT    NOT NULL,
      changed_at TEXT    NOT NULL DEFAULT (datetime('now')),
      note       TEXT    NOT NULL DEFAULT ''
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_status_log_order ON order_status_log(order_id);`);

  // ── Campaigns ─────────────────────────────────────────────────────────────
  // ── Site Promos ───────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS site_promos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      subtitle   TEXT    NOT NULL DEFAULT '',
      badge      TEXT    NOT NULL DEFAULT '',
      cta_label  TEXT    NOT NULL DEFAULT 'Shop Now',
      bg         TEXT    NOT NULL DEFAULT 'brown',
      starts_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      days       INTEGER NOT NULL DEFAULT 7,
      active     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Campaigns ─────────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      subject         TEXT    NOT NULL,
      body_html       TEXT    NOT NULL,
      audience        TEXT    NOT NULL DEFAULT 'all',
      status          TEXT    NOT NULL DEFAULT 'draft'
                              CHECK(status IN ('draft','sent')),
      recipient_count INTEGER NOT NULL DEFAULT 0,
      sent_at         TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_recipients (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      email       TEXT    NOT NULL,
      first_name  TEXT    NOT NULL DEFAULT '',
      sent_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      status      TEXT    NOT NULL DEFAULT 'sent' CHECK(status IN ('sent','failed'))
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cr_campaign ON campaign_recipients(campaign_id);`);
}

// ── Migrate existing JSON → SQLite (runs once; skips if data exists) ────────

function migrateFromJSON() {
  const invFile    = path.join(DATA_DIR, 'inventory.json');
  const ordersFile = path.join(DATA_DIR, 'orders.json');

  // Ingredients
  const ingCount = db.exec(`SELECT COUNT(*) FROM ingredients`)[0].values[0][0];
  if (ingCount === 0 && fs.existsSync(invFile)) {
    try {
      const { ingredients = [] } = JSON.parse(fs.readFileSync(invFile, 'utf-8'));
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO ingredients (id,name,category,quantity,unit,min_stock,cost_per_unit,notes)
        VALUES (?,?,?,?,?,?,?,?)
      `);
      ingredients.forEach(i =>
        stmt.run([i.id, i.name, i.category||'', i.quantity||0, i.unit||'', i.minStock||0, i.costPerUnit||0, i.notes||''])
      );
      stmt.free();
      console.log(`Migrated ${ingredients.length} ingredients`);
    } catch (e) { console.warn('Ingredient migration skipped:', e.message); }
  }

  // Products
  const prodCount = db.exec(`SELECT COUNT(*) FROM products`)[0].values[0][0];
  if (prodCount === 0 && fs.existsSync(invFile)) {
    try {
      const { products = [] } = JSON.parse(fs.readFileSync(invFile, 'utf-8'));
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO products (id,name,category,quantity,unit,min_stock,price,notes)
        VALUES (?,?,?,?,?,?,?,?)
      `);
      products.forEach(p =>
        stmt.run([p.id, p.name, p.category||'', p.quantity||0, p.unit||'', p.minStock||0, p.price||0, p.notes||''])
      );
      stmt.free();
      console.log(`Migrated ${products.length} products`);
    } catch (e) { console.warn('Product migration skipped:', e.message); }
  }

  // Orders
  const orderCount = db.exec(`SELECT COUNT(*) FROM orders`)[0].values[0][0];
  if (orderCount === 0 && fs.existsSync(ordersFile)) {
    try {
      const rawOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
      const orderStmt = db.prepare(`
        INSERT INTO orders (first_name,last_name,email,pickup_date,notes,payment_id,amount_paid,status,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `);
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id,item_name,price,quantity) VALUES (?,?,?,?)
      `);
      rawOrders.forEach(o => {
        const ts = o.timestamp || new Date().toISOString();
        orderStmt.run([
          o.firstName||'', o.lastName||'', o.email||'',
          o.pickupDate||'', o.notes||'', o.paymentId||'',
          o.amount||0, 'completed', ts, ts
        ]);
        const orderId = db.exec(`SELECT last_insert_rowid()`)[0].values[0][0];
        const items = Array.isArray(o.cartItems) && o.cartItems.length
          ? o.cartItems
          : [{ name: o.item || 'Unknown', price: '' }];
        items.forEach(i => itemStmt.run([orderId, i.name||'', i.price||'', 1]));
      });
      orderStmt.free();
      itemStmt.free();
      console.log(`Migrated ${rawOrders.length} orders`);
    } catch (e) { console.warn('Order migration skipped:', e.message); }
  }

  persist();
}

// ── Inventory CRUD ──────────────────────────────────────────────────────────

function rowsToObjects(res) {
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );
}

export function getInventory() {
  const ingredients = rowsToObjects(db.exec(`
    SELECT id, name, category, quantity, unit,
           min_stock AS minStock, cost_per_unit AS costPerUnit, notes
    FROM ingredients ORDER BY category, name
  `));
  const products = rowsToObjects(db.exec(`
    SELECT id, name, category, quantity, unit,
           min_stock AS minStock, price, notes
    FROM products ORDER BY category, name
  `));
  return { ingredients, products };
}

export function addInventoryItem(type, item) {
  const id = `${type.slice(0,3)}_${Date.now()}`;
  if (type === 'ingredients') {
    db.run(`
      INSERT INTO ingredients (id,name,category,quantity,unit,min_stock,cost_per_unit,notes)
      VALUES (?,?,?,?,?,?,?,?)`,
      [id, item.name, item.category||'', item.quantity||0, item.unit||'',
       item.minStock||0, item.costPerUnit||0, item.notes||'']
    );
  } else {
    db.run(`
      INSERT INTO products (id,name,category,quantity,unit,min_stock,price,notes)
      VALUES (?,?,?,?,?,?,?,?)`,
      [id, item.name, item.category||'', item.quantity||0, item.unit||'',
       item.minStock||0, item.price||0, item.notes||'']
    );
  }
  persist();
  return { ...item, id };
}

export function updateInventoryItem(type, id, item) {
  const table = type === 'ingredients' ? 'ingredients' : 'products';
  if (type === 'ingredients') {
    db.run(`
      UPDATE ingredients SET
        name=?, category=?, quantity=?, unit=?,
        min_stock=?, cost_per_unit=?, notes=?, updated_at=datetime('now')
      WHERE id=?`,
      [item.name, item.category||'', item.quantity||0, item.unit||'',
       item.minStock||0, item.costPerUnit||0, item.notes||'', id]
    );
  } else {
    db.run(`
      UPDATE products SET
        name=?, category=?, quantity=?, unit=?,
        min_stock=?, price=?, notes=?, updated_at=datetime('now')
      WHERE id=?`,
      [item.name, item.category||'', item.quantity||0, item.unit||'',
       item.minStock||0, item.price||0, item.notes||'', id]
    );
  }
  persist();
  return rowsToObjects(db.exec(`SELECT * FROM ${table} WHERE id=?`, [id]))[0];
}

export function deleteInventoryItem(type, id) {
  const table = type === 'ingredients' ? 'ingredients' : 'products';
  db.run(`DELETE FROM ${table} WHERE id=?`, [id]);
  persist();
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function saveOrder({ firstName, lastName, email, mobile, pickupDate, notes,
                            cartItems, item, paymentId, amount }) {
  const orderId = generateOrderId();
  db.run(`
    INSERT INTO orders (id,first_name,last_name,email,mobile,pickup_date,notes,payment_id,amount_paid,status)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [orderId, firstName, lastName, email, mobile||'', pickupDate, notes||'', paymentId||'', amount||0, 'pending']
  );

  const items = Array.isArray(cartItems) && cartItems.length
    ? cartItems
    : [{ name: item || 'Not specified', price: '' }];

  const stmt = db.prepare(`INSERT INTO order_items (order_id,item_name,price,quantity) VALUES (?,?,?,?)`);
  items.forEach(i => stmt.run([orderId, i.name||'', i.price||'', 1]));
  stmt.free();

  // Log initial status
  db.run(`INSERT INTO order_status_log (order_id,old_status,new_status,note) VALUES (?,?,?,?)`,
    [orderId, '', 'pending', 'Order placed']);

  persist();
  return orderId;
}

export function getOrders({ status, email, from, to, search } = {}) {
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND o.status=?'; params.push(status); }
  if (email)  { where += ' AND o.email=?';  params.push(email); }
  if (from)   { where += ' AND o.pickup_date>=?'; params.push(from); }
  if (to)     { where += ' AND o.pickup_date<=?'; params.push(to); }
  if (search) {
    const like = `%${search}%`;
    where += ` AND (
      o.id LIKE ?
      OR u.username LIKE ?
      OR EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=o.id AND oi.item_name LIKE ?)
    )`;
    params.push(like, like, like);
  }

  const orders = rowsToObjects(db.exec(`
    SELECT DISTINCT o.id, o.first_name, o.last_name, o.email, o.mobile,
           o.pickup_date, o.notes, o.payment_id, o.amount_paid,
           o.status, o.created_at, o.updated_at, u.username
    FROM orders o
    LEFT JOIN users u ON u.email = o.email
    ${where}
    ORDER BY o.created_at DESC`, params));

  // Attach line items
  orders.forEach(o => {
    o.items = rowsToObjects(db.exec(
      `SELECT item_name AS name, price, quantity FROM order_items WHERE order_id=?`, [o.id]
    ));
  });
  return orders;
}

export function getOrdersByEmail(email) {
  const orders = rowsToObjects(db.exec(`
    SELECT o.id, o.first_name, o.last_name, o.email, o.mobile,
           o.pickup_date, o.notes, o.status, o.created_at, o.updated_at
    FROM orders o
    WHERE LOWER(o.email) = LOWER(?)
    ORDER BY o.created_at DESC`, [email]));
  orders.forEach(o => {
    o.items = rowsToObjects(db.exec(
      `SELECT item_name AS name, price, quantity FROM order_items WHERE order_id=?`, [o.id]
    ));
  });
  return orders;
}

export function deleteOrder(id) {
  const rows = rowsToObjects(db.exec(`SELECT id FROM orders WHERE id=?`, [id]));
  if (!rows.length) throw new Error('Order not found');
  db.run(`DELETE FROM order_items WHERE order_id=?`, [id]);
  db.run(`DELETE FROM order_status_log WHERE order_id=?`, [id]);
  db.run(`DELETE FROM orders WHERE id=?`, [id]);
  persist();
}

export function getOrderById(id) {
  const rows = rowsToObjects(db.exec(`
    SELECT o.id, o.first_name, o.last_name, o.email, o.mobile,
           o.pickup_date, o.notes, o.payment_id, o.amount_paid,
           o.status, o.created_at, o.updated_at
    FROM orders o WHERE o.id=?`, [id]));
  if (!rows.length) return null;
  const o = rows[0];
  o.items = rowsToObjects(db.exec(
    `SELECT item_name AS name, price, quantity FROM order_items WHERE order_id=?`, [id]
  ));
  o.statusLog = rowsToObjects(db.exec(
    `SELECT old_status, new_status, changed_at, note FROM order_status_log WHERE order_id=? ORDER BY changed_at`, [id]
  ));
  return o;
}

export function updateOrderStatus(orderId, newStatus, note = '') {
  const cur = rowsToObjects(db.exec(`SELECT status FROM orders WHERE id=?`, [orderId]));
  if (!cur.length) throw new Error('Order not found');
  const oldStatus = cur[0].status;
  db.run(`UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?`, [newStatus, orderId]);
  db.run(`INSERT INTO order_status_log (order_id,old_status,new_status,note) VALUES (?,?,?,?)`,
    [orderId, oldStatus, newStatus, note]);
  persist();
}

export function getOrderStatusLog(orderId) {
  return rowsToObjects(db.exec(
    `SELECT old_status, new_status, changed_at, note FROM order_status_log WHERE order_id=? ORDER BY changed_at`,
    [orderId]
  ));
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function createUser({ username, firstName, lastName, email, mobile, passwordHash }) {
  db.run(
    `INSERT INTO users (username, first_name, last_name, email, mobile, password_hash) VALUES (?,?,?,?,?,?)`,
    [username, firstName, lastName, email, mobile || '', passwordHash]
  );
  persist();
  return getUserByEmail(email);
}

export function getUserByEmail(email) {
  const rows = rowsToObjects(db.exec(
    `SELECT id, username, first_name AS firstName, last_name AS lastName, email, mobile, password_hash AS passwordHash FROM users WHERE email=?`,
    [email]
  ));
  return rows[0] || null;
}

export function getUserByUsername(username) {
  const rows = rowsToObjects(db.exec(
    `SELECT id, username, first_name AS firstName, last_name AS lastName, email, mobile, password_hash AS passwordHash FROM users WHERE username=?`,
    [username]
  ));
  return rows[0] || null;
}

// ── Campaigns ────────────────────────────────────────────────────────────────

export function getCampaigns() {
  return rowsToObjects(db.exec(
    `SELECT id, title, subject, audience, extra_emails, status, recipient_count, sent_at, created_at
     FROM campaigns ORDER BY created_at DESC`
  )).map(c => {
    try {
      const arr = JSON.parse(c.extra_emails || '[]');
      c.extra_email_count = Array.isArray(arr) ? arr.length : 0;
    } catch { c.extra_email_count = 0; }
    delete c.extra_emails;
    return c;
  });
}

export function getCampaignById(id) {
  const rows = rowsToObjects(db.exec(
    `SELECT id, title, subject, body_html, audience, extra_emails, excluded_emails, status, recipient_count, sent_at, created_at
     FROM campaigns WHERE id=?`, [id]
  ));
  if (!rows.length) return null;
  const c = rows[0];
  try { c.extra_emails    = JSON.parse(c.extra_emails    || '[]'); } catch { c.extra_emails    = []; }
  try { c.excluded_emails = JSON.parse(c.excluded_emails || '[]'); } catch { c.excluded_emails = []; }
  c.recipients = rowsToObjects(db.exec(
    `SELECT email, first_name, status, sent_at FROM campaign_recipients WHERE campaign_id=? ORDER BY sent_at`,
    [id]
  ));
  return c;
}

export function createCampaign({ title, subject, body_html, audience, extra_emails = [], excluded_emails = [] }) {
  db.run(
    `INSERT INTO campaigns (title, subject, body_html, audience, extra_emails, excluded_emails) VALUES (?,?,?,?,?,?)`,
    [title, subject, body_html, audience, JSON.stringify(extra_emails), JSON.stringify(excluded_emails)]
  );
  const row = rowsToObjects(db.exec(`SELECT last_insert_rowid() AS id`))[0];
  persist();
  return row.id;
}

export function updateCampaign(id, { title, subject, body_html, audience, extra_emails = [], excluded_emails = [] }) {
  db.run(
    `UPDATE campaigns SET title=?, subject=?, body_html=?, audience=?, extra_emails=?, excluded_emails=?, updated_at=datetime('now') WHERE id=? AND status='draft'`,
    [title, subject, body_html, audience, JSON.stringify(extra_emails), JSON.stringify(excluded_emails), id]
  );
  persist();
}

export function deleteCampaign(id) {
  db.run(`DELETE FROM campaign_recipients WHERE campaign_id=?`, [id]);
  db.run(`DELETE FROM campaigns WHERE id=?`, [id]);
  persist();
}

export function markCampaignSent(id, recipients) {
  for (const r of recipients) {
    db.run(
      `INSERT INTO campaign_recipients (campaign_id, email, first_name, status) VALUES (?,?,?,?)`,
      [id, r.email, r.first_name, r.status]
    );
  }
  const sent = recipients.filter(r => r.status === 'sent').length;
  db.run(
    `UPDATE campaigns SET status='sent', sent_at=datetime('now'), recipient_count=?, updated_at=datetime('now') WHERE id=?`,
    [sent, id]
  );
  persist();
}

// ── Site Promos ──────────────────────────────────────────────────────────────

export function getPromos() {
  return rowsToObjects(db.exec(
    `SELECT id, title, subtitle, badge, cta_label, bg, starts_at, days, active, created_at
     FROM site_promos ORDER BY created_at DESC`
  ));
}

export function getActivePromo() {
  // Returns the one active promo that is within its visibility window
  const rows = rowsToObjects(db.exec(
    `SELECT id, title, subtitle, badge, cta_label, bg, starts_at, days, active
     FROM site_promos
     WHERE active = 1
       AND datetime('now') >= datetime(starts_at)
       AND datetime('now') <= datetime(starts_at, '+' || days || ' days')
     LIMIT 1`
  ));
  return rows[0] || null;
}

export function createPromo({ title, subtitle, badge, cta_label, bg, starts_at, days }) {
  db.run(
    `INSERT INTO site_promos (title, subtitle, badge, cta_label, bg, starts_at, days)
     VALUES (?,?,?,?,?,?,?)`,
    [title, subtitle, badge, cta_label, bg, starts_at, days]
  );
  const row = rowsToObjects(db.exec(`SELECT last_insert_rowid() AS id`))[0];
  persist();
  return row.id;
}

export function updatePromo(id, { title, subtitle, badge, cta_label, bg, starts_at, days }) {
  db.run(
    `UPDATE site_promos SET title=?, subtitle=?, badge=?, cta_label=?, bg=?, starts_at=?, days=?
     WHERE id=?`,
    [title, subtitle, badge, cta_label, bg, starts_at, days, id]
  );
  persist();
}

export function activatePromo(id) {
  db.run(`UPDATE site_promos SET active = 0`);           // deactivate all
  db.run(`UPDATE site_promos SET active = 1 WHERE id=?`, [id]);
  persist();
}

export function deactivatePromo(id) {
  db.run(`UPDATE site_promos SET active = 0 WHERE id=?`, [id]);
  persist();
}

export function deletePromo(id) {
  db.run(`DELETE FROM site_promos WHERE id=?`, [id]);
  persist();
}

export function resolveCampaignAudience(audience) {
  let sql;
  if (audience === 'all') {
    sql = `SELECT DISTINCT email, first_name FROM orders WHERE email != '' ORDER BY email`;
  } else if (audience === 'repeat') {
    sql = `SELECT email, first_name FROM orders WHERE email != ''
           GROUP BY email HAVING COUNT(*) > 1 ORDER BY email`;
  } else if (audience === 'completed') {
    sql = `SELECT DISTINCT email, first_name FROM orders WHERE status='completed' AND email != '' ORDER BY email`;
  } else if (audience === 'pending') {
    sql = `SELECT DISTINCT email, first_name FROM orders WHERE status IN ('pending','confirmed','ready') AND email != '' ORDER BY email`;
  } else {
    return [];
  }
  return rowsToObjects(db.exec(sql));
}
