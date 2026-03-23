const User = require("./user.model");
const bcrypt = require("bcryptjs");

// CREATE USER
// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // handle roles — could be a single string ID or an array
    const rolesInput = req.body.roles;
    const roleId = req.body.roleId;
    let rolesArray = [];
    if (rolesInput) {
      rolesArray = Array.isArray(rolesInput) ? rolesInput : [rolesInput];
    } else if (roleId) {
      rolesArray = Array.isArray(roleId) ? roleId : [roleId];
    }

    // handle pharmacy — could be string ID or null
    const pharmacy = req.body.pharmacy || req.body.pharmacyId || null;

    // handle organization — could be string ID or null
    const organization = req.body.organization || null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      pharmacy,
      organization,
      roles: rolesArray
    });

    const populated = await User.findById(user._id)
      .populate("roles")
      .populate("pharmacy")
      .populate("organization");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("roles")
      .populate("pharmacy")
      .populate("organization");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("roles")
      .populate("pharmacy")
      .populate("organization");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ASSIGN ROLE
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.roles.push(...roleIds);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};