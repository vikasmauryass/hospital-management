const mongoose = require("mongoose");
require("../organization/organization.model");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  refreshToken: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);