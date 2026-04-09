# ✈️ TravelCompare

Smart Indian travel comparison platform — compare Train, Bus, Flight & Taxi with AI-powered scoring.

## Quick Start (Frontend only)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** — the app runs in **mock mode** when the backend is not started, showing estimated results with the AI scoring engine.

## Full Stack Setup

### 1. Prerequisites
- Node.js 18+
- MySQL 8+

### 2. Create MySQL database

```sql
CREATE DATABASE travel_compare;
```

### 3. Configure backend

```bash
cd server
cp .env.example .env
# Edit server/.env — set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
```

### 4. Start the backend (Terminal 1)

```bash
cd server
npm install
npm run dev
# API server runs at http://localhost:5000
# Note: the backend root (GET /) returns a JSON hint — it is API-only.
#       Use GET /api/health to check the server status.
```

### 5. Start the frontend (Terminal 2)

```bash
cd client
npm install
npm run dev
# App runs at http://localhost:5173
```

## localhost vs 127.0.0.1 — Cookie Mismatch

Browsers treat `localhost` and `127.0.0.1` as **different origins** for cookie scoping purposes.

- Always open the frontend at **http://localhost:5173** (not `http://127.0.0.1:5173`).
- The backend should be accessed at **http://localhost:5000** (not `http://127.0.0.1:5000`).

If you mix these, the `token` and `_csrf` cookies set by the backend will **not be sent** on subsequent requests, causing 401 "Authentication required" errors even after a successful login. The Vite dev proxy (`/api → http://localhost:5000`) already handles the forwarding, so you never need to call port 5000 directly from the browser.

## CSRF Protection

The backend uses the **double-submit cookie** pattern (`csrf-csrf`). The client automatically handles CSRF without any manual steps:

1. Before the first state-changing request (POST / PUT / PATCH / DELETE), the client fetches `GET /api/csrf-token` to receive a signed token and set the `_csrf` cookie.
2. The token is attached as the `x-csrf-token` request header on every subsequent state-changing request.
3. If the server returns `403`, the token is refreshed and the request is retried once automatically.

Invalid or missing CSRF tokens are returned as **HTTP 403** (not 500).

## Features

- 🔍 **Smart Search** — Auto-suggest Indian cities, compare all transport modes
- 🧠 **AI Scoring** — Price (40%), Time (30%), Comfort (15%), Eco (10%), Distance (5%)
- 🏆 **Best Pick Panel** — Highlighted best option with human-like explanation
- 🤖 **TravelBot** — Floating chatbot that answers questions about current results
- 🌓 **Dark/Light Theme** — Persisted via localStorage
- 🔐 **Auth** — JWT + httpOnly cookies, protected Bookings / Profile / Settings
- 📱 **Responsive** — Mobile-first, Bootstrap 5.3

## Mock Mode vs Live Results

When the backend is **running**, the Results page fetches real travel options from `GET /api/search/options` and shows a **Live** badge next to the date.

When the backend is **not running** (or returns a network error), the app automatically falls back to client-side mock data and shows a **Mock Data** badge. All AI scoring and UI features still work in mock mode.

> **Tip:** The "Mock Data" badge disappears as soon as both servers are started and the frontend can reach `http://localhost:5000`.

## Book Now — Provider Deep-Links

Clicking **Book Now** on a result card does two things simultaneously:

1. **Saves** the booking to your account (POST `/api/bookings`) — visible in *My Bookings*.
2. **Opens** the real provider booking site in a new tab so you can complete the purchase.

Provider sites used:

| Transport | Provider |
|-----------|----------|
| 🚂 Train | [IRCTC](https://www.irctc.co.in/nget/train-search) |
| ✈️ Flight | Air India / IndiGo / SpiceJet / Vistara (direct) or [Google Flights](https://www.google.com/flights) |
| 🚌 Bus | [RedBus](https://www.redbus.in) |
| 🚕 Taxi | [Uber](https://www.uber.com/in/en/ride/) or [Ola](https://www.olacabs.com/) |

The provider URL is also stored in the database (`booking_url` column) and displayed as an **Open Provider** button in *My Bookings*.

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18, Vite, Bootstrap 5.3 |
| State    | Context API (Auth + Theme)    |
| Routing  | React Router v6               |
| Backend  | Node.js, Express              |
| Database | MySQL (Sequelize)             |
| Auth     | JWT + httpOnly cookies        |

## Project Structure

```
travel_helper/
├── client/               # React + Vite frontend
│   └── src/
│       ├── App.jsx        # Root router
│       ├── pages/         # Home, Results, Login, Register, Bookings, Profile, Settings
│       ├── components/    # Navbar, SearchForm, ResultCard, Chatbot, ProtectedRoute
│       ├── contexts/      # AuthContext, ThemeContext
│       └── utils/         # Axios API client
└── server/               # Express backend
    └── ...
```

