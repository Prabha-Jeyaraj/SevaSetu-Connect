# SevaSetu Connect

> Cooperative-Owned. AI-Powered. Fairer Work for All.

A working prototype of a democratic, cooperative-owned gig-work marketplace that connects verified skilled workers — electricians, plumbers, carpenters, caregivers, painters — with households, through their own Labour Cooperative Societies. Built for Smart India Hackathon 2026 (Problem Statement SIH26089, Ministry of Cooperation).

**[🔗 Prototype Link ](https://sevasetu-connect.onrender.com/)**

---

## 📌 At a Glance

| | |
|---|---|
| **Problem Statement** | SIH26089 — Cooperative Gig Services Platform for Household & Community Services |
| **Organization** | Ministry of Cooperation, National Council for Cooperative Training (NCCT) |
| **Team** | Frizzy Code |
| **Status** | Working prototype (hackathon build) |

---

## 🎯 Problem

Labour Cooperative Federations and Societies already have large pools of skilled, verified workers — but no digital channel of their own to reach customers. Private gig platforms (e.g. Urban Company) fill that gap while charging 20-30% commission, with no transparent welfare integration for workers. Cooperative workers stay underpaid, uninsured, and digitally invisible.

## 💡 Solution

SevaSetu Connect gives cooperative societies their own direct-to-customer platform — owned by the cooperative, not a private company — with a fully itemized 15% fee (workers keep 85% directly), real government insurance integration, and fair, non-discriminatory job access for every verified worker.

---

## ⚡ Key Features (Implemented)

| Feature | What It Does |
|---|---|
| Cooperative Verification & Trust | Workers affiliated with registered cooperative societies get a Verified badge |
| Bidirectional Marketplace | Customers post requirements and book workers; workers broadcast availability and can request cross-skill collaboration (e.g. a plumber hiring an electrician) |
| Category-First Landing Page | Browse workers by service category (electrician, plumber, carpenter, etc.) via a simple icon grid — no login required to explore |
| AI Seasonal Demand Forecaster | Predicts next-month service demand per district to guide workforce planning |
| Multi-Tenant Society Dashboards | Each cooperative society admin sees only their own workers, verifications, and bookings |
| Platform Super Admin Portal | National-level view across all societies, workers, and customers |
| Fair Job Rotation | Search results rotate fairly among all verified workers (rating 3.8+) — no rating-based priority hoarding |
| Retraining, Not Exclusion | Workers below a 3.8 rating are flagged for free mandatory retraining, not blocked — final review by their own Society Admin, not an algorithm |
| Worker Personal Dashboard | Monthly earnings, jobs completed, rating trend, and growth % — visible only to the worker themselves |
| Society Admin Leaderboard | Internal-only performance view for admins to identify who needs support or recognition — never exposed to customers or used for search ranking |

---

## 💰 Fee Structure — Fully Itemized

Unlike private platforms that take an opaque 20-30% cut, our 15% fee is split into three named, traceable components:

| Component | % | Purpose |
|---|---|---|
| Platform Operations | 8% | Servers, app maintenance, standard running costs |
| Government Insurance Premium Fund | 5% | Auto-pays the worker's PMSBY and a share of PMJJBY premium |
| Training & Quality Fund | 2% | Funds free mandatory retraining for workers below the rating threshold — never charged to the worker |

Cooperative society membership fees are entirely separate — paid directly by members to their own society, never touching the platform.

---

## 🛡️ Insurance — Real Government Schemes, Not a Custom Fund

Rather than inventing a private welfare fund, SevaSetu Connect guides every worker — Cooperative Member or Independent — to register on **e-Shram**, the Ministry of Labour and Employment's national database of unorganised workers (31+ crore workers already registered as of 2026). This gives access to:

- **PMSBY** (Pradhan Mantri Suraksha Bima Yojana) — ₹2 lakh accidental death/disability cover, ₹1 lakh partial disability, ₹20/year premium
- **PMJJBY** (Pradhan Mantri Jeevan Jyoti Bima Yojana) — ₹2 lakh life cover, ₹436/year premium

The platform's 5% insurance allocation auto-pays these premiums on the worker's behalf, so coverage never lapses from a missed manual payment.

---

## 🏗️ Architecture

Built as a **single unified deployable service** — the Express backend serves both the REST API (`/api/*`) and the compiled React frontend (`/*`) from one port.

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
│       │                          BookingModal, JobPostModal, ForecastChart,
│       │                          CategoryGrid, WorkerDashboard, AdminLeaderboard
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
- e-Shram/PMSBY/PMJJBY integration is a guided-registration flow in the UI, not a live API connection to government systems
- Payments are not yet integrated with any real payment gateway

---

## 🚀 Deployment Note

Runs as **one unified Node.js service** — deploy as a single app on a host that supports persistent Node servers (Render, Railway), not split across Vercel + a separate backend.

---

## 📚 Government Data Sources

- **National Cooperative Database** — [cooperatives.gov.in](https://cooperatives.gov.in/en) — 8 lakh+ registered cooperative societies, State & District Registrar records
- **e-Shram Portal** — [eshram.gov.in](https://eshram.gov.in) — Ministry of Labour and Employment, 31+ crore registered unorganised workers, gateway to PMSBY/PMJJBY

---

## 📌 Status

🚧 Working prototype — built for Smart India Hackathon 2026 (SIH26089)

## 👥 Team — Frizzy Code

- Prabha J. — Team Lead
