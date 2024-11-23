const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateToken = require("../middlewares/vatlidate-token");

// user registration

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    await User.create(req.body);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your user is blocked. Contact the administrator." });
    }


    // check if password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

    return res.status(200).json({ token, message: "Login successfull" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get current user
router.get("/current-user", validateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res
      .status(200)
      .json({ data: user, message: "User fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get all users
router.get("/get-all-users", validateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ data: users, message: "Users fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// update user
router.put("/update-user", validateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, req.body);
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
