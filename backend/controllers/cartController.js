const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const getCart = async (req, res) => {
  console.log("GET /api/cart accessed");
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        username: req.user.username,
        items: [],
      });
      await cart.save();
      console.log("New cart created for user:", req.user._id);
    } else {
      // Sort items by createdAt descending
      cart.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ message: "Failed to fetch cart data" });
  }
};

const addToCart = async (req, res) => {
  const { productId, name, price, quantity, size } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        username: req.user.username,
        items: [],
      });
    }

    const product = await Product.findById(productId);
    console.log("Product found:", product); // Debugging produk yang ditemukan

    const imageUrl =
      product.image && product.image.length > 0
        ? product.image[0] // Ambil URL pertama dari array image
        : "/placeholder-image.png";

    console.log("Image URL assigned:", imageUrl); // Log URL gambar yang digunakan

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.size === size
    );

    if (itemIndex > -1) {
      // Jika item sudah ada di keranjang, tambahkan quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Tambahkan item baru ke keranjang
      cart.items.push({
        productId,
        name: name || product.name || "Unknown",
        price,
        quantity,
        size,
        imageUrl, // Simpan imageUrl ke item
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error adding item to cart:", error.message);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
};

const removeFromCart = async (req, res) => {
  const { productId, size } = req.body;

  if (!productId || !size) {
    return res
      .status(400)
      .json({ message: "Product ID and size are required" });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId !== productId || item.size !== size
    );

    // Sort items by createdAt descending after removal
    cart.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId, size, quantity } = req.body;

  if (!productId || typeof quantity !== "number" || !size) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;

      // Sort items by createdAt descending after updating quantity
      cart.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Failed to update cart quantity" });
  }
};

const checkoutCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const selectedItems = req.body.selectedItems;

    const itemsToCheckout = cart.items.filter((cartItem) =>
      selectedItems.some(
        (selectedItem) =>
          selectedItem._id === cartItem.productId &&
          selectedItem.size === cartItem.size
      )
    );

    if (itemsToCheckout.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid items selected for checkout" });
    }

    // Pastikan imageUrl disertakan
    const itemsWithImage = await Promise.all(
      itemsToCheckout.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const imageUrl =
          product.image && product.image.length > 0
            ? product.image[0] // Ambil URL gambar pertama dari array
            : "/placeholder-image.png";

        return {
          ...item._doc,
          name: product.name,
          imageUrl, // Sertakan URL gambar di item yang dikembalikan
        };
      })
    );

    const order = new Order({
      userId: req.user._id,
      username: req.user.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      phone: req.body.phone,
      paymentMethod: req.body.paymentMethod,
      items: itemsWithImage, // Simpan item dengan URL gambar yang sudah benar
      totalAmount: itemsWithImage.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      status: "Pending",
    });

    await order.save();

    // Hapus item yang telah di-checkout dari keranjang
    cart.items = cart.items.filter(
      (cartItem) =>
        !itemsToCheckout.some(
          (item) =>
            item.productId === cartItem.productId && item.size === cartItem.size
        )
    );
    await cart.save();

    res.status(200).json({
      message: "Checkout successful",
      order: { ...order._doc, username: undefined },
    });
  } catch (error) {
    console.error("Checkout failed:", error.message);
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear all items in the cart
    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  checkoutCart,
  clearCart, // Add this to the exported module
};
