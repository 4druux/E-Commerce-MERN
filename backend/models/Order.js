const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: Number, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
      imageUrl: { type: String, required: true },
      // Tambahkan subdokumen return di sini
      return: {
        reason: { type: String },
        description: { type: String },
        returnImages: [{ type: String }],
        status: {
          type: String,
          enum: ["Not Returned", "Pending", "Approved", "Rejected"],
          default: "Not Returned",
        },
        createdAt: { type: Date },
      },
    },
  ],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      "Pending",
      "Paid",
      "Processing",
      "Shipped",
      "Completed",
      "Returned",
      "Canceled",
    ],
    default: "Pending",
  },
  statusUpdateHistory: [
    {
      status: {
        type: String,
        enum: [
          "Pending",
          "Paid",
          "Processing",
          "Shipped",
          "Completed",
          "Returned",
          "Canceled",
        ],
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
