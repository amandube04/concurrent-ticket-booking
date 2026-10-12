# Ticket Booking & Reservation System — Project Plan

A deliberately **scoped** booking system (think a tiny BookMyShow core). The goal is
NOT to clone BookMyShow — it's to learn the one thing this domain teaches better than
any other beginner project: **concurrency control — never sell the same seat twice,
even under load.**

> Rule for staying sane: **make it correct first, fast second.** "High throughput"
> is Phase 4, not Phase 1.

---

## The core problem (why this project exists)

Two users click "book seat 5A" at the same moment:

```
User A: read seat 5A → "available" ✅
User B: read seat 5A → "available" ✅   ← both read before either writes
User A: write "booked by A"
User B: write "booked by B"             ← 💥 seat sold twice (oversell)
```

This is a **race condition**. Defeating it (transactions, row locking, optimistic
concurrency, unique constraints, idempotency) is the crown-jewel backend skill.

---

## Scope

**In scope (MVP):**
- `Event` / `Show` — a movie/concert with a fixed set of seats
- `Seat` — belongs to a show; status: `available` | `held` | `booked`
- `User` — reuse existing auth (JWT)
- Booking flow: **hold** seat(s) → **confirm** → or **auto-expire** the hold
- The one guarantee: a seat can never be booked twice, ever, even concurrently

**Out of scope (on purpose — avoid the "fancy or bad" trap):**
- Real payments (fake/stub it)
- Seat-map UI / graphics
- Microservices, CDN, sharding
- Email/SMS delivery (just enqueue a job in Phase 4)

---

## Data model (sketch — we'll refine in Phase 1)

```
User (have it)
  id, email, password, ...

Event
  id, name, venue, startsAt, createdAt

Seat
  id, eventId (FK → Event), label ("5A"),
  status ("available" | "held" | "booked"),
  version (Int, for optimistic concurrency),
  heldUntil (DateTime?, when a hold expires)

Booking
  id, userId (FK → User), eventId (FK → Event),
  status ("pending" | "confirmed" | "cancelled" | "expired"),
  idempotencyKey (unique), createdAt

BookingSeat  (join: a booking covers one or more seats)
  bookingId (FK), seatId (FK)
  @@unique([seatId])   ← DB-level safety net against double-booking
```

Key relations: Event 1—* Seat, User 1—* Booking, Booking *—* Seat (via BookingSeat).

---

## Build plan (mapped to the backend roadmap)

### Phase 1 — Production-grade API basics
- [ ] Model `Event`, `Seat` in Prisma; migrate
- [ ] Endpoints: create event (+ seats), list events, list seats for an event
- [ ] **Zod validation** on all input; **central error handler**; correct status codes
- [ ] Pagination on the event/seat lists
- Milestone: clean, validated read/write of events & seats.

### Phase 2 — The crown jewel: correct booking under concurrency
- [ ] `hold` endpoint: mark seats `held` + set `heldUntil`, inside a transaction
- [ ] `confirm` endpoint: `held` → `booked`, create Booking + BookingSeat
- [ ] **Prevent double-booking** — implement and compare BOTH:
      - Pessimistic: `SELECT ... FOR UPDATE` (lock the row so B waits for A)
      - Optimistic: `version` column + retry on conflict
- [ ] **Unique constraint** on `BookingSeat.seatId` as the last-line safety net
- [ ] **Idempotency key** so a double-clicked "confirm" books once
- ⚠️ **SQL safety:** when writing raw `SELECT ... FOR UPDATE`, use **parameterized
      placeholders** (`$1`), never string interpolation of user input. Prisma's
      normal methods are already parameterized.
- Milestone: two concurrent bookings for one seat → exactly one wins.

### Phase 3 — Prove it
- [ ] Unit-test the booking service logic
- [ ] **Concurrency test**: fire N simultaneous confirm requests at one seat; assert
      exactly one succeeds and the rest get a clean 409 Conflict
- [ ] Integration tests (supertest) against a real test DB
- Milestone: `npm test` proves no oversell under concurrency.

### Phase 4 — Make it "high throughput"
- [ ] **Load test** (k6 / autocannon) — watch behavior under real concurrency
- [ ] **Reservation expiry** — a background job (BullMQ) releases expired holds
- [ ] **Redis** for fast seat-hold state / caching hot event reads
- [ ] DB **indexing** (on `eventId`, `status`) + connection pooling tuning
- [ ] Dockerize + deploy
- Milestone: survives a load test without overselling; holds auto-release.

---

## Concepts you'll walk away understanding

- ACID transactions and *why* they matter (atomic hold+confirm)
- Pessimistic (locking) vs optimistic (versioning) concurrency — the trade-off
- Unique constraints as a correctness guarantee, not just validation
- Idempotency (safe retries / double-clicks)
- Isolation levels (why "read committed" still allows the oversell above)
- Indexing and query planning under load
- Background jobs and TTL-based expiry
- Load testing to *prove* correctness, not assume it

---

## How we'll work
One concept at a time, built by hand. Quiz at each milestone (same as the auth
work). Correct first, fast second.
