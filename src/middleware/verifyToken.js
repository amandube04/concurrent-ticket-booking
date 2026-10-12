require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token Missing" });
  }
  try {
    const verifiedPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = verifiedPayload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Access Token" });
  }
};
