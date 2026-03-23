// src/utils/generateToken.js
const jwt = require("jsonwebtoken");
console.log("JWT_SECRET:", process.env.JWT_SECRET);           // ← here
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET); // ← here
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};