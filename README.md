# ProdFlow Frontend

Web dashboard for **ProdFlow** — a production management system for manufacturing companies.
Manage production, inventory, sales, HR, and reporting from a single React single-page application.

The interface follows one cohesive, enterprise-grade design system: a shared brand palette, an
animated gradient page header (hero banner), consistent cards, tables, forms, status badges, and
action buttons across every module.

---

## Features

- **Dashboard** — premium animated hero banner with a time-of-day greeting and live KPI highlights, charts (Recharts), and real-time analytics
- **Production** — products, materials, machines, planning, orders
- **Inventory** — product/material stock, warehouses, IN/OUT movements
- **Sales & Finance** — clients, orders, invoices, expenses, suppliers, trucks
- **Human Resources** — staff, salaries, vacations, contracts, users (with invitations)
- **Maintenance** — machine maintenance tracking
- **Reports** — production, sales, expenses, stock (batch generation + branded PDF export)
- **AI Assistant** — chat widget and smart alerts for the active company
- **Multi-company** — company switcher in the header (admin)

---

## Tech Stack

| Category | Tools |
|----------|-------|
| Core | React 19, Vite 8, React Router 7 |
| UI | Bootstrap 5, React Icons, custom design system (`src/styles/hero.css`) |
| Data | Axios, Recharts |
| Export | jsPDF, html2canvas, jspdf-autotable |
| Feedback | React Toastify |
| Quality | ESLint 9 |

---

## Prerequisites

- **Node.js** 18+
- **npm**
- **ProdFlow backend API** — running and reachable

---

## Getting Started

```bash
git clone <repo-url>
cd prodflow-frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── api/             # Axios instance + request interceptor (axios.jsx)
├── assets/          # Images / logos
├── components/      # Shared UI: Sidebar, Header, Paginate, AiChatWidget
├── constants/       # Static config (reportTypes.js)
├── context/         # React context (ReportBatchContext — report batch state)
├── hooks/           # useBackgroundRefresh, useReportAccess
├── layouts/         # Layout.jsx — sidebar + header + content shell
├── pages/
│   └── management/  # Feature pages (Dashboard, Products, Sales, Reports, …)
├── router/          # AppRouter.jsx — route definitions
├── styles/          # hero.css — shared hero-banner background + animation
├── utils/           # exportToPDF.js, reportValidation.js
├── Global.css       # Sidebar / global base styles
└── main.jsx         # App entry
```

---

## Design System & UI Conventions

All modules share a single visual language so the app feels like one product. When building or
editing a page, reuse these conventions instead of inventing new styles.

### Tokens (per page)

```js
const BRAND    = '#035dad'                                   // primary brand blue
const inputCls = 'form-control shadow-none rounded-3'        // text inputs
const selCls   = 'form-select shadow-none rounded-3'         // dropdowns
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' } // primary button
```

| Token | Usage |
|-------|-------|
| `BRAND + '1a'` | (legacy) light header tint — now replaced by `.hero-banner` |
| `BRAND + '10'` | card-header tint (edit forms) |
| `BRAND + '18'` | icon-chip background |
| `BRAND + '12'` | soft action-button background (edit) |
| `#ef4444` on `#ef444412` | destructive action button |

### Hero banner (`src/styles/hero.css`)

Every page header uses the reusable **`hero-banner`** class — a premium animated gradient
(brand blue), soft floating glow, shimmer sweep, and fade-in on load. The CSS also handles
on-dark text/button contrast automatically, so pages only add the class:

```jsx
<div className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4">
  <div>
    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}>Group</p>
    <h4 className="fw-bold mb-1">Page Title</h4>
    <small>Short description.</small>
  </div>
  {/* optional action button — auto-styled as glass on the gradient */}
</div>
```

`hero.css` is imported once in `Layout.jsx`, so it's available on every page. It respects
`prefers-reduced-motion` (all animation disabled for users who opt out). The Dashboard hero adds
glass stat chips (`.dash-chip`) and decorative blobs (`.hero-blob`) on top of the same base.

### Component conventions

