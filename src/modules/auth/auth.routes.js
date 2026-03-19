// src/modules/auth/auth.routes.js

const router = require("express").Router();
const authController = require("./auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);   // ← new
router.post("/logout", authController.logout);    // ← new

module.exports = router;