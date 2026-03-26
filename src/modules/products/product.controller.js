const Product = require("./product.model");

const fail = (res, status, message) => res.status(status).json({ error: message });

// helper — extract pharmacy & organization from logged-in user
const getScope = (req) => ({
  pharmacy: req.user?.pharmacy?._id || req.user?.pharmacy || null,
  organization: req.user?.organization?._id || req.user?.organization || null,
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const {
      medicineName,
      manufacturerName,
      // boxComposition,
      medicineType,
      gstPercentage,
      hsnCode,
      composition,
      price,
      strip,
      quantity
    } = req.body;

    if (!medicineName || !manufacturerName || !strip ||
      !quantity || !medicineType ||
      gstPercentage === undefined || !hsnCode || !composition || !price) {
      return fail(res, 400, "All fields are required");
    }

    if (![0, 5, 12, 18].includes(Number(gstPercentage))) {
      return fail(res, 400, "GST must be 0, 5, 12 or 18");
    }

    const { pharmacy, organization } = getScope(req); // 👈 auto from logged-in user

    const product = await Product.create({
      medicineName,
      manufacturerName,
      // boxComposition,
      medicineType,
      gstPercentage: Number(gstPercentage),
      hsnCode,
      composition,
      price: Number(price),
      pharmacy,
      organization,
      strip,
      quantity
    });

    const populated = await Product.findById(product._id)
      .populate("pharmacy")
      .populate("organization");

    return res.status(201).json(populated);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const { pharmacy, organization } = getScope(req); // 👈 auto filter by user scope

    // build query — filter by pharmacy or organization if available
    const query = {};
    if (pharmacy) query.pharmacy = pharmacy;
    else if (organization) query.organization = organization;

    const products = await Product.find(query)
      .populate("pharmacy")
      .populate("organization")
      .sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("pharmacy")
      .populate("organization");

    if (!product) return fail(res, 404, "Product not found");
    return res.json(product);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const {
      medicineName,
      manufacturerName,
      // boxComposition,
      medicineType,
      gstPercentage,
      hsnCode,
      composition,
      price,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, 404, "Product not found");

    if (gstPercentage !== undefined && ![0, 5, 12, 18].includes(Number(gstPercentage))) {
      return fail(res, 400, "GST must be 0, 5, 12 or 18");
    }

    if (medicineName !== undefined) product.medicineName = medicineName;
    if (manufacturerName !== undefined) product.manufacturerName = manufacturerName;
    // if (boxComposition !== undefined) product.boxComposition = boxComposition;
    if (strip == undefined) product.strip = strip;
    if (medicineType !== undefined) product.medicineType = medicineType;
    if (gstPercentage !== undefined) product.gstPercentage = Number(gstPercentage);
    if (hsnCode !== undefined) product.hsnCode = hsnCode;
    if (composition !== undefined) product.composition = composition;
    if (price !== undefined) product.price = Number(price);
    // pharmacy & organization are NOT updated — stays as original user's scope

    await product.save();

    const updated = await Product.findById(product._id)
      .populate("pharmacy")
      .populate("organization");

    return res.json(updated);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return fail(res, 404, "Product not found");
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};