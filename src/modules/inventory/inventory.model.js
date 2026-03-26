const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    purchaseItem: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseItem", default: null },
    batchNumber: { type: String, default: null },
    expiryDate: { type: Date, default: null },
    quantityStrips: { type: Number, default: 0 },
    quantityTablets: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    gstPercentage: { type: Number, default: 0 },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);