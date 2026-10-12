const router = require("express").Router();
const authController = require("../controller/authController");
const validateUser = require("../middleware/validate");
const limitLogin = require("../middleware/rateLimiter");
const { createUserSchema, loginUserSchema } = require("../schemas/userSchema");

router.post(
  "/signUp",
  validateUser.validate(createUserSchema),
  authController.signUp,
);
router.post(
  "/signIn",
  validateUser.validate(loginUserSchema),
  limitLogin,
  validateUser.checkUserAttempt,
  authController.signIn,
);
router.post("/refresh", authController.refreshToken);
router.post("/signOut", authController.signOut);

module.exports = router;
