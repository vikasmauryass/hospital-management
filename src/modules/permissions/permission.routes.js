const router = require("express").Router();
const permissionController = require("./permission.controller");

router.post("/", permissionController.createPermission);
router.get("/", permissionController.getPermissions);

module.exports = router;