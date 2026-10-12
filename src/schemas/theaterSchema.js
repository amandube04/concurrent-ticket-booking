const zod = require("zod");

const theater_availability = zod.object({
  operational_hours: zod
    .string()
    .trim()
    .min(1, { message: "Operational hours cannot be empty" }),
});

const theaterSchema = zod.object({
  theater_name: zod
    .string()
    .trim()
    .min(1, { message: "Theater Name is required" })
    .max(25, { message: "Theater name cannot be more than 25 characters" })
    .regex(/^[\p{L}\s'-]+$/u, {
      message:
        "Name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  address: zod.string().trim().min(1, { message: "Address is required" }),
  theater_availability: theater_availability,
});

module.exports = {
  theaterSchema,
};
