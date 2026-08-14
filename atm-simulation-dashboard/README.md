# SecureATM — ATM Simulation Dashboard

A full-stack ATM simulation with two-factor login (password + PIN), signup for
new customers, and deposit / withdraw / transfer / logout for existing
customers.

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express REST API
- **Database:** SQLite (via Sequelize) — a single local file, no server or
  install required
- **Auth:** Two-step login (password → 4-digit PIN), JWT sessions, bcrypt
  hashing, account lockout after repeated failed attempts

## Project structure

```
atm-simulation-dashboard/
├── backend/     Express REST API + SQLite models (Sequelize)
│   └── data/    atm_simulation.sqlite is created here on first run
└── frontend/    React dashboard (Vite)
```

## 1. Backend setup

```bash
cd backend
cp .env.example .env    # then edit values as needed
npm install
npm run dev              # starts on http://localhost:5000
```

No database setup step is needed — on first run, Sequelize creates
`backend/data/atm_simulation.sqlite` and the `customers` / `transactions`
tables automatically. Delete that file at any time to reset the app to a
clean state.

Key `.env` values:

| Variable | Purpose |
|---|---|
| `SQLITE_STORAGE_PATH` | Path to the SQLite file (defaults to `backend/data/atm_simulation.sqlite`) |
| `JWT_PREAUTH_SECRET` / `JWT_ACCESS_SECRET` | Separate secrets for the two login stages |
| `MAX_LOGIN_ATTEMPTS` / `LOCK_DURATION_MINUTES` | Account lockout policy |
| `DAILY_WITHDRAWAL_LIMIT` | Per-day withdrawal cap |

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env     # VITE_API_URL should point at the backend
npm install
npm run dev               # starts on http://localhost:5174
```

## How login works (security level)

1. **`POST /api/auth/login/password`** — customer submits email + password.
   On success the server issues a short-lived **pre-auth token** (5 min) —
   this alone cannot access any account data.
2. **`POST /api/auth/login/pin`** — customer submits their 4-digit PIN along
   with the pre-auth token. On success the server issues a full **access
   token** (1 hr) used for every subsequent request.
3. Five failed attempts at either step locks the account for 15 minutes
   (both configurable via `.env`).
4. **`POST /api/auth/logout`** blacklists the current access token
   server-side and the frontend clears its local session.

## API summary

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create a new customer |
| POST | `/api/auth/login/password` | — | Step 1 of login |
| POST | `/api/auth/login/pin` | pre-auth token | Step 2 of login |
| POST | `/api/auth/logout` | access token | Invalidate session |
| GET | `/api/account/profile` | access token | Current balance & profile |
| POST | `/api/transactions/deposit` | access token | Deposit funds |
| POST | `/api/transactions/withdraw` | access token | Withdraw funds |
| POST | `/api/transactions/transfer` | access token | Transfer to another account |
| GET | `/api/transactions/history` | access token | Paginated transaction history |

Transfers run inside a Sequelize/SQLite transaction (`sequelize.transaction`)
so a sender's debit and a recipient's credit either both succeed or both roll
back.

## Notes & next steps for production use

- SQLite is great for local development, demos, and small single-instance
  deployments. For multi-instance or high-concurrency production use, swap
  the `dialect` in `backend/config/db.js` for `postgres` or `mysql` —
  Sequelize makes this a config change, not a rewrite of your models or
  controllers.
- The access-token blacklist used for logout is in-memory — swap it for
  Redis (or short-lived tokens + refresh rotation) in production.
- Add HTTPS, environment-specific CORS origins, and a proper logging/
  monitoring stack before deploying.
- Consider adding email verification and a "forgot PIN" recovery flow.
