const zod = require("zod");

// model Show { eventID Int, theater_id Int, showTime DateTime, base_price Decimal }
// eventID + theater_id are FKs the client sends; existence is checked in the service.
const showSchema = zod.object({
  eventID: zod
    .number()
    .int()
    .positive({ message: "eventID must be a positive integer" }),
  theater_id: zod
    .number()
    .int()
    .positive({ message: "theater_id must be a positive integer" }),
  showTime: zod.coerce.date({ message: "showTime must be a valid date" }),
  base_price: zod
    .number()
    .positive({ message: "base_price must be a positive number" }),
});

module.exports = { showSchema };
