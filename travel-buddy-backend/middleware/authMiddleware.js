const jwt = require("jsonwebtoken");
const logger = require("../utils/logger"); // Logger

const protect = async (req, res, next) => {
  let token;
  logger.info("Authorization middleware triggered"); // Log middleware use

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, email: decoded.email };

      logger.info(`Token verified for user ID: ${req.user.id}`); // Log success
      next();
    } catch (err) {
      logger.error(`Invalid token: ${err.message}`); // Log error
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    logger.warn("No token provided"); // Log warning
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
