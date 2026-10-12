const userAuthCheck = require("../../utils/loginAttempts");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return res.status(400).json({ status: "fail", errors });
    }
    req.body = result.data;
    next();
  };
};

const checkUserAttempt = (req, res, next) => {
  const { email } = req.body;
  const accountLocked = userAuthCheck.isLocked(email);
  if (accountLocked) {
    return res.status(429).json({
      message: `Too many failed attempts. Try again in sometime.`,
    });
  }
  return next();
};

module.exports = { validate, checkUserAttempt };
