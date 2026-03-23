const Supplier = require("./supplier.model");

const fail = (res, status, message) => res.status(status).json({ error: message });

// 👇 same helper as product controller — pulls from logged-in user
const getScope = (req) => ({
  pharmacy: req.user?.pharmacy?._id || req.user?.pharmacy || null,
  organization: req.user?.organization?._id || req.user?.organization || null,
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createSupplier = async (req, res) => {
  try {
    const { companyName, email, phone, gstNo, address, product } = req.body;

    if (!companyName || !email || !phone || !gstNo || !product) {
      return fail(res, 400, "companyName, email, phone, gstNo and product are required");
    }

    const existing = await Supplier.findOne({ email });
    if (existing) return fail(res, 400, "A supplier with this email already exists");

    const { pharmacy, organization } = getScope(req); // 👈 auto from logged-in user

    const supplier = await Supplier.create({
      companyName,
      email,
      phone,
      gstNo,
      address: address || null,
      product,
      pharmacy,       // 👈 auto
      organization,   // 👈 auto
    });

    const populated = await Supplier.findById(supplier._id)
      .populate("pharmacy")
      .populate("organization");

    return res.status(201).json(populated);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getSuppliers = async (req, res) => {
  try {
    const { pharmacy, organization } = getScope(req); // 👈 auto filter

    const query = {};
    if (pharmacy) query.pharmacy = pharmacy;
    else if (organization) query.organization = organization;

    const suppliers = await Supplier.find(query)
      .populate("pharmacy")
      .populate("organization")
      .sort({ createdAt: -1 });

    return res.json(suppliers);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate("pharmacy")
      .populate("organization");

    if (!supplier) return fail(res, 404, "Supplier not found");
    return res.json(supplier);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateSupplier = async (req, res) => {
  try {
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
    // pharmacy & organization NOT updated — stays as original scope

    await supplier.save();

    const updated = await Supplier.findById(supplier._id)
      .populate("pharmacy")
      .populate("organization");

    return res.json(updated);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return fail(res, 404, "Supplier not found");
    return res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};