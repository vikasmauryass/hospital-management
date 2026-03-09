// src/modules/permissions/permission.model.js

const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: { type: String, unique: true }
});

module.exports = mongoose.model("Permission", permissionSchema);