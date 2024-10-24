const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, default: "Unknown" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        size: { type: String },
        imageUrl: { type: String }, // Tambahkan ini ke item schema
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Timestamps otomatis di level Cart
);

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
