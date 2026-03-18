# Idea Wedge Playbook

A Vite + React + Supabase internal tool for finding, researching, comparing, and validating business ideas.

## What it includes

- persistent idea reviews in Supabase
- shared team comments per review
- compare any two ideas side-by-side
- scoring gates for market, wedge, MVP, distribution, and structural risk
- Google sign-in via Supabase Auth
- local demo mode when Supabase env vars are missing
- deployment config for both Cloudflare Pages and Vercel

## Tech stack

- Vite 8
- React 19
- TypeScript 5.9
- Supabase JS 2.x

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

If the Supabase variables are not set, the app falls back to seeded local demo data so you can still inspect the UI.

## Supabase setup

### 1. Create a project

Create a Supabase project and enable Google under **Authentication → Providers**.

### 2. Run the SQL migration

Run the SQL in `supabase/migrations/001_initial_schema.sql`.

This creates:
- `idea_reviews`
- `idea_comments`
- RLS policies for authenticated internal use

### 3. Add environment variables

Set the Vite environment variables locally and in your deployment platform.

## Google Auth notes

The app uses Supabase OAuth with Google. In Supabase, configure:
- your local callback URL, typically `http://localhost:5173`
- your production URL once deployed

## Deployment

### Vercel

1. Import the repo in Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

`vercel.json` is already included.

### Cloudflare Pages

1. Create a Pages project connected to your repo.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add the same Vite env vars.

`wrangler.toml` is included for direct upload / CLI-based workflows.

## Data model

### idea_reviews

Stores the complete review, verdict, and score snapshot.

### idea_comments

Stores discussion attached to a review.

## Important caveats

This version is structured to be ready to stand up, but a real multi-team rollout should likely add:
- organization scoping
- stronger audit history
- attachment support
- richer reviewer attribution
- notification workflows

## Suggested next extensions

- Notion sync for approved ideas
- activity log / revision history
- assignment and due dates
- richer filtering and saved views
- attachment uploads to Supabase Storage
