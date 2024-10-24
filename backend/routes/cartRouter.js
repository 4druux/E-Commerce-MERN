const express = require("express");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  checkoutCart,
  clearCart,
} = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware"); // Pastikan ini adalah fungsi middleware
const router = express.Router();

// Terapkan authMiddleware di setiap route yang membutuhkan autentikasi
router.get("/", authMiddleware(), getCart); // GET /api/cart - Mengambil data keranjang pengguna
router.post("/add", authMiddleware(), addToCart); // POST /api/cart/add - Menambahkan item ke keranjang
router.post("/remove", authMiddleware(), removeFromCart); // POST /api/cart/remove - Menghapus item dari keranjang
router.post("/update", authMiddleware(), updateCartQuantity); // POST /api/cart/update - Memperbarui kuantitas item di keranjang
router.post("/checkout", authMiddleware(), checkoutCart); // POST /api/cart/checkout - Melakukan checkout dan membuat order
router.post("/clear", authMiddleware(), clearCart); // POST /api/cart/clear - Clear all items in cart after payment

module.exports = router;
