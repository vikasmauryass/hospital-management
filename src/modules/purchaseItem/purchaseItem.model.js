const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    medicineName: { type: String, required: true },
    hsn: { type: String, default: null },
    batchNo: { type: String, default: null },
    expiryDate: { type: Date, default: null },
    quantity: { type: Number, default: 0 },
    freeQty: { type: Number, default: 0 },
    gstPercentage: { type: Number, enum: [0, 5, 12, 18], default: 0 },
    costPrice: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    composition: { type: String, default: null },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseItem", purchaseItemSchema);