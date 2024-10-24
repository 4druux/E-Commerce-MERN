const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Fungsi login untuk admin atau pengguna biasa
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Trying to log in with:", email); // Log email yang dimasukkan
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found"); // Jika user tidak ditemukan
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("User found:", user); // Log user yang ditemukan

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password"); // Log jika password salah
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Jika email dan password valid
    console.log("Login successful for:", user.email);

    // Buat token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Token valid selama 1 jam
      }
    );

    res.status(200).json({ token, role: user.role }); // Kirim token dan role ke frontend
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Fungsi registrasi user
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Cek apakah user sudah ada berdasarkan email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Cek apakah sudah ada akun admin di database
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res
          .status(403)
          .json({ message: "Admin account already exists" });
      }
    }

    // Buat user baru, dan jika role adalah admin, set role menjadi "admin"
    const user = new User({
      username,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    // Simpan user ke database
    await user.save();

    // Buat token JWT untuk user baru
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res
      .status(201)
      .json({
        token,
        message: "User registered successfully",
        role: user.role,
      });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Dapatkan user dari middleware auth
    res.status(200).json({ role: user.role, email: user.email, username: user.username });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

