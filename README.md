# Ticket Booking & Reservation System

A scoped ticket-booking backend (think a tiny BookMyShow core), built to learn the one
thing this domain teaches best: **concurrency control — never sell the same seat twice,
even under simultaneous load.** Everything else (auth, caching, rate limiting, list APIs)
is built around that core.

> Design rule followed throughout: **correct first, fast second.**

---

## Tech stack

| Concern | Choice |
|--------|--------|
| Runtime | Node.js, Express 5 |
| ORM / DB | Prisma 7 (SQL **driver adapter** + `pg`) → PostgreSQL |
| Cache / ephemeral state | Redis (`redis` v6 client) |
| Auth | JWT (access + refresh), `bcrypt` |
| Validation | Zod (body **and** query) |
| Dev | nodemon |

---

## Architecture

A clean, consistent layered flow — each layer has one job:

```
HTTP → Router → Middleware → Controller → Service → Prisma → PostgreSQL
                                   │
                                   └── (reads) → Redis cache-aside
```

- **Router** (`src/router`) — maps URL + method, chains middleware.
- **Middleware** (`src/middleware`) — `verifyToken` (JWT), `requireRole` (RBAC factory),
  `validate` (Zod), `rateLimiter` (IP throttle).
- **Controller** (`src/controller`) — HTTP in/out only; no business logic.
- **Service** (`src/services`) — business logic + all DB/Redis access.
- **Schema** (`src/schemas`) — Zod schemas (request validation contracts).
- **Config** (`config`) — Prisma client (driver adapter) and Redis client singletons.

---

## Core features & the *why* (interview-prep notes)

### 1. Concurrency-safe booking — the crown jewel
Two users booking the same seat at the same instant must not both succeed.

- Booking runs inside a **`prisma.$transaction`**.
- The real guarantee is a **DB-level unique constraint**: `@@unique([show_id, seat_id])`
  on `BookingSeat`. Two concurrent bookings for one seat both try to `INSERT` that pair;
  the database lets exactly one win and rejects the other with Prisma error **`P2002`**,
  which maps to **HTTP 409**.
- Key insight: the unique constraint **detects** the conflict — and it only works because
  booking is an **INSERT** (into `BookingSeat`), not a status `UPDATE`. A "read seat →
  check available → update" approach has a race window; an atomic insert against a unique
  index does not.
- **Idempotency key** (`Booking.idempotency_key`, unique) — a double-clicked "confirm"
  with the same key returns the original booking instead of creating a second one. Checked
  *before* the insert.
- **Reservation expiry** — a `pending` booking gets `expires_at = now + 60s`; a background
  sweep (`src/jobs/expireBookings.js`) releases seats whose hold expired.
- *Proven live:* two simultaneous requests for one seat → one `201`, one `409`, no oversell.

### 2. Authentication & authorization (three layers)
- **Authentication:** JWT **access + refresh** tokens; passwords hashed with `bcrypt`.
  Refresh token is stored on the user row and checked on refresh → supports **revocation**.
- **RBAC:** `role` on the user, signed into the access token; `requireRole("admin")`
  (a middleware *factory*) guards admin routes.
- **Ownership (IDOR protection):** payment/booking actions verify `booking.user_id ===
  req.user.id` → `403` otherwise, so you can't act on someone else's booking.
- Login returns the **same** `400 Invalid credentials` whether the email is unknown or the
  password is wrong — deliberate **anti-user-enumeration**.

### 3. Rate limiting (two axes)
- **IP rate limit** (`src/middleware/rateLimiter.js`) — throttles requests per source IP
  (in-memory, fixed window + cooldown). Defends a single hammering client.
- **Account lockout** (`utils/loginAttempts.js`) — counts **failed** logins per **email**,
  locks after a threshold with a cooldown, resets on success. Defends the **distributed**
  brute-force (many IPs, one target) that the IP limiter can't see. Lazy expiry on read.
- Two keys, two jobs: IP = source axis, email = target axis → defense in depth.

### 4. Redis caching (cache-aside)
- Hot read (`event:all`) is cached in Redis with a **TTL** (`EX: 60`).
- **Read:** check cache → hit returns `JSON.parse`; miss → DB → `SET` with TTL → return.
- **Write:** `createEvent` **invalidates** (`del`) the key.
- A Redis failure **falls through to Postgres** (cache never breaks a request) — the
  read/DB/write steps are in separate `try` blocks; only the DB step throws.

