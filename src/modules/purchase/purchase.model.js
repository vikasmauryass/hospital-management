const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    purchaseDate: { type: Date, required: true },
    grandTotal: { type: Number, default: 0 },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);