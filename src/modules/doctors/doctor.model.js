// src/modules/doctors/doctor.model.js

const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // Link to the User document (for login)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Link to a Pharmacy (optional)
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      default: null,
    },

    // mirrors: name, email, phone (denormalized for quick reads)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneno: { type: String, default: null },

    // doctor-specific fields
    degree: { type: String, default: null },   // Qualification
    fees: { type: Number, default: null },   // Consultation Fees
    specialist: { type: String, default: null },
  },
  { timestamps: true }   // adds createdAt / updatedAt
);

module.exports = mongoose.model("Doctor", doctorSchema);