### 5. List endpoints (pagination + sort + filter + search)
On `GET /api/seat/seats`, all driven by a single Zod query schema:
- **Offset pagination:** `?page=&limit=` (coerced, defaulted, `limit` capped at 100).
- **Sorting:** `?sort=&order=` — `z.enum` acts as the field **whitelist** (bogus field
  falls back, never reaches `orderBy`).
- **Filter:** `?theater_id=&categoryID=` (exact match).
- **Search:** `?q=` (`contains`, case-insensitive).
- The `count` for `totalPages` uses the **same `where`** as the query, so pagination math
  reflects the *filtered* set.

---

## Data model (Prisma)

`User · Theater · Theater_Availability · Category · Seat · Event · Show · Booking ·
BookingSeat · Payment`

Key relations: Event 1—* Show, Theater 1—* Seat/Show, User 1—* Booking,
Booking *—* Seat via **BookingSeat** (which carries `@@unique([show_id, seat_id])`,
the anti-double-booking safety net). See `prisma/schema.prisma`.

---

## API overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/signUp` | — | Register |
| POST | `/api/auth/signIn` | rate-limited | Login → access token (+ refresh cookie) |
| POST | `/api/auth/refresh` | refresh cookie | New access token |
| POST | `/api/auth/signOut` | refresh cookie | Revoke refresh token |
| POST | `/api/theater/addTheater` | admin | Create theater |
| POST | `/api/event/registerEvent` | admin | Create event |
| GET | `/api/event/events` | auth | List events (Redis-cached) |
| POST | `/api/seat` | auth | Create seat |
| GET | `/api/seat/seats` | auth | List seats — paginate/sort/filter/search |
| POST | `/api/show` | auth | Create show |
| POST | `/api/booking` | auth | Book seat(s) for a show (concurrency-safe) |
| POST | `/api/payment` | auth | Pay for a booking (confirm) |

(Category routes are mounted under `/api`. Check `src/router/*` for exact sub-paths.)

---

## Getting started

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL + Redis)

### 1. Environment
Create a `.env` in the project root:
```bash
PORT=3000
# Postgres (used by docker-compose and the app)
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticket_booking
DB_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_booking?schema=public"
# JWT
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
```

### 2. Start datastores
```bash
# PostgreSQL
docker compose up -d
# Redis (not in compose)
docker run -d --name my-redis -p 6379:6379 redis:7-alpine
```

### 3. Install, migrate, run
```bash
npm install
npx prisma generate
npx prisma migrate dev      # creates the schema in the DB
npm run dev                 # nodemon server.js → http://localhost:3000
```

---

## Design decisions & trade-offs

- **Unique constraint over row locking.** Chose a DB unique index (`@@unique(show_id,
  seat_id)`) as the correctness guarantee rather than `SELECT … FOR UPDATE` (pessimistic)
  or a version column (optimistic). It's simple and the DB enforces it unconditionally.
  *(Building and comparing the lock-based alternatives is on the roadmap.)*
- **Caching is an optimization, never a dependency.** Every cache path falls through to
  Postgres on error; the DB is always the source of truth.
- **Lazy lock expiry** (no background job for the login lockout) — the lock only matters
  at a login attempt, so it's checked/healed on read instead of swept on a timer.
- **In-memory rate-limit/lockout state** — fine for a single instance; see roadmap for the
  multi-instance (Redis) version.

---

## Status & roadmap

Built and verified: auth (JWT + RBAC + ownership), concurrency-safe booking + idempotency
+ expiry, payment, rate limiting (IP + account lockout), Redis caching, and the full
list-endpoint toolkit.

Toward production maturity (see `TODO.md`):
- [ ] Automated tests — unit + an automated **concurrency** test proving no oversell
- [ ] Centralized error handling (one error middleware; stop leaking `error.message`)
- [ ] Observability — structured logging, request IDs, `/health`, metrics
- [ ] Multi-instance-safe state (move rate-limit/lockout maps into Redis)
- [ ] Deployment (containerize the app) + API docs (OpenAPI/Swagger)

---

*A learning project — built by hand, one concept at a time, with correctness proven
before moving on.*
