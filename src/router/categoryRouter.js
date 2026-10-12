const { seatCategory } = require("../controller/categoryController");
const { validate: validateCategory } = require("../middleware/validate");
const { verifyToken } = require("../middleware/verifyToken");
const { categorySchema } = require("../schemas/categorySchema");
const router = require("express").Router();

router.post(
  "/category",
  verifyToken,
  validateCategory(categorySchema),
  seatCategory,
);

module.exports = router;
