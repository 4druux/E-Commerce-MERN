const Order = require("../models/Order");
// const socket = require("../socket"); 

// Fungsi untuk membuat order baru
exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user._id, // Pastikan userId diambil dari pengguna yang sedang login
      username: req.user.username,
    };
    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ message: "Failed to create order", error });
  }
};

// Fungsi untuk mengambil semua pesanan (hanya admin)
exports.getOrders = async (req, res) => {
  try {
    // Pastikan hanya admin yang dapat mengakses fungsi ini
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }

    // Mengambil semua pesanan dari semua pengguna
    const orders = await Order.find();
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// Fungsi untuk mengambil pesanan pengguna yang sedang login
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Mengambil userId dari pengguna yang sedang login (autentikasi melalui middleware)
    const orders = await Order.find({ userId }); // Cari pesanan yang sesuai dengan userId

    if (!orders || orders.length === 0) {
      return res
        .status(200)
        .json({ message: "No orders found for this user.", orders: [] });
    }

    res.status(200).json({ orders }); // Kembalikan pesanan ke frontend
  } catch (error) {
    console.error("Failed to fetch orders for user:", error);
    res.status(500).json({ message: "Failed to fetch orders for user", error });
  }
};

/// Fungsi untuk mengupdate status pesanan (akses admin, dan user bisa cancel, return, atau complete)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Daftar status yang valid
    const validStatuses = [
      "Pending",
      "Paid",
      "Processing",
      "Shipped",
      "Completed",
      "Returned",
      "Canceled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Jika pengguna bukan admin, mereka hanya bisa melakukan cancel, return, atau complete
    if (req.user.role !== "admin") {
      if (order.status === "Paid" && status === "Canceled") {
        order.status = status; // Pengguna hanya bisa cancel jika status Paid
      } else if (
        order.status === "Shipped" &&
        (status === "Completed" || status === "Returned")
      ) {
        order.status = status; // Pengguna hanya bisa return atau complete jika status Shipped
      } else {
        return res.status(403).json({
          message:
            "Invalid action. You can only update orders that are Paid or Shipped.",
        });
      }
    } else {
      // Admin bisa mengubah status ke semua status yang valid
      order.status = status;
    }

    await order.save();

    // Emit event untuk memberitahukan ke client bahwa pesanan telah diperbarui
    // const io = socket.getIO();
    // io.emit("orderUpdated", { orderId, status });

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Failed to update order status:", error);
    res.status(500).json({ message: "Failed to update order status", error });
  }
};

// Fungsi untuk menghapus pesanan (akses admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Hanya admin yang dapat menghapus pesanan
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit event untuk memberitahukan ke client bahwa pesanan telah dihapus
    // const io = socket.getIO();
    // io.emit("orderDeleted", { orderId });

    res.status(200).json({ message: "Order deleted successfully", order });
  } catch (error) {
    console.error("Failed to delete order:", error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
};
