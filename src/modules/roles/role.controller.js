const Role = require("./role.model");
const Permission = require("../permissions/permission.model");

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const { permissionIds } = req.body;

    const role = await Role.create({ name, permissions: permissionIds || [] });
    const populated = await role.populate("permissions");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL ROLES
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ASSIGN PERMISSION
exports.assignPermissionToRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    const role = await Role.findByIdAndUpdate(
      roleId,
      {
        $addToSet: { permissions: { $each: permissionIds } }
      },
      { new: true }
    ).populate("permissions");

    res.json(role);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};