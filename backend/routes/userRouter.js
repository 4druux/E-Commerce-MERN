const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser); // Endpoint untuk registrasi
router.post("/login", loginUser); // Endpoint untuk login
router.get("/admin/add", authMiddleware("admin"), (req, res) => {
  res.send("Welcome to the admin panel!"); // Contoh route admin
});
router.get("/me", authMiddleware(), getUserProfile);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
