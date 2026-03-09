const User = require("./user.model");
const Role = require("../roles/role.model");
// const User = require("./user.model");

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("roles");
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