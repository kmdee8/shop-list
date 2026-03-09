# 🛒 Shopping List App — Design Plan

## Overview

A one-page shopping list app with two collapsible sections:
- **To Buy** (open by default) — unticked items
- **Done** (collapsed by default) — ticked items

Items move between sections when checked/unchecked.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | **Next.js (React)** | Vercel-native, file-based routing, SSR/SSG support |
| Styling | **Tailwind CSS** | Fast, utility-first, minimal setup |
| State | **React `useState`** | Simple enough; no Redux needed |
| Backend API | **Next.js API Routes** | No separate backend server needed |
| Database | **Supabase** | Managed Postgres, generous free tier, built-in dashboard & auth-ready |
| ORM | **Prisma** | Type-safe DB access, great DX |
| Deployment | **Vercel** | Zero-config for Next.js |

---

## Architecture

```
┌─────────────────────────────────────┐
│           Vercel (hosted)           │
│                                     │
│  ┌──────────────────────────────┐   │
│  │      Next.js App             │   │
│  │                              │   │
│  │  ┌────────────────────────┐  │   │
│  │  │  Frontend (React UI)   │  │   │
│  │  │  - ShoppingList page   │  │   │
│  │  │  - ToBuy section       │  │   │
│  │  │  - Done section        │  │   │
│  │  └──────────┬─────────────┘  │   │
│  │             │ fetch()        │   │
│  │  ┌──────────▼─────────────┐  │   │
│  │  │  API Routes (/api/*)   │  │   │
│  │  │  - GET  /api/items     │  │   │
│  │  │  - POST /api/items     │  │   │
│  │  │  - PATCH /api/items/id │  │   │
│  │  │  - DELETE /api/items/id│  │   │
│  │  └──────────┬─────────────┘  │   │
│  │             │                │   │
│  │  ┌──────────▼─────────────┐  │   │
│  │  │  Prisma ORM            │  │   │
│  │  └──────────┬─────────────┘  │   │
│  └─────────────┼────────────────┘   │
│                │                    │
└────────────────┼────────────────────┘
                 │
┌────────────────▼────────────────────┐
│        Supabase (hosted)            │
│  ┌──────────────────────────────┐   │
│  │   Supabase Postgres (DB)     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Single table is all we need
CREATE TABLE items (
  id         SERIAL PRIMARY KEY,
  name       TEXT    NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT false,
  position   INT     NOT NULL DEFAULT 0,   -- for ordering
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Prisma model:
```prisma
model Item {
  id        Int      @id @default(autoincrement())
  name      String
  done      Boolean  @default(false)
  position  Int      @default(0)
  createdAt DateTime @default(now())
}
```

---

## API Routes

| Method | Route | Body | Description |
|---|---|---|---|
| `GET` | `/api/items` | — | Fetch all items |
| `POST` | `/api/items` | `{ name }` | Add a new item |
| `PATCH` | `/api/items/[id]` | `{ done }` | Toggle done/undone |
| `DELETE` | `/api/items/[id]` | — | Delete an item |

---

## Frontend Components

```
src/app/
  page.tsx                ← Single page app

src/components/
  ShoppingList.tsx        ← Root component, fetches data
  Section.tsx             ← Reusable collapsible section
  ItemRow.tsx             ← Single item with checkbox + delete
  AddItemForm.tsx         ← Input + Add button
```

### Component Behaviour
- **`Section`** — accepts `title`, `defaultOpen`, and `children`. Toggles open/closed with a chevron arrow.
- **`ItemRow`** — clicking the checkbox calls `PATCH /api/items/[id]` and optimistically moves the item to the other section.
- **`AddItemForm`** — calls `POST /api/items` and prepends the item to the To Buy section.

---

## UI Wireframe

```
┌──────────────────────────────────┐
│  🛒 My Shopping List             │
├──────────────────────────────────┤
│  [  Add item...          ] [Add] │
├──────────────────────────────────┤
│  ▼ To Buy (3)                    │
│  ┌────────────────────────────┐  │
│  │ ☐  Milk               🗑  │  │
│  │ ☐  Eggs               🗑  │  │
│  │ ☐  Bread              🗑  │  │
│  └────────────────────────────┘  │
│                                  │
│  ▶ Done (2)                      │
│  (collapsed)                     │
└──────────────────────────────────┘
```

---

## Vercel + Supabase Deployment Plan

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, password, and region
3. Once provisioned, go to **Project Settings → Database**
4. Note the two connection strings you need:
   - **Session mode (pooled)** — used for normal queries: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
   - **Direct connection** — used for migrations: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

### Step 2 — Configure environment variables

Create a `.env` file locally (and add the same vars in the Vercel dashboard):

```env
# Pooled connection — used by Prisma at runtime (via PgBouncer)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct connection — used by Prisma Migrate
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

> ⚠️ Add `.env` to `.gitignore` — never commit secrets.

### Step 3 — Configure Prisma

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 4 — Run migrations

```bash
npx prisma migrate dev --name init
```

Prisma uses `DIRECT_URL` for the migration and `DATABASE_URL` (pooled) for runtime queries.

### Step 5 — Push to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. In **Environment Variables**, add `DATABASE_URL` and `DIRECT_URL` (from Step 2)
4. Deploy — Vercel will detect Next.js automatically

```bash
git push origin main  # Vercel auto-deploys on push
```

---

## Key Considerations

| Topic | Decision |
|---|---|
| **Optimistic UI** | Update state immediately on check, revert on API error |
| **Loading states** | Disable checkbox while PATCH is in-flight |
| **Empty states** | Show "Nothing here yet 🎉" in each section when empty |
| **Persistence** | All data in Supabase Postgres — survives page refresh |
| **Auth** | Not needed for v1; Supabase Auth is an easy upgrade path later |
| **Mobile** | Tailwind makes it responsive by default |
| **Connection pooling** | Use `?pgbouncer=true` in `DATABASE_URL` for Vercel Serverless Functions |

---

## Suggested Build Order

1. ✅ Scaffold Next.js app with Tailwind
2. ✅ Set up Prisma + Supabase Postgres schema
3. ✅ Build API routes (GET, POST, PATCH, DELETE)
4. ✅ Build `Section` collapsible component
5. ✅ Build `ItemRow` with checkbox toggle
6. ✅ Build `AddItemForm`
7. ✅ Wire everything together in `page.tsx`
8. ✅ Deploy to Vercel with Supabase env vars

