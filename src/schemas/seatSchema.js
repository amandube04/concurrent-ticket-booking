const zod = require("zod");

// Seat is its own entity (separate endpoint), so its payload carries the FKs
// it belongs to: theater_id and categoryID. Format only — existence of those
// ids is checked in the service against the DB.
const seatSchema = zod.object({
  seatNumber: zod
    .string()
    .trim()
    .min(1, { message: "seatNumber cannot be empty" }),
  theater_id: zod
    .number()
    .int()
    .positive({ message: "theater_id must be a positive integer" }),
  categoryID: zod
    .number()
    .int()
    .positive({ message: "categoryID must be a positive integer" }),
});

const paginationSchema = zod.object({
  page: zod.coerce.number().int().min(1).default(1).catch(1),
  limit: zod.coerce.number().int().min(1).max(100).default(20).catch(20),
  sort: zod.enum(["seat_id", "seatNumber"]).default("seat_id").catch("seat_id"),
  order: zod.enum(["asc", "desc"]).default("asc").catch("asc"),
  theater_id: zod.coerce.number().int().positive().optional().catch(undefined),
  categoryID: zod.coerce.number().int().positive().optional().catch(undefined),
  q: zod.string().trim().min(1).optional().catch(undefined),
});

module.exports = { seatSchema, paginationSchema };
