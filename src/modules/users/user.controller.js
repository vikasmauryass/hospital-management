const User = require("./user.model");
const bcrypt = require("bcryptjs");
const Role = require("../roles/role.model");
// const User = require("./user.model");

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, pharmacyId, roleId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      pharmacy: pharmacyId,
      roles: roleId ? [roleId] : []
    });
    console.log("Saved user:", user);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("roles").populate("pharmacy");
    res.json(users);
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

    user.roles.push(...roleIds);

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};