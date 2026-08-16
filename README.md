# Fut 7 El Jaguar — Next.js 15 Migration

Full migration of the original multi-page vanilla JS/Express app into a single
**Next.js 15 + React 19 + Tailwind v4** application, with adaptive dark/light
mode and no separate backend — Next.js API routes talk directly to your
Postgres (Neon) database.

## What's included

- **Auth**: simple session login (`jaguar` / `jaguar123`, same as original demo creds) — see `src/lib/auth.ts` to swap in real auth for production.
- **Dark/light mode**: toggle in the navbar (top right), persisted + respects system preference, via `next-themes`. All colors driven by CSS variables in `src/app/globals.css`, matching the original brand palette (`#0a1628` dark navy / `#f0f4f8` light).
- **Data layer**: every endpoint from `backend/server.js` (categorias, equipos, jugadores, rol, goles, penales, disenos, horarios, colores, publico, partidos-dia, rendimiento, config) ported 1:1 to `src/app/api/**/route.ts`, using the same SQL against the same schema (`schema.sql`, included).
- **Pages** (`src/app/(app)/...`, all protected + share a category selector):
  - `/menu` — dashboard, category CRUD, module navigation
  - `/equipos` — team CRUD (name, color, escudo)
  - `/equipos/[id]/jugadores` — player CRUD per team (number, photo, baja/activo toggle)
  - `/rol` — jornadas (rounds) + match results editor
  - `/horarios` — weekly match scheduling
  - `/puntos` — standings table, computed live from played matches in Rol
  - `/graficas` — matches-per-day and monthly-performance charts (Recharts) + income/prize configuration

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL (same DB the old backend used)
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## Notes on scope / what's simplified vs. the original

The original project's `rol` (schedule generator) and `horarios` (drag & drop
scheduler) modules had very elaborate client-side interactions (drag-and-drop
calendar building, an auto-suggestion engine, per-player goal tracking
accordions across jornadas). Those are reimplemented here with equivalent
**functionality** (create rounds, log scores, mark rounds as played, build a
weekly schedule) using clean forms/tables instead of 1:1 replicating every
drag-and-drop animation — that level of interaction fidelity is a good next
phase if you want it (happy to build it out, e.g. with `@dnd-kit`).

`disenos` (credential/design gallery) and `publico` API routes are ported and
ready to use, but no UI page was built for them yet in this pass — the
original `editor-central.html` / `galeria-disenos.html` were the most
visually complex, HTML5-canvas-heavy files in the project (1,100+ and 600
lines) and are good candidates for a focused follow-up.

## Stack

Next.js 15.5 (App Router) · React 19 · Tailwind CSS v4 · next-themes ·
lucide-react · recharts · `pg` (node-postgres) against the same Neon/Postgres DB.
# Soccer_Match_System
