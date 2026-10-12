# ResourceHub — Shared Resource Booking System

A full-stack web application for managing shared organizational resources (meeting rooms, equipment, vehicles) and coordinating reservations without conflicts.

Built as a solution to the PrimeWave Lab Software Engineering Internship technical assessment.

---

## 🎯 The Problem

Growing organizations struggle to coordinate shared resources through informal channels (chat, email, whiteboards). This leads to:

- **Overlapping reservations** — two teams book the same room
- **Uncertainty** — no one knows what's actually available
- **Lost history** — no record of past usage or patterns

## 💡 The Solution

A centralized booking platform where:

- **Users** browse resources and reserve them for specific time slots
- **The system prevents conflicts** using time-range overlap detection
- **Admins** manage the resource catalogue and oversee all bookings
- **Everyone** sees a clear, live view of what's available

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript** (strict mode) |
| Database | **PostgreSQL** (hosted on Supabase) |
| ORM | **Prisma 7** (with `@prisma/adapter-pg`) |
| Auth | **Custom JWT sessions** (`jose` + `bcryptjs`) |
| Validation | **Zod** |
| Styling | **Tailwind CSS** |

---

## ✨ Features

### Authentication
- Email + password registration with bcrypt hashing
- JWT session stored in HTTP-only cookies (7-day expiry)
- Route protection via Next.js `proxy.ts`
- Two roles: `USER` and `ADMIN`

### Resource Management (Admin)
- Create, edit, and deactivate resources
- Soft-delete (resources preserved for historical reservations)
- Type categorization (Meeting Room, Equipment, Vehicle, etc.)

### Reservations
- Book any resource for a specific time range
- **Overlap detection**: prevents conflicting bookings
- **Past-date protection**: cannot book in the past
- **Cancel any of your own** upcoming reservations
- **Status tracking**: CONFIRMED, CANCELLED, COMPLETED

### Admin Oversight
- Dashboard with statistics
- Full resource table with edit links
- All reservations across all users with status badges

---

## 🔑 The Core Feature: Overlap Detection

Two time intervals `[a1, a2]` and `[b1, b2]` **overlap** if and only if:

```
a1 < b2  AND  a2 > b1
```

Implemented as a single Prisma query:

```typescript
const conflict = await prisma.reservation.findFirst({
  where: {
    resourceId,
    status: 'CONFIRMED',
    AND: [
      { startTime: { lt: end } },
      { endTime: { gt: start } },
    ],
  },
})
```

This handles every edge case:
- Same start time → overlaps ✅
- Back-to-back bookings (10:00–11:00, then 11:00–12:00) → **do not overlap** ✅
- Fully contained ranges → overlap ✅

---

## 🗄️ Database Schema

Three core entities:

- **User** — id, email (unique), name, passwordHash, role, createdAt
- **Resource** — id, name, type, description?, capacity?, location?, isActive, createdAt
- **Reservation** — id, userId (FK), resourceId (FK), startTime, endTime, purpose?, status, createdAt

Indexes on `(resourceId, startTime, endTime)` for fast conflict lookups.

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+ (tested on 22)
- A Supabase account (free tier works)
- Git

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd resource-booking
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database

Create a free project at [supabase.com](https://supabase.com). Then:

- Go to **Project Settings → Database → Connection string → URI**
- Choose **Session pooler** (avoids IPv6 issues from local dev)

### 4. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your values:

```bash
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
SESSION_SECRET="<random 32-byte hex>"
```

Generate a secure `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Apply database migrations
```bash
npx prisma migrate deploy
```

### 6. Seed demo data
```bash
npx tsx prisma/seed.ts
```

This creates:
- **Admin** — `admin@example.com` / `admin123`
- **User** — `user@example.com` / `user123`
- **5 sample resources**

### 7. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in.

---

## 🧪 Testing the Overlap Detection

1. Log in as `user@example.com` / `user123`
2. Go to **Resources → Meeting Room Alpha**
3. Book tomorrow 10:00 → 11:00
4. Try to book tomorrow **10:30 → 11:30** → ❌ **Conflict error**
5. Try to book tomorrow **11:00 → 12:00** → ✅ **Allowed**

---

## 📁 Project Structure

```
resource-booking/
├── app/
│   ├── (auth)/               # Public: login + register
│   ├── (dashboard)/          # Protected: dashboard, resources, reservations, admin
│   └── api/                  # REST API routes
├── components/               # Reusable UI components
├── lib/
│   ├── prisma.ts
│   ├── session.ts
│   ├── auth-helpers.ts
│   └── validators.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── proxy.ts
└── prisma.config.ts
```

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (10 rounds)
- Session cookies are **HTTP-only**, `SameSite=Lax`, `Secure` in production
- JWT signed with HS256
- All API routes validate input with **Zod**
- **Role-based authorization** enforced server-side (`requireAdmin`)
- Ownership checks on cancel operations

---

## 🔭 Potential Improvements

- **Database-level exclusion constraint** using PostgreSQL's `EXCLUDE USING gist`
- **Email notifications** on booking / cancellation
- **Calendar view** (week grid) for availability
- **Resource blackout periods**
- **Rate limiting** on auth endpoints
- **Unit + E2E tests** (Vitest + Playwright)

---

## 📊 ER Diagram

![ER Diagram](./docs/er-diagram.png.png)


[https://dbdiagram.io/d/6accaf8e10dbb6efb5d2470f]

---

## 📹 Demo Video

[Add your YouTube/Loom link here]

---

## 📄 License

MIT
