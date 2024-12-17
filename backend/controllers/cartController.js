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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation - Forever Fashion</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      color: #333;
    "
  >
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="600"
      style="
        margin: 20px auto;
        background-color: #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      "
    >
      <tr>
        <td
          align="center"
          bgcolor="#2c3e50"
          style="
            padding: 20px 0;
            color: white;
            font-size: 24px;
            font-weight: bold;
          "
        >
          Forever Fashion
        </td>
      </tr>

      <tr>
        <td style="padding: 20px; background-color: #f9fafb">
          <h2
            style="
              margin: 0 0 10px;
              font-size: 18px;
              border-bottom: 2px solid #e0f2fe;
              padding-bottom: 5px;
              color: #2c3e50;
            "
          >
            Order Summary
          </h2>
          <p style="margin: 5px 0"><strong>Order ID:</strong> #${order._id}</p>
          <p style="margin: 5px 0">
            <strong>Order Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding: 20px">
          <h2
            style="
              margin: 0 0 10px;
              font-size: 18px;
              border-bottom: 2px solid #e0f2fe;
              padding-bottom: 5px;
              color: #2c3e50;
            "
          >
            Your Items
          </h2>
          ${order.items
            .map(
              (item) => `
          <table
            width="100%"
            style="
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            "
          >
            <tr>
              <td width="20%" valign="top" style="padding-right: 10px">
                <img
                  src="${item.imageURL}"
                  alt="${item.name}"
                  width="60"
                  height="60"
                  style="border-radius: 4px; display: block"
                />
              </td>
              <td valign="top" style="line-height: 1.4">
                <strong>${item.name}</strong><br />
                Size: ${item.size} | Quantity: ${item.quantity}
              </td>
              <td
                align="right"
                valign="top"
                style="font-weight: bold; white-space: nowrap"
              >
                Rp ${(item.price * item.quantity).toLocaleString()}
              </td>
            </tr>
          </table>
          `
            )
            .join("")}
        </td>
      </tr>

      <tr>
        <td style="padding: 20px; background-color: #f9fafb">
          <h2
            style="
              margin: 0 0 10px;
              font-size: 18px;
              border-bottom: 2px solid #e0f2fe;
              padding-bottom: 5px;
              color: #2c3e50;
            "
          >
            Payment Summary
          </h2>
          <table width="100%">
            <tr>
              <td>Subtotal:</td>
              <td align="right">Rp ${order.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td align="right">Rp 0</td>
            </tr>
            <tr>
              <td style="font-weight: bold; font-size: 16px">Total:</td>
              <td align="right" style="font-weight: bold; font-size: 16px">
                Rp ${order.totalAmount.toLocaleString()}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding: 20px">
          <h2
            style="
              margin: 0 0 10px;
              font-size: 18px;
              border-bottom: 2px solid #e0f2fe;
              padding-bottom: 5px;
              color: #2c3e50;
            "
          >
            Shipping Address
          </h2>
          <p style="margin: 5px 0">${order.firstName} ${order.lastName}</p>
          <p style="margin: 5px 0">${order.street}</p>
          <p style="margin: 5px 0">
            ${order.city}, ${order.state} ${order.zipCode}
          </p>
          <p style="margin: 5px 0">${order.country}</p>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding: 20px">
          <a
            href="http://localhost:5173/orders"
            style="
              background-color: #2c3e50;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 25px;
              font-weight: bold;
              font-size: 16px;
              border-radius: 4px;
              display: inline-block;
            "
          >
            View Order Details
          </a>
        </td>
      </tr>

      <tr>
        <td
          style="
            padding: 10px 20px;
            text-align: center;
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 12px;
          "
        >
          <p style="margin: 5px 0">
            &copy; 2024 Forever Fashion. All rights reserved.
          </p>
          <p style="margin: 5px 0">
            Need help?
            <a
              href="mailto:vortexseries505@gmail.com"
              style="color: #3b82f6; text-decoration: none"
              >Contact Support</a
            >
          </p>
          <p style="margin: 5px 0; font-style: italic; color: #9ca3af">
            This email was sent automatically. Please do not reply to this
            email.
          </p>
        </td>
      </tr>
    </table>
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
  clearCart,
};
