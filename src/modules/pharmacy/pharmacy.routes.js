const router = require("express").Router();
const pharmacyController = require("./pharmacy.controller");

// create pharmacy
router.post("/", pharmacyController.createPharmacy);

// get all pharmacy
router.get("/", pharmacyController.getPharmacies);

// get single pharmacy
router.get("/:id", pharmacyController.getPharmacy);

// update pharmacy
router.put("/:id", pharmacyController.updatePharmacy);

// delete pharmacy
router.delete("/:id", pharmacyController.deletePharmacy);

module.exports = router;