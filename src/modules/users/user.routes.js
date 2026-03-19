const router = require("express").Router();
const userController = require("./user.controller");

// create user
router.post("/", userController.createUser);

// get users
router.get("/", userController.getUsers);

// assign role
router.post("/:userId/assign-role", userController.assignRoleToUser);

router.delete("/:id", userController.deleteUser);

module.exports = router;