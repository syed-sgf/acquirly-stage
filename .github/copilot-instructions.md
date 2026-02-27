# Copilot / AI Agent Instructions for Acqyrly (stage)

Purpose: Give AI coding agents the minimal, actionable context to be productive in this repo.

- **Big picture:** This is a Next.js 16 (app-router) TypeScript web app using React 19. Server data uses Prisma + PostgreSQL via `prisma/`. Authentication is handled with `next-auth` + Prisma adapter. PDF generation uses `@react-pdf/renderer`. UI components live in `components/` and route-level UI lives under `app/`.

- **Key files/locations:**
  - `app/` — Next.js app routes and layouts (server components by default).
  - `components/` — reusable client components.
  - `lib/` — data access, business logic, auth options (see `lib/db.ts`, `lib/auth.ts`, `lib/pro-logic.ts`).
  - `prisma/` — Prisma schema and migrations.
  - `public/` — static assets and exported docs.
  - `next.config.mjs`, `tsconfig.json`, `package.json` — project config and scripts.

- **Development commands:** (root)
  - Install: `npm install`
  - Dev server: `npm run dev` (uses `next dev --turbopack`).
  - Build: `npm run build` (runs `prisma generate && next build`).
  - Start (production): `npm run start`.
  - Lint: `npm run lint`.
  - Note: `.env.example` should be copied to `.env.local` for local dev (see README).

- **Environment variables to set:**
  - `DATABASE_URL` — Prisma DB connection.
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — NextAuth Google provider (see `lib/auth.ts`).
  - `NEXT_PUBLIC_APP_ENV` — controls `X-Robots-Tag` header in `next.config.mjs`.

- **Patterns & conventions (project-specific):**
  - Server vs Client: `app/` routes are server components by default. Add `"use client"` at the top of a file to make it a client component.
  - Prisma client singleton: `lib/db.ts` uses a `globalThis` guard to avoid multiple PrismaClient instances in dev. Always import `prisma` from `lib/db.ts` (or `lib/prisma.ts`) rather than newing up `PrismaClient`.
  - NextAuth: `lib/auth.ts` exports `authOptions`. Sessions use JWT (`session.strategy = "jwt"`) and the Prisma adapter. When modifying callbacks or session shape, update both `lib/auth.ts` and any session-typed files in `types/`.
  - PDFs: `components/pdf/` and `app/pdfs/` contain server-rendered PDF components using `@react-pdf/renderer`.
  - Pro / gated logic lives in `lib/pro-logic.ts` and `lib/entitlements/` — check these when changing feature access.

- **Build / deploy notes:**
  - `postinstall` runs `prisma generate` so CI that does `npm ci` will generate Prisma client automatically.
  - Keep `prisma generate` in mind if changing `prisma/schema.prisma` — run `npx prisma generate` and `npx prisma migrate` locally.

- **What to look for when changing APIs or data models:**
  - Update `prisma/schema.prisma`, then run `prisma generate` and relevant migrations.
  - Update `lib/prisma`/`lib/db.ts` usage sites and `lib/auth.ts` callbacks that map DB user fields onto session tokens.

- **Debugging tips:**
  - Prisma logs SQL queries in dev (`log: ['query']` in `lib/db.ts`). Use this to trace DB calls.
  - `NEXT_PUBLIC_APP_ENV` set to non-`prod` disables indexing headers to prevent crawlers (see `next.config.mjs`).

- **Examples (quick lookups):**
  - Where NextAuth is configured: `lib/auth.ts`
  - Prisma client pattern: `lib/db.ts`
  - Build script: `package.json` -> `build` (runs `prisma generate && next build`)

If anything here is unclear or you'd like more details (example workflows, code patterns, or CI specifics), tell me which area to expand and I'll iterate.
