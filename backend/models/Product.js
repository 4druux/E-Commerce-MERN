const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  reviewText: { type: String },
  reviewImages: [{ type: String }],
  size: {
    type: String,
    required: function () {
      return this.isNew; // Hanya wajib pada review yang baru
    },
  },
  createdAt: { type: Date, default: Date.now },
  adminReply: { type: String }, // Tambahan field untuk balasan admin
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: [{ type: String }],
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: [{ type: String }],
    bestseller: { type: Boolean, default: false },
    reviews: [reviewSchema],
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
