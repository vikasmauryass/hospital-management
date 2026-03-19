// src/modules/suppliers/supplier.controller.js

const Supplier = require("./supplier.model");

const fail = (res, status, message) => res.status(status).json({ error: message });

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createSupplier = async (req, res) => {
  try {
    const { companyName, email, phone, gstNo, address, product } = req.body;

    if (!companyName || !email || !phone || !gstNo || !product) {
      return fail(res, 400, "companyName, email, phone, gstNo and product are required");
    }

    const existing = await Supplier.findOne({ email });
    if (existing) return fail(res, 400, "A supplier with this email already exists");

    // ✅ Read pharmacyId from the logged-in user — not from request body
    const pharmacyId = req.user?.pharmacy?._id || req.user?.pharmacy || null;

    const supplier = await Supplier.create({
      companyName,
      email,
      phone,
      gstNo,
      address: address || null,
      product,
      pharmacy: pharmacyId,
    });

    const populated = await Supplier.findById(supplier._id).populate("pharmacy");
    res.status(201).json(populated);
  } catch (error) {
    fail(res, 500, error.message);
  }
};

// ─── GET ALL (only suppliers belonging to the logged-in user's pharmacy) ──────
exports.getSuppliers = async (req, res) => {
  try {
    // ✅ Filter by the user's pharmacy automatically
    const pharmacyId = req.user?.pharmacy?._id || req.user?.pharmacy || null;

    const query = pharmacyId ? { pharmacy: pharmacyId } : {};

    const suppliers = await Supplier.find(query)
      .populate("pharmacy")
      .sort({ createdAt: -1 });

    res.json(suppliers);
  } catch (error) {
    fail(res, 500, error.message);
  }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate("pharmacy");
    if (!supplier) return fail(res, 404, "Supplier not found");
    res.json(supplier);
  } catch (error) {
    fail(res, 500, error.message);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateSupplier = async (req, res) => {
  try {
    // ✅ pharmacyId is NOT accepted from body — it stays as the user's pharmacy
    const { companyName, email, phone, gstNo, address, product } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return fail(res, 404, "Supplier not found");

    if (email && email !== supplier.email) {
      const taken = await Supplier.findOne({ email });
      if (taken) return fail(res, 400, "Email already in use by another supplier");
    }

    if (companyName !== undefined) supplier.companyName = companyName;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (gstNo !== undefined) supplier.gstNo = gstNo;
    if (address !== undefined) supplier.address = address || null;
    if (product !== undefined) supplier.product = product;
    // pharmacy is intentionally NOT updated here

    await supplier.save();

    const updated = await Supplier.findById(supplier._id).populate("pharmacy");
    res.json(updated);
  } catch (error) {
    fail(res, 500, error.message);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return fail(res, 404, "Supplier not found");
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    fail(res, 500, error.message);
  }
};