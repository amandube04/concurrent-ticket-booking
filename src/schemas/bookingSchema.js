const zod = require("zod");

// A booking request = which show + which seats the user wants.
// status is NOT in the payload — the server sets it ("pending" -> "confirmed").
// user_id is NOT in the payload — it comes from the auth token, never the client.
const bookingSchema = zod.object({
  show_id: zod
    .number()
    .int()
    .positive({ message: "show_id must be a positive integer" }),
  idempotency_key: zod.string().uuid(),
  // one booking can grab several seats: a non-empty array of seat ids
  seat_ids: zod
    .array(
      zod.number().int().positive({ message: "each seat id must be positive" }),
    )
    .min(1, { message: "You must select at least one seat" }),
});

module.exports = { bookingSchema };
