const router = require("express").Router();
const userController = require("./user.controller");

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/:userId/assign-role", userController.assignRoleToUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;