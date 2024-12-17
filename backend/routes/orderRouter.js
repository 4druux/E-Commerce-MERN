const express = require("express");
const {
  createOrder,
  getOrders,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
  createReturn,
  updateReturnStatus,
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
router.delete("/:orderId", authMiddleware("admin"), deleteOrder);

router.post("/:orderId/return", authMiddleware(), createReturn);

router.put("/return-status", authMiddleware("admin"), updateReturnStatus);

module.exports = router;
