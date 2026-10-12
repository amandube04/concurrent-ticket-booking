# TODO — ticket-booking

Backlog toward making this an operationally-mature (enterprise-grade) service.
See `ticket-booking-plan.md` for the original feature plan.

## Operability (next focus)

- [ ] **Centralized error handling**
  - Replace the duplicated per-controller `try/catch` with one Express error-handling
    middleware (the 4-arg `(err, req, res, next)` signature), registered **after** all
    routes in `server.js`.
  - Introduce a typed/`AppError` class (carry `statusCode` + a safe client `message`);
    controllers `next(err)` instead of building responses themselves.
  - Stop leaking `error.message` (DB internals) to clients — map known errors to safe
    messages, return a generic 500 for the rest. Keep the real detail in logs only.

- [ ] **Better observability**
  - Structured logging (e.g. `pino`) instead of `console.log/error` — JSON logs with levels.
  - Request/correlation IDs: assign an id per request, attach to every log line for that
    request (so one request's logs can be traced end-to-end).
  - A `GET /health` (and ideally `/ready`) endpoint that checks DB + Redis connectivity.
  - (Later) basic metrics — request count/latency/error rate (e.g. `prom-client`).

## Known residuals (smaller)

- [ ] `createEvent` Redis `del` is not awaited (fire-and-forget) — await or `.catch`.
- [ ] List reads (`/seat/seats`) are intentionally uncached — revisit if they get hot.
