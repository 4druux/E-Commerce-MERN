import React, { useState } from "react";
import axios from "axios"; // Gunakan axios untuk login request
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Menyimpan pesan kesalahan
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Reset pesan kesalahan sebelum proses login

    try {
      const response = await axios.post(
        "https://ecommerce-backend-ebon-six.vercel.app/api/user/login",
        {
          email,
          password,
        }
      );

      const { token, role, expiresIn } = response.data; // Ambil token dan waktu kadaluwarsa dari respons
      const expirationTime = new Date().getTime() + expiresIn * 1000; // Hitung waktu kadaluwarsa token

      // Simpan token dan role ke localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role); // Simpan role pengguna
      localStorage.setItem("tokenExpiration", expirationTime); // Simpan waktu kadaluwarsa token

      if (role === "admin") {
        navigate("/admin/orders"); // Arahkan ke halaman admin jika role admin
      } else {
        setErrorMessage("You do not have admin privileges."); // Tampilkan pesan jika bukan admin
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid email or password."); // Tampilkan pesan error jika kredensial salah
      } else {
        setErrorMessage("Login failed. Please try again."); // Pesan fallback jika terjadi error lain
      }
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Login</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {errorMessage && (
        <div className="w-full text-center text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      <input
        className="w-full px-3 py-2 border border-gray-800"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="w-full relative">
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 cursor-pointer"
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        Sign In
      </button>
    </form>
  );
};

export default AdminLogin;
