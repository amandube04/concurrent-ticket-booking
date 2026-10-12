const { addSeat, listSeats } = require("../controller/seatController");
const { validate } = require("../middleware/validate");
const { verifyToken } = require("../middleware/verifyToken");
const { seatSchema } = require("../schemas/seatSchema");
const router = require("express").Router();

router.post("/", validate(seatSchema), addSeat);

router.get("/seats", verifyToken, listSeats);

module.exports = router;
