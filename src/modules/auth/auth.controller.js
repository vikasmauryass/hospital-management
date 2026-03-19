// src/modules/auth/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const { generateAccessToken, generateRefreshToken } = require("../../utils/generateToken");

// ── helpers ──────────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,          // JS cannot read it
  secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ── register ─────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { name, email, password, roleId, pharmacyId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: roleId ? [roleId] : [],
      pharmacy: pharmacyId || null,
    });

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── login ─────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate({
      path: "roles",
      populate: { path: "permissions" },
    });
    console.log("Found user:", user?.email);                    // ← add
    console.log("Password in DB:", user?.password);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Generate both tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist hashed refresh token in DB
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Send refresh token as httpOnly cookie
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

// ── refresh ───────────────────────────────────────────────────────────────────

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // Verify signature first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // Find user and validate stored token
    const user = await User.findById(decoded.id).populate({
      path: "roles",
      populate: { path: "permissions" },
    });

    if (!user || !user.refreshToken)
      return res.status(403).json({ message: "Refresh token revoked" });

    const tokenMatch = await bcrypt.compare(token, user.refreshToken);
    if (!tokenMatch)
      return res.status(403).json({ message: "Refresh token mismatch" });

    // ── Rotate: issue brand-new pair ──────────────────────────────────────────
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

// ── logout ────────────────────────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      // Decode without verifying so we can clear even expired tokens
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