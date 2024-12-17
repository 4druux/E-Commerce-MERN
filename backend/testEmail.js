const nodemailer = require("nodemailer");
require("dotenv").config(); // Pastikan Anda mengimpor file .env

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Gunakan host Gmail
      port: 587, // Gunakan port 587 untuk TLS
      secure: false, // false untuk koneksi TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "andrewsamagachandra@gmail.com", // Ganti dengan email tujuan untuk pengujian
      subject: "Test Email from Node.js",
      text: "If you receive this email, your nodemailer setup is correct!",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error while sending email:", error);
  }
}

testEmail();
