const Role = require("./role.model");

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.create({ name });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL ROLES
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ROLE BY ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.roleId);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE ROLE
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.roleId);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ message: "Role deleted successfully", role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};