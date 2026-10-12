const { addShow } = require("../controller/showController");
const requireRole = require("../middleware/requireRole");
const { validate } = require("../middleware/validate");
const { verifyToken } = require("../middleware/verifyToken");
const { showSchema } = require("../schemas/showSchema");
const router = require("express").Router();

router.post(
  "/",
  verifyToken,
  requireRole("admin"),
  validate(showSchema),
  addShow,
);

module.exports = router;
