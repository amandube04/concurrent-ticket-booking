const { processPayment } = require("../controller/paymentController");
const { paymentSchema } = require("../schemas/paymentSchema");
const router = require("express").Router();
const { verifyToken } = require("../middleware/verifyToken");
const { validate: validatePayment } = require("../middleware/validate");

router.post("/", verifyToken, validatePayment(paymentSchema), processPayment);

module.exports = router;
