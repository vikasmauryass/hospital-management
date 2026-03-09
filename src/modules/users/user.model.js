// src/modules/users/user.model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);