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
# Server runs at http://localhost:5000
```

### 5. Start the frontend (Terminal 2)

```bash
cd client
npm install
npm run dev
# App runs at http://localhost:5173
```

## CSRF Protection

The backend uses the **double-submit cookie** pattern (`csrf-csrf` v4+). On every state-changing request (POST / PUT / PATCH / DELETE), the client automatically:

1. Pre-warms the CSRF token at app startup via `GET /api/csrf-token`, which sets the `_csrf` cookie and returns the signed token.
2. Attaches the token as the `x-csrf-token` request header on every state-changing request.
3. Retries once with a fresh token if the server returns a `403` CSRF rejection.

Invalid or missing CSRF tokens are returned as **HTTP 403** (not 500).

> **Implementation note:** `csrf-csrf` v4 exports `generateCsrfToken` (not `generateToken`). The server correctly calls `generateCsrfToken(req, res)` to issue tokens.

## Features

- 🔍 **Smart Search** — Auto-suggest Indian cities, compare all transport modes
- 🧠 **AI Scoring** — Price (40%), Time (30%), Comfort (15%), Eco (10%), Distance (5%)
- 🏆 **Best Pick Panel** — Highlighted best option with human-like explanation
- 🤖 **TravelBot** — Floating chatbot that answers questions about current results
- 🌓 **Dark/Light Theme** — Persisted via localStorage
- 🔐 **Auth** — JWT + httpOnly cookies, protected Bookings / Profile / Settings
- 📱 **Responsive** — Mobile-first, Bootstrap 5.3

## Mock Mode

When the backend is not running, the app automatically falls back to client-side mock data so you can explore the full UI without a database.

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

