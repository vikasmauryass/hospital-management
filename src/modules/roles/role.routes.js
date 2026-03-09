// src/modules/roles/role.routes.js

const router = require("express").Router();
const roleController = require("./role.controller");

router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.post("/:roleId/assign-permission", roleController.assignPermissionToRole);
module.exports = router;