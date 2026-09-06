# SevaSetu Connect — Unified Cooperative Gig-Work Marketplace Platform

A democratic, cooperative-owned gig-work marketplace platform that empowers service professionals (electricians, plumbers, carpenters, caregivers, painters) through collective federation, fair revenue retention (95%+), bidirectional job matching, multi-tenant society dashboards, and AI seasonal demand forecasting.

---

## Architecture Overview (Single Deployable Service)

The project is structured as a **single unified deployable service**:
- The **Express backend server** serves both the **REST API routes** (`/api/*`) and the **compiled React frontend static assets** (`/*`) on a single port.
- No separate frontend hosting or reverse proxy is required for deployment.

```
SevaSetu Connect/
├── package.json              # Unified build & start scripts (Root)
├── backend/                  # Node.js + Express Server & SQLite DB
│   ├── db.js                 # SQLite connection & schema initialization
│   ├── seed.js               # Sample data seed script (Societies, Workers, Users, Bookings)
│   ├── server.js             # Unified Server: serves REST API + frontend/dist
│   └── routes/               # auth, superAdmin, societies, workers, customers, bookings, posts, forecast
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── dist/                 # Production compiled static bundle
│   ├── src/
│   │   ├── components/       # Navbar, AuthModal, Badges, WorkerCard, BookingModal, JobPostModal, ForecastChart
│   │   ├── context/          # AuthContext with persistent localStorage sessions
│   │   ├── pages/            # LandingPage, SearchBrowse, WorkerFeed, AdminDashboard, SuperAdminPortal, BookingTracker
│   │   └── services/api.js   # Relative API client (/api/*)
├── ai-model/                 # Python Scikit-Learn AI Demand Forecasting
│   ├── generate_data.py      # Generates synthetic 800-row seasonal dataset
│   ├── train_predict.py      # GradientBoosting seasonal regression model (R² = 0.9402)
│   ├── app.py                # Optional Flask microservice (Port 5001)
│   └── data/                 # synthetic_demand_data.csv & trained_demand_model.joblib
├── database/
│   └── schema.sql            # Standard DDL SQL schema
└── README.md
```

---

## Quick Start (Single Service: 1 Command, 1 Port)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Build Frontend & Start Unified Server
```bash
npm run build     # Builds React frontend into frontend/dist
npm start         # Starts unified server on http://localhost:5000
```

Open your browser to: **`http://localhost:5000`**

Both the **React web app** and the **REST API** are served together from `http://localhost:5000`.

---

## Available npm Scripts (Root `package.json`)

| Script | Command | Purpose |
|---|---|---|
| `npm run build` | `npm run build:frontend` | Compiles the React app into `frontend/dist` |
| `npm start` | `node backend/server.js` | Starts unified server serving API + static frontend |
| `npm run seed` | `npm run seed --prefix backend` | Reseeds database with sample societies and workers |
| `npm run dev:frontend` | `npm run dev --prefix frontend` | (Optional) Starts Vite HMR dev server on port 3000 |
| `npm run dev:backend` | `npm run dev --prefix backend` | (Optional) Starts backend with nodemon |

---

## Pre-Configured Test Accounts

| Portal / Role | Email | Password | Scope |
|---|---|---|---|
| **Platform Super Admin** | `superadmin@sevasetu.coop` | `superadmin123` | National federation governance |
| **Pune Society Admin** | `admin@puneshramik.coop` | `society123` | Scoped to Pune Shramik Sahakari |
| **Bengaluru Society Admin** | `admin@kaushalya.coop` | `society123` | Scoped to Bengaluru Kaushalya Sangha |
| **Delhi Society Admin** | `admin@delhikarmik.org` | `society123` | Scoped to Delhi Karmik Vikas Samiti |
| **Customer** | `arjun.mehta@example.com` | `customer123` | Homeowner customer profile |
| **Worker** | `ramesh.shinde@example.com` | `worker123` | Electrician (Pune Society) |

*(Quick-fill buttons are also provided inside the Sign In modal for fast testing).*
