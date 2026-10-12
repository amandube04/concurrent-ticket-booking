const zod = require("zod");

// model Category { categoryType String, price_modifier Decimal }
const categorySchema = zod.object({
  categoryType: zod
    .string()
    .trim()
    .min(1, { message: "Category type is required" })
    .max(30, { message: "Category type cannot be more than 30 characters" }),
  // money: JSON has no Decimal; client sends a number, Prisma stores as Decimal
  price_modifier: zod
    .number()
    .positive({ message: "Price modifier must be a positive number" }),
});

module.exports = { categorySchema };
