const router = require("express").Router();
const organizationController = require("./organization.controller");

router.post("/", organizationController.createOrganization);
router.get("/", organizationController.getOrganizations);
router.get("/:id", organizationController.getOrganizationById);
router.put("/:id", organizationController.updateOrganization);
router.delete("/:id", organizationController.deleteOrganization);

module.exports = router;