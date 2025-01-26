const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Assuming you have a user model
const logger = require("../utils/logger");

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  logger.info("Register request received");
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully!", user });
    logger.info(`User registered successfully: ${email}`);
  } catch (err) {
    logger.error(`Error registering user: ${err.message}`); // Log error
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  logger.info("Login request received"); // Log request initiation
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login failed: User not found (${email})`); // Log warning
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for ${email}`); // Log warning
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    logger.info(`User logged in successfully: ${email}`); // Log success
    res.json({ message: "Login successful", token });
  } catch (err) {
    logger.error(`Error logging in: ${err.message}`); // Log error
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// Get user profile (protected route example)
exports.getUserProfile = async (req, res) => {
  logger.info(`Fetching profile for user ID: ${req.user.id}`); // Log user info

  try {
    const user = await User.findByPk(req.user.id); // Sequelize example
    if (!user) {
      logger.warn(`User not found for ID: ${req.user.id}`); // Log warning
      return res.status(404).json({ message: "User not found" });
    }

    logger.info(`Profile fetched successfully for user ID: ${req.user.id}`); // Log success
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    logger.error(
      `Error fetching profile for user ID ${req.user.id}: ${err.message}`
    ); // Log error
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};
