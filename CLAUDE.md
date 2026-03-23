# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server at http://localhost:5173 (frontend only)
npm run server       # Express backend at http://localhost:3001 (backend only)
npm run dev:full     # Run both frontend and backend concurrently
npm run build        # Production build
npm run preview      # Preview production build
```

There are no test or lint commands configured.

## Architecture

This is a **vanilla JS + Vite frontend** with a **Node.js/Express backend** — no framework (no React, Vue, etc.).

### Key files

- `index.html` — Entry point; loads Google Fonts, Razorpay script, and Vite entry
- `src/main.js` — All frontend logic: DOM manipulation, cart, scroll animations, custom cursor, form submission
- `src/style.css` — All styles with CSS custom properties for the design system
- `server.js` — Express API server; handles order emails (Nodemailer) and Stripe payment intents

### Frontend (`src/main.js`)

Single-file architecture with no bundling of JS modules. Key systems:
- **Custom cursor**: Follows mouse with a ring element that scales on hover
- **Scroll reveal**: IntersectionObserver animates `.reveal` elements into view
- **Cart**: In-memory array (`cart = []`), no persistence
- **Order form**: Validates required fields and 2-day minimum advance notice, then POSTs to `http://localhost:3001/api/send-order`

### Backend (`server.js`)

Two endpoints:
- `POST /api/send-order` — Validates order fields, sends HTML email via Nodemailer to `dechmp@gmail.com`
- `POST /api/create-payment-intent` — Creates a Stripe PaymentIntent in INR (partially implemented)

Email transport:
- **Dev**: MailHog on `localhost:1025` (if `NODE_ENV !== 'production'`)
- **Prod**: Gmail SMTP using `EMAIL_USER` and `EMAIL_APP_PASSWORD` env vars

### Design system (CSS custom properties)

| Variable | Value | Usage |
|---|---|---|
| `--cream` | `#F7F0E6` | Background |
| `--warm-white` | `#FDF8F2` | Primary bg |
| `--dark` | `#1C1208` | Text |
| `--brown` | `#5C3D1E` | Accents |
| `--caramel` | `#C8873A` | Highlights |
| `--blush` | `#E8C5A0` | Secondary |

Fonts: `Cormorant Garamond` (serif/headings), `DM Mono` (monospace/labels)

### Environment variables (`.env`)

```
EMAIL_USER=
EMAIL_APP_PASSWORD=
PORT=3001
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

### Known gaps

- Stripe endpoint in `server.js` is incomplete (missing initialization)
- Razorpay script loaded in `index.html` but not integrated in JS
- Cart has no checkout flow or payment integration
- CORS allows all origins
