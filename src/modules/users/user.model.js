// src/modules/users/user.model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  refreshToken: {
    type: String,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);