const requireRole = (role) => {
  return (req, res, next) => {
    req.user.role === role
      ? next()
      : res
          .status(403)
          .json({ message: "Don't have enough permission to access this" });
  };
};

module.exports = requireRole;
