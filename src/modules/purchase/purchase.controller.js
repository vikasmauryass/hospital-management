const mongoose = require("mongoose");
const Purchase = require("../purchase/purchase.model");
const PurchaseItem = require("../purchaseItem/purchaseItem.model");
const Inventory = require("../inventory/inventory.model");

const fail = (res, status, message) => res.status(status).json({ error: message });

// 👇 only pharmacy from logged-in user
const getPharmacy = (req) =>
  req.user?.pharmacy?._id || req.user?.pharmacy || null;

// ─── CREATE PURCHASE ──────────────────────────────────────────────────────────
exports.createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNo, supplierId, purchaseDate, grandTotal, items } = req.body;

    // ─── Validation ───────────────────────────────────────────────────────────
    if (!invoiceNo || !supplierId || !purchaseDate) {
      return fail(res, 400, "invoiceNo, supplierId and purchaseDate are required");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return fail(res, 400, "items array is required and must not be empty");
    }

    if (!items.every((item) => item.medicineName)) {
      return fail(res, 400, "Each item must have a medicineName");
    }

    // ─── Qty + Free must be whole number ──────────────────────────────────────
    for (let i = 0; i < items.length; i++) {
      const qty = parseFloat(items[i].quantity || 0);
      const free = parseFloat(items[i].freeQty || 0);
      const total = qty + free;

      if (Math.floor(total) !== total) {
        return fail(res, 400, `Row ${i + 1}: Qty + Free must equal a whole strip`);
      }
    }

    const pharmacy = getPharmacy(req); // 👈 auto from logged-in user

    // ─── Create Purchase ──────────────────────────────────────────────────────
    const [purchase] = await Purchase.create(
      [{ invoiceNo, supplier: supplierId, purchaseDate, grandTotal: grandTotal || 0, pharmacy }],
      { session }
    );

    // ─── Loop items ───────────────────────────────────────────────────────────
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.medicineName) continue;

      // ─── Create PurchaseItem ───────────────────────────────────────────────
      const [purchaseItem] = await PurchaseItem.create(
        [
          {
            purchase: purchase._id,
            product: item.productId || null,
            medicineName: item.medicineName,
            hsn: item.hsn || null,
            batchNo: item.batchNo || null,
            expiryDate: item.expiryDate || null,
            quantity: parseFloat(item.quantity || 0),
            freeQty: parseFloat(item.freeQty || 0),
            gstPercentage: parseFloat(item.gstPercentage || 0),
            costPrice: parseFloat(item.costPrice || 0),
            mrp: parseFloat(item.mrp || 0),
            discount: parseFloat(item.discount || 0),
            composition: item.composition || null,
            total: parseFloat(item.total || 0),
          },
        ],
        { session }
      );

      // ─── Inventory logic ───────────────────────────────────────────────────
      const existingInventory = await Inventory.findOne({
        product: item.productId,
        batchNumber: item.batchNo,
        expiryDate: item.expiryDate,
      }).session(session);

      if (existingInventory) {
        // increment quantity if same batch already exists
        existingInventory.quantityStrips += parseFloat(item.quantity || 0);
        await existingInventory.save({ session });
      } else {
        await Inventory.create(
          [
            {
              product: item.productId || null,
              purchaseItem: purchaseItem._id,
              batchNumber: item.batchNo || null,
              expiryDate: item.expiryDate || null,
              quantityStrips: parseFloat(item.quantity || 0) + parseFloat(item.freeQty || 0),
              quantityTablets: 0,
              mrp: parseFloat(item.mrp || 0),
              purchasePrice: parseFloat(item.costPrice || 0),
              gstPercentage: parseFloat(item.gstPercentage || 0),
              pharmacy, // 👈 only pharmacy
            },
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    const populated = await Purchase.findById(purchase._id)
      .populate("supplier")
      .populate("pharmacy");

    return res.status(201).json({
      message: "Purchase saved successfully",
      purchase: populated,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return fail(res, 500, error.message);
  }
};

// ─── GET ALL PURCHASES ────────────────────────────────────────────────────────
exports.getPurchases = async (req, res) => {
  try {
    const pharmacy = getPharmacy(req); // 👈 filter by user's pharmacy only

    const query = {};
    if (pharmacy) query.pharmacy = pharmacy;

    const purchases = await Purchase.find(query)
      .populate("supplier")
      .populate("pharmacy")
      .sort({ createdAt: -1 });

    return res.json(purchases);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET SINGLE PURCHASE WITH ITEMS ───────────────────────────────────────────
exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier")
      .populate("pharmacy");

    if (!purchase) return fail(res, 404, "Purchase not found");

    const items = await PurchaseItem.find({ purchase: purchase._id })
      .populate("product");

    return res.json({ purchase, items });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── DELETE PURCHASE ──────────────────────────────────────────────────────────
exports.deletePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id).session(session);
    if (!purchase) return fail(res, 404, "Purchase not found");

    await PurchaseItem.deleteMany({ purchase: req.params.id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return fail(res, 500, error.message);
  }
};