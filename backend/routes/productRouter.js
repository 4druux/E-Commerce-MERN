const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllProducts,
  addProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  addReviewToProduct,
  deleteReviewToProduct,
  replyReviewToProduct,
  sellProduct,
} = require("../controllers/productController");

router.get("/all", getAllProducts);
router.post("/add", addProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProductById);
router.delete("/:id", deleteProductById);
router.post("/:id/review", authMiddleware(), addReviewToProduct);
router
  .route("/admin/:productId/reviews/:reviewId?")
  .get(authMiddleware("admin"), deleteReviewToProduct) // GET untuk mendapatkan review dari produk tertentu, hanya bisa diakses admin
  .delete(authMiddleware("admin"), deleteReviewToProduct); // DELETE untuk menghapus review berdasarkan reviewId, hanya admin
router.put(
  "/admin/:productId/reviews/:reviewId/reply",
  authMiddleware("admin"),
  replyReviewToProduct
);
router.post("/:id/sell", sellProduct); // Tambahkan route untuk menjual produk

module.exports = router;
