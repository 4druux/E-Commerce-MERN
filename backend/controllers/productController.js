const Product = require("../models/Product");
const User = require("../models/User");

// Handler untuk mendapatkan semua produk
const getAllProducts = async (req, res) => {
  try {
    // Mengurutkan produk berdasarkan waktu pembuatan (produk terbaru di paling atas)
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Handler untuk memperbarui produk berdasarkan ID
const updateProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
  }
};

// Handler untuk menambah produk
const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error });
  }
};

// Handler untuk mendapatkan produk berdasarkan ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Handler untuk menghapus produk berdasarkan ID
const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus produk", error });
  }
};

// Handler untuk menambahkan review ke produk
const addReviewToProduct = async (req, res) => {
  try {
    const { rating, reviewText, reviewImages, size } = req.body;

    // Validasi tambahan untuk memastikan size ada dan tidak undefined
    const sizeString = String(size).trim();

    if (!sizeString || sizeString === "undefined") {
      return res
        .status(400)
        .json({ message: "Size is required and cannot be undefined" });
    }

    const productId = req.params.id;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const review = {
      userId: user._id,
      username: user.username,
      rating,
      reviewText,
      reviewImages: reviewImages || [], // Gambar opsional, bisa kosong
      size: sizeString, // Gunakan sizeString yang dipastikan berupa string
    };

    product.reviews.push(review);

    await product.save();
    res.status(200).json({ message: "Review added successfully", product });
  } catch (error) {
    console.error("Error in addReviewToProduct:", error);
    res.status(500).json({ message: "Failed to add review", error });
  }
};

// Handler untuk menambahkan balasan admin ke produk
const replyReviewToProduct = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { adminReply } = req.body;

    // Validasi untuk memastikan adminReply dikirim
    if (!adminReply) {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    // Temukan produk berdasarkan ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Temukan review berdasarkan ID
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Update admin reply di review tersebut
    review.adminReply = adminReply;
    await product.save();

    res.status(200).json({ message: "Reply added successfully", review });
  } catch (error) {
    console.error("Error in replyReviewToProduct:", error);
    res.status(500).json({ message: "Failed to reply to review", error });
  }
};

// Handler untuk admin agar bisa melihat dan menghapus review dari produk tertentu
const deleteReviewToProduct = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    // Temukan produk berdasarkan ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Jika tidak ada reviewId, kirimkan semua review dari produk tertentu (admin melihat review produk)
    if (!reviewId) {
      return res.status(200).json({ reviews: product.reviews });
    }

    // Jika ada reviewId, admin ingin menghapus review tersebut dari produk yang dipilih
    const updatedReviews = product.reviews.filter(
      (review) => review._id.toString() !== reviewId
    );

    product.reviews = updatedReviews;
    await product.save();

    return res
      .status(200)
      .json({ message: "Review deleted successfully", product });
  } catch (error) {
    console.error("Error in deleteReviewToProduct:", error);
    res.status(500).json({ message: "Failed to manage reviews", error });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  addReviewToProduct,
  deleteReviewToProduct,
  replyReviewToProduct,
};
