const Cart = require("../models/Cart");
const nodemailer = require("nodemailer");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { format } = require("date-fns");

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

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Bisa menggunakan layanan lain sesuai keinginan
      auth: {
        user: process.env.EMAIL_USER, // Email dari .env file
        pass: process.env.EMAIL_PASS, // Password dari .env file
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Alamat email pengirim
      to, // Email penerima
      subject, // Subjek email
      text, // Konten email (Plain text)
      html, // Konten email (HTML)
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Proses checkout dan kirim email
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

    const itemsWithDetails = await Promise.all(
      itemsToCheckout.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return {
          ...item._doc,
          name: product.name,
          price: product.price,
        };
      })
    );

    const order = new Order({
      userId: req.user._id,
      username: req.user.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.user.email,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      phone: req.body.phone,
      paymentMethod: req.body.paymentMethod,
      items: itemsWithDetails,
      totalAmount: itemsWithDetails.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      status: "Pending",
    });

    await order.save();

    cart.items = cart.items.filter(
      (cartItem) =>
        !itemsToCheckout.some(
          (item) =>
            item.productId === cartItem.productId && item.size === cartItem.size
        )
    );
    await cart.save();

    const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Vortex Series</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            line-height: 1.6;
        }
        .container {
            max-width: 700px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .order-details {
            padding: 20px;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3b82f6;
        }
        .order-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .order-summary {
            padding: 20px;
            background-color: #ffffff;
        }
        .order-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .total {
            font-weight: bold;
            font-size: 18px;
            color: #1d4ed8;
        }
        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 12px 20px;
            background-color: #3b82f6;
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 12px;
        }
        .shipping-details, .payment-details {
            padding: 20px;
            background-color: #ffffff;
            border-bottom: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div>
                    <h1>Vortex Series</h1>
                    <p>Order Confirmation</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0;">Order #${order._id}</p>
                    <p style="margin: 0; color: #e0f2fe;">${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>

        <div class="order-details">
            <p><strong>Order Number:</strong> #${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="padding: 20px; background-color: #ffffff;">
            <div class="section-title">Order Items</div>
            ${order.items
              .map(
                (item) => `
                <div class="order-item">
                    <div style="flex-grow: 1;">
                        <strong>${item.name}</strong><br>
                        Size: ${item.size} | Quantity: ${item.quantity}
                    </div>
                    <div style="font-weight: bold;">Rp ${(
                      item.price * item.quantity
                    ).toLocaleString()}</div>
                </div>`
              )
              .join("")}
        </div>

        <div class="shipping-details">
            <div class="section-title">Shipping Address</div>
            <p>${order.firstName} ${order.lastName}</p>
            <p>${order.street}</p>
            <p>${order.city}, ${order.state} ${order.zipCode}</p>
            <p>${order.country}</p>
        </div>

        <div class="payment-details">
            <div class="section-title">Payment Method</div>
            <p>${order.paymentMethod}</p>
        </div>

        <div class="order-summary">
            <div class="order-summary-row">
                <span>Subtotal</span>
                <span>Rp ${order.totalAmount.toLocaleString()}</span>
            </div>
            <div class="order-summary-row">
                <span>Shipping</span>
                <span>Rp 0</span>
            </div>
            <div class="order-summary-row total">
                <span>Total</span>
                <span>Rp ${order.totalAmount.toLocaleString()}</span>
            </div>
        </div>

        <a href="https://ecommerce-frontend-beta-dusky.vercel.app/orders" class="button">View Order Details</a>

        <div class="footer">
            <p>&copy; 2024 Vortex Series. All rights reserved.</p>
            <p>If you need assistance, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

    // Send the email to the user
    await sendEmail(
      req.user.email,
      "Order Confirmation - Vortex Series",
      "Your order has been placed successfully",
      emailContent
    );

    res.status(200).json({
      message: "Checkout successful and email sent!",
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
