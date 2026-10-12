const zod = require("zod");

const eventSchema = zod.object({
  eventName: zod
    .string()
    .trim()
    .min(1, { message: "Event name is required" })
    .max(100, { message: "Event name cannot be more than 100 characters" }),
  eventType: zod.string().trim().min(1, { message: "Event type is required" }),
  eventDate: zod.coerce.date({ message: "eventDate must be a valid date" }),
});

module.exports = { eventSchema };
