const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    manufacturerName: { type: String, required: true },
    // boxComposition: { type: String, required: true },
    strip: { type: String, required: true },
    quantity: { type: String, required: true },
    medicineType: { type: String, required: true },
    gstPercentage: { type: Number, enum: [0, 5, 12, 18], required: true },
    hsnCode: { type: String, required: true },
    composition: { type: String, required: true },
    price: { type: Number, required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);