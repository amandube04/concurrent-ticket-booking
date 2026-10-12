const zod = require("zod");

// model Payment { booking_id Int, amount Decimal, payment_status String, paymentType String }
// enums stop typos reaching the DB — adjust the allowed values to your app.
const paymentSchema = zod.object({
  booking_id: zod
    .number()
    .int()
    .positive({ message: "booking_id must be a positive integer" }),
  paymentType: zod.enum(["card", "upi", "netbanking", "wallet"], {
    message: "Invalid payment type",
  }),
  // usually the server sets this; include it only if the client reports it
  payment_status: zod
    .enum(["pending", "success", "failed"], {
      message: "Invalid payment status",
    })
    .optional(),
});

module.exports = { paymentSchema };
