const router = require("express").Router();
const productController = require("./product.controller");
const { protect } = require("../../modules/middlewares/auth.middleware");

router.post("/", protect, productController.createProduct);
router.get("/", protect, productController.getProducts);
router.get("/:id", protect, productController.getProduct);
router.put("/:id", protect, productController.updateProduct);
router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;