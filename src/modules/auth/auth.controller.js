const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const { generateAccessToken, generateRefreshToken } = require("../../utils/generateToken");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// REGISTER
// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const rolesInput = req.body.roles;
    const roleId = req.body.roleId;
    let rolesArray = [];
    if (rolesInput) {
      rolesArray = Array.isArray(rolesInput) ? rolesInput : [rolesInput];
    } else if (roleId) {
      rolesArray = Array.isArray(roleId) ? roleId : [roleId];
    }

    const pharmacy = req.body.pharmacy || req.body.pharmacyId || null;
    const organization = req.body.organization || null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: rolesArray,
      pharmacy,
      organization,
    });

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("roles").populate("pharmacy");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REFRESH
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id).populate("roles").populate("pharmacy");

    if (!user || !user.refreshToken)
      return res.status(403).json({ message: "Refresh token revoked" });

    const tokenMatch = await bcrypt.compare(token, user.refreshToken);
    if (!tokenMatch)
      return res.status(403).json({ message: "Refresh token mismatch" });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
    }

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};