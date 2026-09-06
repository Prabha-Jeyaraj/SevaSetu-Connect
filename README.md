# SevaSetu Connect

> Cooperative-Owned. AI-Powered. Fairer Work for All.

A working prototype of a democratic, cooperative-owned gig-work marketplace that connects verified skilled workers — electricians, plumbers, carpenters, caregivers, painters — with households, through their own Labour Cooperative Societies. Built for Smart India Hackathon 2026 (Problem Statement SIH26089, Ministry of Cooperation).

**https://sevasetu-connect.onrender.com/**

---

## 📌 At a Glance

| | |
|---|---|
| **Problem Statement** | SIH26089 — Cooperative Gig Services Platform for Household & Community Services |
| **Organization** | Ministry of Cooperation, National Council for Cooperative Training (NCCT) |
| **Team** | Frizzy Code |
| **Status** | Working prototype (hackathon build) |
| **Run locally at** | `http://localhost:5000` |

---

## 🎯 Problem

Labour Cooperative Federations and Societies already have large pools of skilled, verified workers — but no digital channel of their own to reach customers. Private gig platforms fill that gap while charging 25–30% commission, with no welfare or insurance integration for workers. Cooperative workers stay underpaid, uninsured, and digitally invisible.

## 💡 Solution

SevaSetu Connect gives cooperative societies their own direct-to-customer platform — owned by the cooperative, not a private company — retaining 95%+ of revenue for workers, with fair governance and AI-assisted workforce planning built in.

---

## ⚡ Key Features (Implemented)

| Feature | What It Does |
|---|---|
| Cooperative Verification & Trust | Workers affiliated with registered cooperative societies get a Verified badge |
| Bidirectional Marketplace | Customers post requirements and book workers; workers broadcast availability and can request cross-skill collaboration (e.g. a plumber hiring an electrician) |
| AI Seasonal Demand Forecaster | Predicts next-month service demand per district (e.g. monsoon plumbing surges, festive painting peaks) to guide workforce planning |
| Multi-Tenant Society Dashboards | Each cooperative society admin sees only their own workers, verifications, and bookings |
| Platform Super Admin Portal | National-level view across all societies, workers, and customers, with society approval/suspension controls |
| Worker Verification Queue | Society admins review and approve pending worker registrations |
| Society Welfare Pool | Tracks the cooperative's collective welfare fund (5% pool) |

---

## 🏗️ Architecture

Built as a **single unified deployable service** — the Express backend serves both the REST API (`/api/*`) and the compiled React frontend (`/*`) from one port. No separate frontend hosting or reverse proxy needed.

```
SevaSetu Connect/
├── package.json              # Unified build & start scripts (root)
├── backend/                  # Node.js + Express server & SQLite DB
│   ├── db.js                 # SQLite connection & schema initialization
│   ├── seed.js                # Sample data seed script
│   ├── server.js               # Unified server: API + frontend/dist
│   └── routes/                  # auth, superAdmin, societies, workers,
│                                 customers, bookings, posts, forecast
├── frontend/                  # React 18 + Vite + Tailwind CSS
│   ├── dist/                    # Production compiled static bundle
│   └── src/
│       ├── components/          # Navbar, AuthModal, Badges, WorkerCard,
│       │                          BookingModal, JobPostModal, ForecastChart
│       ├── context/              # AuthContext (persistent localStorage sessions)
│       ├── pages/                 # LandingPage, SearchBrowse, WorkerFeed,
│       │                           AdminDashboard, SuperAdminPortal, BookingTracker
│       └── services/api.js         # Relative API client (/api/*)
├── ai-model/                  # Python scikit-learn demand forecasting
│   ├── generate_data.py         # Synthetic 800-row seasonal dataset
│   ├── train_predict.py          # GradientBoosting regression model (R² = 0.94)
│   ├── app.py                     # Optional Flask microservice (port 5001)
│   └── data/                       # dataset + trained model file
├── database/
│   └── schema.sql               # SQL schema
└── README.md
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express (serves API and frontend together)
- **Database:** SQLite
- **AI/ML:** Python, scikit-learn — GradientBoosting regression model, R² = 0.9402, trained on an 800-row synthetic seasonal demand dataset

---

## 🤖 AI Demand Forecasting

Predicts next-month service demand per district and skill type, so cooperative society admins can plan workforce allocation ahead of seasonal spikes (e.g. more plumbers before monsoon, more electricians before Diwali).

- **Dataset:** synthetic, 800 rows, generated to reflect realistic seasonal booking patterns
- **Model:** GradientBoosting regression (scikit-learn), R² = 0.9402
- **Output:** forecast + 95% confidence range per skill, shown directly on the Society Admin dashboard

> The synthetic dataset stands in for real cooperative booking history, which would replace it once the platform has live societies onboarded.

---

## ⚙️ Getting Started

```bash
# 1. Install all dependencies (root, backend, frontend)
npm run install:all

# 2. Build the frontend and start the unified server
npm run build     # compiles React app into frontend/dist
npm start         # starts unified server on http://localhost:5000
```

Open `http://localhost:5000` — both the web app and the API are served from the same address.

### Other useful scripts

| Script | Purpose |
|---|---|
| `npm run seed` | Reseeds the database with sample societies and workers |
| `npm run dev:frontend` | Starts Vite dev server with hot reload (port 3000) |
| `npm run dev:backend` | Starts backend with nodemon for development |

---

## 🔑 Test Accounts

| Portal / Role | Email | Password | Scope |
|---|---|---|---|
| Platform Super Admin | `superadmin@sevasetu.coop` | `superadmin123` | National federation governance |
| Pune Society Admin | `admin@puneshramik.coop` | `society123` | Pune Shramik Sahakari Sanstha only |
| Bengaluru Society Admin | `admin@kaushalya.coop` | `society123` | Bengaluru Kaushalya Sangha only |
| Delhi Society Admin | `admin@delhikarmik.org` | `society123` | Delhi Karmik Vikas Samiti only |
| Customer | `arjun.mehta@example.com` | `customer123` | Sample customer profile |
| Worker | `ramesh.shinde@example.com` | `worker123` | Electrician, Pune Society |

Quick-fill buttons for these accounts are also available in the Sign In modal.

---

## ⚠️ Disclaimer — Prototype Scope

This is a **hackathon prototype**, not a production system. Specifically:

- Authentication uses pre-seeded email/password test accounts — no real OTP/SMS verification or public sign-up flow yet
- Database is SQLite (file-based) — suited for a demo, not for concurrent production load
- The AI model is trained on a synthetic dataset, not real booking history
- Worker verification is an admin approval toggle, not real document/ID checking
- Payments are not yet integrated with any real payment gateway

---

## 🚀 Deployment Note

Because this runs as **one unified Node.js service** (not separate frontend/backend apps), it should be deployed as a single app on a host that supports persistent Node servers — such as **Render** or **Railway** — rather than split across Vercel (frontend) and a separate backend host. Vercel's serverless model isn't a natural fit for a single persistent Express server with a file-based SQLite database.

Once deployed, the live link will be added at the top of this README.

---

## 📌 Status

🚧 Working prototype — built for Smart India Hackathon 2026 (SIH26089)
