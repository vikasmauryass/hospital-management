const router = require("express").Router();
const roleController = require("./role.controller");

router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:roleId", roleController.getRoleById);
router.delete("/:roleId", roleController.deleteRole);

module.exports = router;