const jwt = require("jsonwebtoken");
const User = require("../users/user.model");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized: no token" });

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });

      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id)
      .populate("roles")
      .populate("pharmacy");

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};