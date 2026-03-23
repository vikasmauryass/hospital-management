const router = require("express").Router();
const pharmacyController = require("./pharmacy.controller");
const { protect } = require("../../modules/middlewares/auth.middleware");

router.post("/", protect, pharmacyController.createPharmacy);
router.get("/", protect, pharmacyController.getPharmacies);
router.get("/:id", protect, pharmacyController.getPharmacy);
router.put("/:id", protect, pharmacyController.updatePharmacy);
router.delete("/:id", protect, pharmacyController.deletePharmacy);

module.exports = router;