const Organization = require("./organization.model");

// CREATE ORGANIZATION
exports.createOrganization = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const organization = await Organization.create({ name, email, phone });

    res.status(201).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL ORGANIZATIONS
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ORGANIZATION BY ID
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE ORGANIZATION
exports.updateOrganization = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE ORGANIZATION
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({ message: "Organization deleted successfully", organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};