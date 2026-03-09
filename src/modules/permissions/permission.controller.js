const Permission = require("./permission.model");

// Create Permission
exports.createPermission = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Permission.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Permission already exists" });
    }

    const permission = await Permission.create({ name });

    res.status(201).json(permission);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Permissions
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};