| Element | Convention |
|---------|------------|
| Cards | `card rounded-4 border-0 shadow-sm` |
| Section header | icon chip (`BRAND + '18'`) + title + subtitle |
| Tables | `table table-hover align-middle`; uppercase `0.7rem` letter-spaced muted headers |
| Status | pill `badge rounded-pill` — green = active/ok, amber = pending/low, red = inactive/negative, grey = neutral |
| Search | input-group with leading `FaSearch` icon, `rounded-3` |
| Empty state | centered `text-muted py-4` row |
| Delete confirm | fixed bottom-center card with Cancel / Confirm |
| Money | `toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` → `40,000.00` |

### PDF reports

`ReportPDFTemplate` (`src/pages/management/reports/`) is a shared, off-screen layout used by all
report pages (Expenses / Sales / Production). Each page builds a config object (`kpis[]`,
`panels[]`, `tableColumns[]`, `tableRows[][]`, `tableTotals[]`) and renders it hidden; the generic
`exportToPDF(elementId, fileName)` utility (`src/utils/exportToPDF.js`) rasterizes it with
html2canvas and slices it into an A4 PDF via jsPDF. Invoices (`SalesInvoice`) use a minimal,
print-optimized layout (logo icon only).

---

## Configuration

### API client

The Axios instance is defined in `src/api/axios.jsx`:

```js
baseURL: 'http://127.0.0.1:8000/api'
```

A request interceptor attaches `Authorization: Bearer <token>` from `localStorage` on every call.

### Development proxy

`vite.config.js` proxies `/api` to `http://localhost:8000` so AI endpoints (`/api/ai/*`) work
without CORS issues during local development.

### Production

Update `baseURL` in `src/api/axios.jsx` to your production API URL and configure CORS on the backend.

---

## Modules & Routes

| Group | Routes | Admin only |
|-------|--------|:----------:|
| Main | `/dashboard`, `/companies` | companies |
| Production | `/products`, `/materials`, `/machines`, `/production`, `/planification` | |
| Stock | `/products_stock`, `/materials_stock`, `/warehouses` | products_stock |
| Sales | `/clients`, `/orders`, `/sales`, `/createSale`, `/editSale/:id`, `/salesInvoice/:id` | |
| Finance | `/expenses`, `/suppliers`, `/trucks` | expenses |
| HR | `/staff`, `/users`, `/salaries`, `/vacations`, `/contracts` | users |
| Maintenance | `/maintenances` | |
| Reports | `/reports`, `/productionReport`, `/salesReport`, `/expensesReport`, `/materialsStockReport` | ✓ |
| Auth | `/`, `/login`, `/signup`, `/accept-invite`, `/profile` | |

---

## Authentication & Roles

1. User logs in via `POST /api/login` → receives `token` and `user`
2. Stored in `localStorage`: `token`, `user`, `role`, `active_company_id`
3. Every API request sends `Authorization: Bearer <token>`
4. Signup checks `GET /api/signup-available` — redirects to login if disabled

The sidebar resolves the current role from `GET /api/me` and caches it in `localStorage` so that
admin-only links stay stable across navigation (no flicker). `localStorage` is cleared on sign out.

| Role | Access |
|------|--------|
| **admin** | Full access — companies, product stock, expenses, users, reports |
| **manager / user** | Operational modules — production, stock, sales, staff, etc. |

---

## Reports & AI

### Reports Hub (`/reports`)

- Select report types and date range (7 / 30 / 90 days or custom)
- Trigger batch generation via `POST /api/admin/reports/batch`
- `ReportBatchContext` polls status: `queued` → `processing` → `completed` / `failed`
- Individual report pages require `?run_id=` (guarded by `useReportAccess`)
- Export to PDF via `src/utils/exportToPDF.js` + `ReportPDFTemplate`

### AI

| Feature | Endpoint | Location |
|---------|----------|----------|
| Chat | `POST /api/ai/chat-data` | `AiChatWidget` |
| Alerts | `POST /api/ai/alerts` | `Header` |

The AI widget appears on all pages after login. Chat history is stored in `sessionStorage`.

### Background refresh

`useBackgroundRefresh` polls `GET /api/admin/analytics/refresh-status` every 2s and shows toast
notifications while analytics are processing.

---

## Deployment

1. Update `baseURL` in `src/api/axios.jsx`
2. Run `npm run build`
3. Serve the `dist/` folder (nginx, Vercel, Netlify, etc.)
4. Configure SPA fallback so all routes return `index.html`

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## License

This project is proprietary software. All rights reserved.
