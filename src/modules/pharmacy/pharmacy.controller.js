const Pharmacy = require("./pharmacy.model");

const fail = (res, status, message) => res.status(status).json({ error: message });

// 👇 pulls organization from logged-in user
const getScope = (req) => ({
  organization: req.user?.organization?._id || req.user?.organization || null,
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createPharmacy = async (req, res) => {
  try {
    const { name, gst, phone, ms, address } = req.body;

    if (!name || !phone) {
      return fail(res, 400, "name and phone are required");
    }

    const { organization } = getScope(req); // 👈 auto from logged-in user

    const pharmacy = await Pharmacy.create({
      name,
      gst,
      phone,
      ms,
      address,
      organization, // 👈 auto
    });

    const populated = await Pharmacy.findById(pharmacy._id)
      .populate("organization");

    return res.status(201).json(populated);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getPharmacies = async (req, res) => {
  try {
    const { organization } = getScope(req); // 👈 auto filter by user's organization

    const query = {};
    if (organization) query.organization = organization;

    const pharmacies = await Pharmacy.find(query)
      .populate("organization")
      .sort({ createdAt: -1 });

    return res.json(pharmacies);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── GET SINGLE ───────────────────────────────────────────────────────────────
exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate("organization");

    if (!pharmacy) return fail(res, 404, "Pharmacy not found");

    return res.json(pharmacy);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updatePharmacy = async (req, res) => {
  try {
    const { name, gst, phone, ms, address } = req.body;

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return fail(res, 404, "Pharmacy not found");

    if (name !== undefined) pharmacy.name = name;
    if (gst !== undefined) pharmacy.gst = gst;
    if (phone !== undefined) pharmacy.phone = phone;
    if (ms !== undefined) pharmacy.ms = ms;
    if (address !== undefined) pharmacy.address = address || null;
    // organization NOT updated — stays as original scope

    await pharmacy.save();

    const updated = await Pharmacy.findById(pharmacy._id)
      .populate("organization");

    return res.json(updated);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) return fail(res, 404, "Pharmacy not found");

    return res.json({ message: "Pharmacy deleted successfully" });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};