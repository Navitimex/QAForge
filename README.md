# QAForge — QA Interview Prep

A full-stack study platform for QA engineers. Take adaptive exams that automatically prioritize your weakest topics, track your streak, and review every answer with explanations.

<!-- Add a screenshot here once deployed: ![Dashboard](docs/screenshot-dashboard.png) -->

---

## Features

- **Weighted question selection** — weak topics surface more often (`weight = 1 + (1 − accuracy) × 2`)
- **Adaptive scoring** — open questions are self-rated (knew / partial / missed); only multiple-choice and true/false count toward the final score
- **Streak tracking** — consecutive-day practice keeps your streak alive
- **Exam modes** — _Practice_ (relaxed, see answers immediately) or _Exam_ (focus mode, answers hidden until the end)
- **Resume & cancel** — leave an exam at any time; progress is saved answer-by-answer, resume or cancel from History
- **Google OAuth** for learners + **credentials login** for the admin panel
- **Admin panel** — add questions manually or import via JSON batch

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Database | MongoDB Atlas M0 + Mongoose v9 |
| Auth | NextAuth v4 (GoogleProvider + CredentialsProvider) |
| Validation | Zod v4 — shared between client and server |
| Language | TypeScript 5 |
| Fonts | DM Sans + Space Grotesk |

---

## Getting started

### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://cloud.mongodb.com) free cluster (M0)
- A [Google Cloud](https://console.cloud.google.com) OAuth 2.0 client ID

### 1. Clone and install

```bash
git clone https://github.com/Navitimex/QAForge.git
cd QAForge
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` (see `.env.example` for full descriptions):

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `SEED_ADMIN_EMAIL` | Email for the admin account |
| `SEED_ADMIN_PASSWORD` | Password for the admin account (change before seeding) |

**Google OAuth redirect URI** (add in Google Cloud Console):
- Dev: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://your-app.vercel.app/api/auth/callback/google`

### 3. Seed the database

```bash
npm run seed
```

Creates topics, sample questions, and the admin user defined in `.env.local`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
├── (auth)/login/          # Google + admin login
├── (app)/                 # Protected user shell (sidebar + mobile nav)
│   ├── dashboard/         # Global stats, weak topics, recent exams
│   ├── exam/new/          # Exam configuration (topics, difficulty, size, mode)
│   ├── exam/[id]/         # Active exam (nav dots, skip, answer submission)
│   ├── review/[id]/       # Post-exam review with per-question breakdown
│   └── history/           # All past exams (resume / cancel / review)
├── (admin)/admin/questions/  # Admin (/admin/questions): add or import questions
└── api/                   # Route handlers

lib/
├── api.ts                 # API route helpers: ok/fail envelopes, ObjectId guard
├── exam-weights.ts        # Weighted random sampling algorithm
├── services/
│   ├── exam-service.ts    # Pure exam-creation logic (question filter, title, scorableCount)
│   ├── scoring-service.ts # Pure answer-evaluation logic (isCorrect, score, stats delta)
│   ├── stats-service.ts   # User stats aggregation (global accuracy, streak)
│   └── topic-service.ts   # Topic queries (active topics, id→name map)
├── utils.ts               # scoreColor, fmtTime, calcStreak, ...
└── validations.ts         # Zod schemas — shared between client and server
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript check (no emit) |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run seed` | Seed the database |

---

## Running tests

```bash
npm run test          # run once
npm run test:watch    # watch mode
```

Tests cover the pure business-logic modules: `lib/exam-weights.ts`, `lib/utils.ts`, `lib/services/exam-service.ts`, `lib/services/scoring-service.ts`.

---

## Deploy to Vercel (100% free)

Everything runs on free tiers: **Vercel Hobby** (hosting + serverless API) and **MongoDB Atlas M0** (512 MB database). No credit card needed.

### 1. MongoDB Atlas (free M0 cluster)

1. Create an account at [cloud.mongodb.com](https://cloud.mongodb.com) and create a **free M0 cluster**.
2. *Database Access* → create a DB user with password.
3. *Network Access* → **Allow access from anywhere** (`0.0.0.0/0`) — required because Vercel serverless functions have dynamic IPs.
4. Copy the connection string and append a DB name, e.g. `...mongodb.net/qaforge?retryWrites=true&w=majority`.

### 2. Push to GitHub

```bash
git push origin main
```

`.env.local`/`.env` never reach the repo (gitignored) — only `.env.example` is committed.

### 3. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → import the GitHub repo (framework auto-detected: Next.js).
2. Before deploying, add the **Environment Variables**:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Atlas connection string (step 1) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://<your-app>.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth client |
| `NEXT_PUBLIC_APP_NAME` | `QAForge` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` |

3. Deploy. Every push to `main` redeploys automatically.

### 4. Google OAuth for production

In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth client:

- **Authorized JavaScript origins**: `https://<your-app>.vercel.app`
- **Authorized redirect URIs**: `https://<your-app>.vercel.app/api/auth/callback/google`

### 5. Seed production data

Run the seed locally pointing at the Atlas URI (the same one used in Vercel):

```bash
npm run seed   # uses MONGODB_URI from .env.local
```

> Tip: temporarily set `MONGODB_URI` in `.env.local` to the production Atlas URI, seed, then switch back if you use a separate dev database.

### Free-tier notes

- The Mongoose connection is cached per serverless instance (`lib/mongodb.ts`), so the M0 connection limit (500) is never an issue for personal use.
- Vercel Hobby includes 100 GB-hours of serverless execution per month — far more than this app needs.
- Atlas M0 stays active during inactivity; only the cold start of a serverless function (~1s) is noticeable.

---

## License

MIT — see [LICENSE](LICENSE).
