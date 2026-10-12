const router = require("express").Router();
const { validate: validateRequest } = require("../middleware/validate");
const { theaterSchema } = require("../schemas/theaterSchema");
const theaterController = require("../controller/theaterController");
const { verifyToken } = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

router.post(
  "/addTheater",
  verifyToken,
  requireRole("admin"),
  validateRequest(theaterSchema),
  theaterController.addTheater,
);

module.exports = router;
