// src/modules/suppliers/supplier.model.js

const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gstNo: { type: String, required: true },
    address: { type: String, default: null },
    product: { type: String, required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);