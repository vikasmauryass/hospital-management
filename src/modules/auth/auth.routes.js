// src/modules/auth/auth.routes.js

const router = require("express").Router();
const authController = require("./auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;