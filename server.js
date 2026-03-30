import express from 'express';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { promisify } from 'util';
import multer from 'multer';
import {
  initDB, getInventory, addInventoryItem,
  updateInventoryItem, deleteInventoryItem,
  saveOrder, getOrders, getOrdersByEmail, getOrderById, deleteOrder, updateOrderStatus, getOrderStatusLog,
  createUser, getUserByEmail, getUserByUsername,
  getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign,
  markCampaignSent, resolveCampaignAudience,
  getPromos, getActivePromo, createPromo, updatePromo, activatePromo, deactivatePromo, deletePromo
} from './src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false // Vite handles CSP on the frontend
}));

// ── CORS — restrict to known origins ───────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3001',
  'https://many-hylozoistic-benevolently.ngrok-free.dev',
  'https://many-hylozoistic-benevolently.ngrok-free.app',
  ...(process.env.PRODUCTION_URL ? [process.env.PRODUCTION_URL] : [])
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// ── Body size limit — prevent large payload attacks ────────────────────────
app.use(express.json({ limit: '16kb' }));

// ── Rate limiting ───────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many orders submitted. Please try again later.' }
});

app.use('/api/', apiLimiter);
app.use('/api/send-order', orderLimiter);

// ── Input sanitiser — strip HTML tags from strings ─────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 1000);
}

// ── Password hashing (Node built-in scrypt) ─────────────────────────────────
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = await scryptAsync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), verify);
}

// ── Auth endpoints ──────────────────────────────────────────────────────────

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const username  = sanitize(req.body.username);
    const firstName = sanitize(req.body.firstName);
    const lastName  = sanitize(req.body.lastName);
    const email     = sanitize(req.body.email);
    const mobile    = sanitize(req.body.mobile || '');
    const password  = typeof req.body.password === 'string' ? req.body.password.slice(0, 128) : '';

    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3–30 characters and contain only letters, numbers or underscores' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (getUserByUsername(username)) {
      return res.status(409).json({ error: 'This username is already taken' });
    }
    if (getUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const user = createUser({ username, firstName, lastName, email, mobile, passwordHash });
    res.json({ success: true, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, mobile: user.mobile } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const username = sanitize(req.body.username);
    const password = typeof req.body.password === 'string' ? req.body.password.slice(0, 128) : '';

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({ success: true, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, mobile: user.mobile } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Email transporter — Zoho Mail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

transporter.verify((err) => {
  if (err) console.error('Email transport error:', err.message);
  else console.log('Email transport ready');
});



// Contact form endpoint
const contactUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  }
}).single('image');

