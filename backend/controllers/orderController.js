const Order = require("../models/Order");
const Product = require("../models/Product"); 

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

    // Update soldCount untuk setiap item dalam order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { soldCount: item.quantity }, // Tambahkan jumlah yang dipesan ke soldCount
      });
    }

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

    // Validasi input
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ message: "Order ID and status are required" });
    }

    // Cek order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validasi status perubahan
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

    // Update status order dan tambahkan riwayat status
    order.status = status;
    order.statusUpdateHistory.push({
      status: status,
      date: new Date(),
    });

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
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

// Dalam orderController.js
exports.createReturn = async (req, res) => {
  try {
    const { orderId } = req.params; // Ambil dari params
    const { reason, description, returnImages, productId, size } = req.body;

    // Validasi input
    if (!reason || !productId || !size) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Cari order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Cari item yang akan di-return
    const itemToReturn = order.items.find(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (!itemToReturn) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    // Validasi status order
    if (order.status !== "Shipped") {
      return res.status(400).json({
        message: "Order must be in 'Shipped' status to create a return",
      });
    }

    // Update item dengan data return
    itemToReturn.return = {
      reason,
      description,
      returnImages,
      status: "Pending",
      createdAt: new Date(),
    };

    // Update status order
    order.status = "Returned";

    // Simpan perubahan
    await order.save();

    res.status(200).json({
      message: "Return request created successfully",
      order,
    });
  } catch (error) {
    console.error("Failed to create return:", error);
    res.status(500).json({
      message: "Failed to create return",
      error: error.message,
    });
  }
};

// Fungsi untuk mengupdate status return (admin)
exports.updateReturnStatus = async (req, res) => {
  try {
    const { orderId, productId, size, status } = req.body;

    // Pastikan hanya admin yang bisa
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Cari order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Cari item yang di-return
    const itemToUpdate = order.items.find(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (!itemToUpdate) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    // Update status return
    itemToUpdate.return.status = status;

    // Simpan perubahan
    await order.save();

    res.status(200).json({
      message: "Return status updated",
      order,
    });
  } catch (error) {
    console.error("Failed to update return status:", error);
    res.status(500).json({
      message: "Failed to update return status",
      error: error.message,
    });
  }
};
