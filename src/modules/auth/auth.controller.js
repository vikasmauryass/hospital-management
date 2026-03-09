// src/modules/auth/auth.controller.js

const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const { generateToken } = require("../../utils/generateToken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .populate({
      path: "roles",
      populate: { path: "permissions" }
    });

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user);

  res.json({ token, user });
};