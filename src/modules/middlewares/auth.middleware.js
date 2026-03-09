// src/middlewares/auth.middleware.js

const jwt = require("jsonwebtoken");
const User = require("../modules/users/user.model");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).populate({
    path: "roles",
    populate: { path: "permissions" }
  });

  req.user = user;
  next();
};