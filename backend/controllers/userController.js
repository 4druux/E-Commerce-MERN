const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
// Temporary storage untuk data registrasi
const tempRegistrations = new Map();

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Read the HTML template
  const htmlTemplate = `  
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your OTP Code</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f7fb;
    "
  >
    <div
      style="
        max-width: 550px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
      "
    >
      <div style="text-align: center; color: #2c3e50">
        <h1 style="margin: 0; font-size: 24px">Verify Your Email</h1>
        <p style="margin-top: 10px; color: #333; font-size: 16px">
          Use the following One-Time Password to complete your verification:
        </p>
      </div>

      <div
        style="
          background-color: #f1f9ff;
          border-left: 5px solid #2c3e50;
          padding: 20px;
          margin-top: 20px;
          text-align: center;
        "
      >
        <div style="font-size: 32px; color: #2c3e50; font-weight: bold">
          ${otp}
        </div>
        <p style="color: #777; font-size: 14px; margin-top: 10px">
          This code will expire in 5 minutes
        </p>
      </div>

      <div
        style="
          text-align: center;
          margin-top: 40px;
          color: #888;
          font-size: 12px;
        "
      >
        <p style="margin: 5px 0; font-style: italic">
          This email was sent automatically. Please do not reply to this email.
        </p>
        <p style="margin: 5px 0; font-style: italic">
          If you did not request this, please ignore this email.
        </p>
        <p style="margin: 5px 0">
          Need help?
          <a
            href="mailto:vortexseries505@gmail.com"
            style="color: #3b82f6; text-decoration: none"
            >Contact Support</a
          >
        </p>
      </div>
    </div>
  </body>
</html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: htmlTemplate,
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

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
    // Cek apakah email sudah terdaftar di database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Cek role admin
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res
          .status(403)
          .json({ message: "Admin account already exists" });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // Simpan data registrasi sementara
    tempRegistrations.set(email, {
      username,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
      otp,
      otpExpires,
      attempts: 0, // untuk tracking jumlah percobaan resend
    });

    // Kirim OTP via email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration initiated. Please verify your email with OTP.",
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = tempRegistrations.get(email);

    if (!tempUser) {
      return res
        .status(400)
        .json({ message: "Registration session expired or not found" });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (tempUser.otpExpires < Date.now()) {
      tempRegistrations.delete(email);
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Buat user baru di database setelah verifikasi berhasil
    const user = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
      isEmailVerified: true,
    });

    await user.save();

    // Hapus data temporary
    tempRegistrations.delete(email);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification failed:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const tempUser = tempRegistrations.get(email);

    if (!tempUser) {
      return res
        .status(400)
        .json({ message: "Registration session not found" });
    }

    if (tempUser.attempts >= 3) {
      tempRegistrations.delete(email);
      return res.status(400).json({
        message: "Maximum resend attempts reached. Please register again.",
      });
    }

    // Generate OTP baru
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update data temporary
    tempUser.otp = newOtp;
    tempUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    tempUser.attempts += 1;
    tempRegistrations.set(email, tempUser);

    // Kirim OTP baru
    await sendOTPEmail(email, newOtp);

    res.status(200).json({
      message: "New OTP sent successfully",
      remainingAttempts: 3 - tempUser.attempts,
    });
  } catch (error) {
    console.error("Resend OTP failed:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Dapatkan user dari middleware auth
    res
      .status(200)
      .json({ role: user.role, email: user.email, username: user.username });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// Fungsi untuk mengirim email reset password
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetLink = `https://ecommerce-frontend-beta-dusky.vercel.app/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlTemplate = `  
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f7fb;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
      "
    >
      <div style="text-align: center; color: #2c3e50">
        <h1 style="margin: 0; font-size: 24px">Password Reset Request</h1>
        <p style="margin-top: 10px; color: #333; font-size: 16px">
          You have requested to reset your password. Click the button below to
          reset:
        </p>
      </div>

      <div
        style="
          background-color: #f1f9ff;
          border-left: 5px solid #2c3e50;
          padding: 40px;
          margin-top: 20px;
          text-align: center;
        "
      >
        <a
          href="${resetLink}"
          style="
            background-color: #2c3e50;
            padding: 15px 20px;
            text-decoration: none;
            border-radius: 5px;
            color: #ffffff;
            font-size: 16px;
            display: inline-block;
            text-align: center;
          "
        >
          Reset Password
        </a>
      </div>

      <div style="text-align: center; margin-top: 20px">
        <p style="color: #777; font-size: 14px; margin-top: 10px">
          This link will expire in 15 minutes. If you did not request a password
          reset, please ignore this email.
        </p>
      </div>

      <div
        style="
          text-align: center;
          margin-top: 40px;
          color: #888;
          font-size: 12px;
        "
      >
        <p style="margin: 5px 0; font-style: italic">
          This email was sent automatically. Please do not reply to this email.
        </p>
        <p style="margin: 5px 0; font-style: italic">
          If you did not request a password reset, please ignore this email.
        </p>
        <p style="margin: 5px 0">
          Need help?
          <a
            href="mailto:vortexseries505@gmail.com"
            style="color: #3b82f6; text-decoration: none"
            >Contact Support</a
          >
        </p>
      </div>
    </div>
  </body>
</html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: htmlTemplate,
    text: `Password reset link: ${resetLink}. This link will expire in 15 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// Fungsi untuk meminta reset password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email address." });
    }

    // Inisialisasi reset password attempts jika belum ada
    if (!user.resetPasswordAttempts || !user.resetPasswordFirstAttempt) {
      user.resetPasswordAttempts = 0;
      user.resetPasswordFirstAttempt = Date.now();
    }

    // Reset attempts jika sudah lebih dari 15 menit
    const timeSinceFirstAttempt = Date.now() - user.resetPasswordFirstAttempt;
    if (timeSinceFirstAttempt > 15 * 60 * 1000) {
      // 15 menit
      user.resetPasswordAttempts = 0;
      user.resetPasswordFirstAttempt = Date.now();
    }

    // Cek jumlah percobaan
    if (user.resetPasswordAttempts >= 3) {
      return res.status(429).json({
        message: "Maximum reset attempts reached. Please try again later.",
      });
    }

    // Tambah jumlah percobaan
    user.resetPasswordAttempts += 1;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Simpan token dan expired time
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 menit
    await user.save();

    // Kirim email reset password
    await sendResetPasswordEmail(email, resetToken);

    res.status(200).json({
      message: "Password reset link sent successfully.",
      remainingAttempts: 3 - user.resetPasswordAttempts,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process password reset." });
  }
};

// Fungsi untuk reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log("Received reset password request");
    console.log("Token:", token);
    console.log("New Password Length:", newPassword.length);

    // Hash token untuk pencocokan
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Cari user dengan token yang sesuai dan belum expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("No user found with this reset token");
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    console.log("User found for password reset");

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("Password reset successful");
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Detailed Reset Password Error:", error);
    res.status(500).json({
      message: "Failed to reset password",
      details: error.message,
      stack: error.stack,
    });
  }
};
