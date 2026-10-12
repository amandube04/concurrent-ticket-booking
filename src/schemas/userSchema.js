const zod = require("zod");

const createUserSchema = zod.object({
  email: zod
    .string()
    .trim()
    .email({ message: "Must be valid email structure" })
    .toLowerCase(),
  username: zod
    .string()
    .trim()
    .min(3, { message: "Must be valid user name string" })
    .toLowerCase(),
  password: zod.string().min(8, { message: "Password must be 8+ chars" }),
  bio: zod
    .string()
    .trim()
    .max(150, { message: "Bio cannot be more then 150 characters " })
    .optional(),
});

const loginUserSchema = createUserSchema.omit({
  username: true,
  bio: true,
});

module.exports = {
  createUserSchema,
  loginUserSchema,
};
