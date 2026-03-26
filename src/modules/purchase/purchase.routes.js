const router = require("express").Router();
const purchaseController = require("./purchase.controller");
const { protect } = require("../../modules/middlewares/auth.middleware");

router.post("/", protect, purchaseController.createPurchase);
router.get("/", protect, purchaseController.getPurchases);
router.get("/:id", protect, purchaseController.getPurchase);
router.delete("/:id", protect, purchaseController.deletePurchase);

module.exports = router;