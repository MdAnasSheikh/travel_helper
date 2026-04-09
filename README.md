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
- 🔗 **Provider Links** — "Book Now" saves the booking to DB **and** opens the real provider site (IRCTC for trains, Google Flights for flights, RedBus for buses, Ola/Uber/Zoomcar for taxis) in a new tab. The provider URL is stored with the booking so you can reopen it any time from the **My Bookings** page.

## Mock Mode

When the backend is not running, the app automatically falls back to client-side mock data so you can explore the full UI without a database.

When the backend **is** running, the Results page calls `GET /api/search/options?from=&to=&date=` and displays live calculated results (real Indian Railways train data, distance-based pricing for flights/bus/taxi).

## Bookings — Provider Links

Clicking **Book Now** on any result card will:
1. Save the booking (route, price, company, transport mode, and provider URL) to the MySQL `bookings` table.
2. Immediately open the relevant provider website in a new tab:
   - **Train** → [IRCTC Train Search](https://www.irctc.co.in/nget/train-search)
   - **Flight** → [Google Flights](https://www.google.com/travel/flights)
   - **Bus** → [RedBus](https://www.redbus.in) with the route pre-filled
   - **Taxi** → Ola / Uber / Zoomcar (based on the selected company)

On the **My Bookings** page, each booking with a stored provider URL shows an **"Open Provider Site"** button to reopen it at any time.

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

