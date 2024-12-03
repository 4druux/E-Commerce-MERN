const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { createServer } = require("http");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors()
    // {
    // origin: "https://ecommerce-frontend-beta-dusky.vercel.app",
    // credentials: true,
    // }
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MongoDB Connection
console.log("Attempting MongoDB connection...");
connectDB();
console.log("MongoDB connection attempted");

// Create HTTP Server
const httpServer = createServer(app);

// Routes
console.log("Setting up routes...");
app.use(
  "/api/products",
  (req, res, next) => {
    console.log("Accessing /api/products");
    next();
  },
  require("./routes/productRouter")
);
app.use(
  "/api/user",
  (req, res, next) => {
    console.log("Accessing /api/user");
    next();
  },
  require("./routes/userRouter")
);
app.use(
  "/api/cart",
  (req, res, next) => {
    console.log("Accessing /api/cart");
    next();
  },
  require("./routes/cartRouter")
);
app.use(
  "/api/orders",
  (req, res, next) => {
    console.log("Accessing /api/orders");
    next();
  },
  require("./routes/orderRouter")
);

// Default route for root
app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce Backend API");
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
