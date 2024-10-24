const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware otentikasi dengan pengecekan role
const authMiddleware = (requiredRole) => async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password"); // Ambil user ID dari token

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Cek role pengguna jika diperlukan (misalnya untuk akses admin)
      if (requiredRole && req.user.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Access denied, insufficient permissions" });
      }

      next(); // Lanjutkan ke fungsi berikutnya jika verifikasi token berhasil
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = authMiddleware;
