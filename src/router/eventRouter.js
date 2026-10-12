const { registerEvent, fetchEvents } = require("../controller/eventController");
const requireRole = require("../middleware/requireRole");
const { validate: validateEvent } = require("../middleware/validate");
const { verifyToken } = require("../middleware/verifyToken");
const { eventSchema } = require("../schemas/eventSchema");
const router = require("express").Router();

router.post(
  "/registerEvent",
  verifyToken,
  requireRole("admin"),
  validateEvent(eventSchema),
  registerEvent,
);

router.get("/events", verifyToken, fetchEvents);

module.exports = router;
