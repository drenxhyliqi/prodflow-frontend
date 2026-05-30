# ProdFlow Frontend

Web dashboard for **ProdFlow** — a production management system for manufacturing companies.  
Manage production, inventory, sales, HR, and reporting from a single React SPA.

---

## Features

- **Dashboard** — KPIs, charts (Recharts), real-time analytics
- **Production** — products, materials, machines, planning, orders
- **Inventory** — product/material stock, warehouses, IN/OUT movements
- **Sales & Finance** — clients, orders, invoices, expenses, suppliers, trucks
- **Human Resources** — staff, salaries, vacations, contracts, users
- **Maintenance** — machine maintenance tracking
- **Reports** — production, sales, expenses, stock (batch generation + PDF export)
- **AI Assistant** — chat widget and smart alerts for the active company
- **Multi-company** — company switcher in the header (admin)

---

## Tech Stack

| Category | Tools |
|----------|-------|
| Core | React 19, Vite 8, React Router 7 |
| UI | Bootstrap 5, React Icons |
| Data | Axios, Recharts |
| Export | jsPDF, html2canvas, jspdf-autotable |
| Feedback | React Toastify |
| Quality | ESLint |

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

## Configuration

### API client

The Axios instance is defined in `src/api/axios.jsx`:

```js
baseURL: 'http://127.0.0.1:8000/api'
```

A request interceptor attaches `Authorization: Bearer <token>` from `localStorage` on every call.

### Development proxy

`vite.config.js` proxies `/api` to `http://localhost:8000` so AI endpoints (`/api/ai/*`) work without CORS issues during local development.

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
2. Stored in `localStorage`: `token`, `user`, `active_company_id`
3. Every API request sends `Authorization: Bearer <token>`
4. Signup checks `GET /api/signup-available` — redirects to login if disabled

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
- Export to PDF via `src/utils/exportToPDF.js`

### AI

| Feature | Endpoint | Location |
|---------|----------|----------|
| Chat | `POST /api/ai/chat-data` | `AiChatWidget` |
| Alerts | `POST /api/ai/alerts` | `Header` |

The AI widget appears on all pages after login. Chat history is stored in `sessionStorage`.

### Background refresh

`useBackgroundRefresh` polls `GET /api/admin/analytics/refresh-status` every 2s and shows toast notifications while analytics are processing.

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

## License

This project is proprietary software. All rights reserved.