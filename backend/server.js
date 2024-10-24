const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { createServer } = require("http");
const socket = require("./socket"); // Import socket configuration

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MongoDB Connection
connectDB();

// Create HTTP Server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = socket.init(httpServer);

// Routes
app.use("/api/products", require("./routes/productRouter"));
app.use("/api/user", require("./routes/userRouter"));
app.use("/api/cart", require("./routes/cartRouter"));
app.use("/api/orders", require("./routes/orderRouter"));

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
