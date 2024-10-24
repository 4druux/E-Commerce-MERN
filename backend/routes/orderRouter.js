const express = require("express");
const {
  createOrder,
  getOrders,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder, // Import fungsi deleteOrder dari controller
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin route untuk melihat semua pesanan
router.get("/", authMiddleware("admin"), getOrders);

// Pengguna biasa melihat pesanan mereka sendiri
router.get("/user-orders", authMiddleware(), getOrdersByUser);

// Membuat pesanan baru
router.post("/", authMiddleware(), createOrder);

// Admin dapat memperbarui status pesanan
router.put("/status", authMiddleware(), updateOrderStatus);

// Admin dapat menghapus pesanan
router.delete("/:orderId", authMiddleware("admin"), deleteOrder); // Tambahkan rute DELETE

module.exports = router;
