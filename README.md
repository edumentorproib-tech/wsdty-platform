# WSDTY — Advance and Enrich Your Life

A financial-intelligence and self-development platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **The World** — Interactive D3 globe coloured by GDP/macro metrics, daily fundamentals dashboard, and trade decision analysis (TDA) journal
- **Future** — PropTradeCalc integration + personal trade log
- **Diary** — Daily reflection journal with mood/discipline tracking, calendar heatmap, and streak analytics

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase Postgres |
| Storage | Supabase Storage (chart images) |
| Deployment | Vercel (free tier) |

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd wsdty-platform
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Navigate to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local and fill in your Supabase credentials
```

### 4. Run the database migration

In the Supabase dashboard, open the **SQL Editor** and paste the contents of:

```
supabase/migrations/001_initial_schema.sql
```

Run it. This creates all tables, indexes, RLS policies, and the chart-images storage bucket.

### 5. Enable Google OAuth (optional)

1. In Supabase dashboard → **Authentication → Providers → Google**
2. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
3. Add your Client ID and Secret to Supabase
4. Add `https://<your-domain>/auth/callback` to authorised redirect URIs

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import into [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Everything runs on the free tier of both Vercel and Supabase.

## Database Schema

| Table | Purpose |
|-------|---------|
| `trades` | Manual trade log entries |
| `trade_ideas` | TDA form submissions |
| `diary_entries` | Daily diary with mood/discipline scores |
| `trade_reflections` | Per-trade reflections linked from diary |

All tables have Row Level Security enabled — users can only read and write their own rows.
