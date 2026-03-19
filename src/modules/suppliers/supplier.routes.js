// src/modules/suppliers/supplier.routes.js

const router = require("express").Router();
const supplierController = require("./supplier.controller");
const { protect } = require("../../modules/middlewares/auth.middleware.js"); // ← your existing middleware

router.post("/", protect, supplierController.createSupplier);
router.get("/", protect, supplierController.getSuppliers);
router.get("/:id", protect, supplierController.getSupplier);
router.put("/:id", protect, supplierController.updateSupplier);
router.delete("/:id", protect, supplierController.deleteSupplier);

module.exports = router;