const router = require("express").Router();
const { bookingSeat } = require("../controller/bookingController");
const { validate } = require("../middleware/validate");
const { verifyToken } = require("../middleware/verifyToken");
const { bookingSchema } = require("../schemas/bookingSchema");

router.post("/", verifyToken, validate(bookingSchema), bookingSeat);

module.exports = router;