app.post('/api/contact', (req, res) => {
  contactUpload(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message || 'File upload failed.' });
    }
    try {
      const name    = (req.body.name    || '').toString().trim().slice(0, 200);
      const email   = (req.body.email   || '').toString().trim().slice(0, 200);
      const phone   = (req.body.phone   || '').toString().trim().slice(0, 50);
      const message = (req.body.message || '').toString().trim().slice(0, 2000);

      if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email and phone are required.' });
      }

      const mailOpts = {
        from: `"Cassia Contact Form" <${process.env.EMAIL_USER}>`,
        to: 'dechmp@zohomail.in',
        replyTo: email,
        subject: `Contact Form: ${name}`,
        html: `
          <h2 style="font-family:serif;color:#5C3D1E;">New Contact Message</h2>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:520px;">
            <tr><td style="padding:8px 0;color:#888;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>
            ${message ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top;">Message</td><td style="padding:8px 0;">${message.replace(/\n/g,'<br>')}</td></tr>` : ''}
          </table>
          ${req.file ? '<p style="font-family:sans-serif;font-size:13px;color:#888;margin-top:16px;">Image attached.</p>' : ''}
        `
      };

      if (req.file) {
        mailOpts.attachments = [{
          filename: req.file.originalname || 'image',
          content:  req.file.buffer,
          contentType: req.file.mimetype
        }];
      }

      await transporter.sendMail(mailOpts);
      res.json({ ok: true });
    } catch (err) {
      console.error('Contact email error:', err);
      res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
  });
});

// Email endpoint
app.post('/api/send-order', async (req, res) => {
  try {
    const raw = req.body;

    const firstName  = sanitize(raw.firstName);
    const lastName   = sanitize(raw.lastName);
    const email      = sanitize(raw.email);
    const mobile     = sanitize(raw.mobile || '');
    const item       = sanitize(raw.item);
    const pickupDate = sanitize(raw.pickupDate);
    const notes      = sanitize(raw.notes);
    const paymentId  = sanitize(raw.paymentId);
    const amount     = sanitize(String(raw.amount || ''));
    const cartItems  = Array.isArray(raw.cartItems)
      ? raw.cartItems.slice(0, 50).map(i => ({ name: sanitize(i.name), price: sanitize(i.price) }))
      : [];

    // Validate required fields
    if (!firstName || !lastName || !email || !pickupDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Pickup date must be at least 2 days from today (compare as YYYY-MM-DD strings)
    const _now = new Date();
    const _min = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + 2);
    const _minStr = _min.getFullYear() + '-' + String(_min.getMonth() + 1).padStart(2, '0') + '-' + String(_min.getDate()).padStart(2, '0');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate) || pickupDate < _minStr) {
      return res.status(400).json({ error: 'Pickup date must be at least 2 days from today.' });
    }

    // Build cart summary
    const itemList = Array.isArray(cartItems) && cartItems.length
      ? cartItems
      : [{ name: item || 'Not specified', price: '' }];

    const cartRows = itemList.map(i =>
      `<div class="detail-row"><span class="detail-label">·</span> ${i.name}${i.price ? ` — ${i.price}` : ''}</div>`
    ).join('');

    const cartTotal = itemList.reduce((sum, i) => {
      const n = Number((i.price || '').replace(/[^0-9]/g, ''));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    // HTML email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2c1810; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f5f0; padding: 30px; text-align: center; }
            .content { background: white; padding: 30px; border: 1px solid #e8dcc0; }
            .order-details { background: #faf7f2; padding: 20px; margin: 20px 0; }
            .detail-row { margin: 8px 0; }
            .detail-label { font-weight: bold; color: #8b5e3c; }
            .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #8b5e3c; margin: 16px 0 8px; border-bottom: 1px solid #e8dcc0; padding-bottom: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 13px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;color:#8b5e3c;">New Order — Cassia Bake Studio</h1>
            </div>
            <div class="content">
              <div class="order-details">
                <div class="section-title">Customer</div>
                <div class="detail-row"><span class="detail-label">Name:</span> ${firstName} ${lastName}</div>
                <div class="detail-row"><span class="detail-label">Email:</span> ${email}</div>
                ${mobile ? `<div class="detail-row"><span class="detail-label">Mobile:</span> ${mobile}</div>` : ''}
                <div class="detail-row"><span class="detail-label">Pickup Date:</span> ${pickupDate}</div>
                ${notes ? `<div class="detail-row"><span class="detail-label">Notes:</span> ${notes}</div>` : ''}

                <div class="section-title">Items Ordered</div>
                ${cartRows}
                ${cartTotal > 0 ? `<div class="detail-row" style="margin-top:10px;font-weight:bold;"><span class="detail-label">Total:</span> ₹${cartTotal.toLocaleString('en-IN')}</div>` : ''}

                ${paymentId ? `
                <div class="section-title">Payment</div>
                <div class="detail-row"><span class="detail-label">Payment ID:</span> ${paymentId}</div>
                <div class="detail-row"><span class="detail-label">Amount Paid:</span> ₹${amount}</div>
                <div class="detail-row" style="color:#2e7d32;font-weight:bold;">✓ Payment Confirmed</div>
                ` : ''}
              </div>
              <div class="footer">Cassia Bake Studio · Indiranagar, Bangalore</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dechmp@zohomail.in',
      subject: `New Order from ${firstName} ${lastName} — Cassia Bake Studio`,
      html: htmlTemplate
    };

    // Save order to SQLite DB
    const orderId = saveOrder({ firstName, lastName, email, mobile, item, cartItems, pickupDate, notes, paymentId, amount });

    // Include order ID in email subject and body
    mailOptions.subject = `[${orderId}] New Order from ${firstName} ${lastName} — Cassia Bake Studio`;

    // Attempt email — order is already saved even if this fails
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Email error (order saved to file):', emailErr.message);
    }

    res.json({ success: true, message: 'Order request sent successfully!' });

  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// ── Razorpay ───────────────────────────────────────────────────────────────────

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay order error:', err.message);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── Inventory ──────────────────────────────────────────────────────────────────

// ── Inventory endpoints (backed by SQLite) ─────────────────────────────────

app.get('/api/inventory', (req, res) => {
  try {
    res.json(getInventory());
  } catch (err) {
    res.status(500).json({ error: 'Failed to read inventory' });
  }
});

app.post('/api/inventory/:type', requireAdmin, (req, res) => {
  try {
    const { type } = req.params;
    if (!['ingredients', 'products'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const item = req.body;
    if (!item.name) return res.status(400).json({ error: 'Name is required' });
    const saved = addInventoryItem(type, item);
    res.json({ success: true, item: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save item' });
  }
});

app.put('/api/inventory/:type/:id', requireAdmin, (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['ingredients', 'products'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const updated = updateInventoryItem(type, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/inventory/:type/:id', requireAdmin, (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['ingredients', 'products'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    deleteInventoryItem(type, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ── Orders endpoints ────────────────────────────────────────────────────────

// User — fetch their own orders by email
app.get('/api/orders/my', (req, res) => {
  try {
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ error: 'Email required' });
    const orders = getOrdersByEmail(email);
    res.json(orders);
  } catch (err) {
    console.error('/api/orders/my error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const { status, email, from, to } = req.query;
    res.json(getOrders({ status, email, from, to }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending','confirmed','ready','completed','cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    updateOrderStatus(req.params.id, status, note);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id/log', (req, res) => {
  try {
    res.json(getOrderStatusLog(req.params.id));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order log' });
  }
});

// ── Admin ───────────────────────────────────────────────────────────────────

// Serve admin HTML at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Token store (in-memory; tokens expire after 8 hours)
const adminTokens = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 20 });

// Login — POST /api/admin/login
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = generateToken();
    const expires = Date.now() + 8 * 60 * 60 * 1000; // 8h
    adminTokens.set(token, expires);
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid password' });
});

// Auth middleware for admin API routes
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const expires = adminTokens.get(token);
  if (!expires || Date.now() > expires) {
    adminTokens.delete(token);
    return res.status(401).json({ error: 'Unauthorised' });
  }
  next();
}

// Admin — GET /api/admin/orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const { status, email, from, to, search } = req.query;
    res.json(getOrders({ status, email, from, to, search }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin — GET /api/admin/orders/:id
app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Admin — DELETE /api/admin/orders/:id
app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  try {
    deleteOrder(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Admin — GET /api/admin/inventory
app.get('/api/admin/inventory', requireAdmin, (req, res) => {
  try {
    res.json(getInventory());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// ── Site Promos ─────────────────────────────────────────────────────────────

// Public — used by the landing page
app.get('/api/promo/active', (req, res) => {
  try { res.json(getActivePromo() || null); }
  catch { res.status(500).json({ error: 'Failed to fetch promo' }); }
});

// Admin CRUD
app.get('/api/admin/promos', requireAdmin, (req, res) => {
  try { res.json(getPromos()); }
  catch { res.status(500).json({ error: 'Failed to fetch promos' }); }
});

app.post('/api/admin/promos', requireAdmin, (req, res) => {
  try {
    const { title, subtitle, badge, cta_label, bg, starts_at, days } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const d = Math.max(1, Math.min(365, parseInt(days) || 7));
    const id = createPromo({
      title: sanitize(title), subtitle: sanitize(subtitle || ''),
      badge: sanitize(badge || ''), cta_label: sanitize(cta_label || 'Shop Now'),
      bg: sanitize(bg || 'brown'), starts_at: starts_at || new Date().toISOString(), days: d
    });
    res.json({ success: true, id });
  } catch { res.status(500).json({ error: 'Failed to create promo' }); }
});

app.put('/api/admin/promos/:id', requireAdmin, (req, res) => {
  try {
    const { title, subtitle, badge, cta_label, bg, starts_at, days } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const d = Math.max(1, Math.min(365, parseInt(days) || 7));
    updatePromo(Number(req.params.id), {
      title: sanitize(title), subtitle: sanitize(subtitle || ''),
      badge: sanitize(badge || ''), cta_label: sanitize(cta_label || 'Shop Now'),
      bg: sanitize(bg || 'brown'), starts_at: starts_at || new Date().toISOString(), days: d
    });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to update promo' }); }
});

app.post('/api/admin/promos/:id/activate', requireAdmin, (req, res) => {
  try { activatePromo(Number(req.params.id)); res.json({ success: true }); }
  catch { res.status(500).json({ error: 'Failed to activate promo' }); }
});

app.post('/api/admin/promos/:id/deactivate', requireAdmin, (req, res) => {
  try { deactivatePromo(Number(req.params.id)); res.json({ success: true }); }
  catch { res.status(500).json({ error: 'Failed to deactivate promo' }); }
});

app.delete('/api/admin/promos/:id', requireAdmin, (req, res) => {
  try { deletePromo(Number(req.params.id)); res.json({ success: true }); }
  catch { res.status(500).json({ error: 'Failed to delete promo' }); }
});

// ── Campaigns ───────────────────────────────────────────────────────────────

const VALID_AUDIENCES = ['all', 'repeat', 'completed', 'pending'];

// Merge audience + extra mobiles, then remove excluded (deduplicated by normalised mobile)
function normMobile(m) { return (m || '').replace(/[\s\-]/g, ''); }

function mergeRecipients(audienceList, extraMobiles, excludedMobiles = []) {
  const excluded = new Set((excludedMobiles || []).map(normMobile));
  const seen = new Set();
  const result = [];
  for (const r of audienceList) {
    const key = normMobile(r.mobile);
    if (!key) continue;
    if (!excluded.has(key) && !seen.has(key)) { seen.add(key); result.push(r); }
  }
  for (const m of (extraMobiles || [])) {
    const key = normMobile(m);
    if (!excluded.has(key) && !seen.has(key)) { seen.add(key); result.push({ mobile: m, first_name: '' }); }
  }
  return result;
}

app.get('/api/admin/campaigns', requireAdmin, (req, res) => {
  try { res.json(getCampaigns()); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch campaigns' }); }
});

app.get('/api/admin/campaigns/:id', requireAdmin, (req, res) => {
  try {
    const c = getCampaignById(Number(req.params.id));
    if (!c) return res.status(404).json({ error: 'Campaign not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch campaign' }); }
});

app.post('/api/admin/campaigns', requireAdmin, (req, res) => {
  try {
    const { title, body_html, audience, extra_mobiles, excluded_mobiles } = req.body;
    if (!title || !body_html || !audience)
      return res.status(400).json({ error: 'All fields are required' });
    if (!VALID_AUDIENCES.includes(audience))
      return res.status(400).json({ error: 'Invalid audience' });
    const mobiles  = Array.isArray(extra_mobiles)    ? extra_mobiles.filter(m    => typeof m === 'string' && m.trim().length >= 7) : [];
    const excluded = Array.isArray(excluded_mobiles) ? excluded_mobiles.filter(m => typeof m === 'string' && m.trim().length >= 7) : [];
    const id = createCampaign({ title: sanitize(title), subject: sanitize(title), body_html, audience, extra_mobiles: mobiles, excluded_mobiles: excluded });
    res.json({ success: true, id });
  } catch (err) { res.status(500).json({ error: 'Failed to create campaign' }); }
});

app.put('/api/admin/campaigns/:id', requireAdmin, (req, res) => {
  try {
    const { title, body_html, audience, extra_mobiles, excluded_mobiles } = req.body;
    if (!title || !body_html || !audience)
      return res.status(400).json({ error: 'All fields are required' });
    if (!VALID_AUDIENCES.includes(audience))
      return res.status(400).json({ error: 'Invalid audience' });
    const c = getCampaignById(Number(req.params.id));
    if (!c) return res.status(404).json({ error: 'Campaign not found' });
    if (c.status === 'sent') return res.status(400).json({ error: 'Cannot edit a sent campaign' });
    const mobiles  = Array.isArray(extra_mobiles)    ? extra_mobiles.filter(m    => typeof m === 'string' && m.trim().length >= 7) : [];
    const excluded = Array.isArray(excluded_mobiles) ? excluded_mobiles.filter(m => typeof m === 'string' && m.trim().length >= 7) : [];
    updateCampaign(Number(req.params.id), { title: sanitize(title), subject: sanitize(title), body_html, audience, extra_mobiles: mobiles, excluded_mobiles: excluded });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to update campaign' }); }
});

app.delete('/api/admin/campaigns/:id', requireAdmin, (req, res) => {
  try {
    deleteCampaign(Number(req.params.id));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete campaign' }); }
});

app.get('/api/admin/campaigns/:id/preview', requireAdmin, (req, res) => {
  try {
    const c = getCampaignById(Number(req.params.id));
    if (!c) return res.status(404).json({ error: 'Campaign not found' });
    const recipients = mergeRecipients(resolveCampaignAudience(c.audience), c.extra_mobiles || [], c.excluded_mobiles || []);
    res.json({ count: recipients.length, recipients });
  } catch (err) { res.status(500).json({ error: 'Failed to preview campaign' }); }
});

app.post('/api/admin/campaigns/:id/send', requireAdmin, async (req, res) => {
  try {
    if (!twilioClient) return res.status(503).json({ error: 'SMS not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER in .env' });

    const c = getCampaignById(Number(req.params.id));
    if (!c) return res.status(404).json({ error: 'Campaign not found' });
    if (c.status === 'sent') return res.status(400).json({ error: 'Campaign already sent' });

    const recipients = mergeRecipients(resolveCampaignAudience(c.audience), c.extra_mobiles || [], c.excluded_mobiles || []);
    if (!recipients.length) return res.status(400).json({ error: 'No recipients with mobile numbers for this audience' });

    const results = [];
    for (const r of recipients) {
      const body = c.body_html.replace(/\{\{first_name\}\}/g, r.first_name || 'Valued Customer');
      try {
        await twilioClient.messages.create({
          body,
          from: process.env.TWILIO_FROM_NUMBER,
          to: r.mobile
        });
        results.push({ mobile: r.mobile, email: '', first_name: r.first_name, status: 'sent' });
      } catch (_) {
        results.push({ mobile: r.mobile, email: '', first_name: r.first_name, status: 'failed' });
      }
    }

    markCampaignSent(Number(req.params.id), results);
    const sent   = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;
    res.json({ success: true, sent, failed });
  } catch (err) { res.status(500).json({ error: 'Failed to send campaign' }); }
});

// ── Serve Vite frontend in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// ── Start server after DB is ready ─────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

// Stripe payment endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, item } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'inr',
      metadata: {
        item: item
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});