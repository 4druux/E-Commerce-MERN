import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SweetAlert from "../components/SweetAlert"; // Import SweetAlert dari komponen yang kamu buat
import { ShopContext } from "../context/ShopContext";

const UserLogin = () => {
  const [currentState, setCurrentState] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Untuk menampung pesan error
  const { loginUser } = useContext(ShopContext);
  const navigate = useNavigate();

  const resetInputs = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setErrorMessage("");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Reset pesan error sebelum proses baru

    if (currentState === "Login") {
      try {
        const response = await axios.post(
          "https://ecommerce-backend-ebon-six.vercel.app/api/user/login",
          {
            email,
            password,
          }
        );

        if (response.data.token) {
          const expiresIn = response.data.expiresIn; // Ambil waktu kedaluwarsa dari respons
          const expirationTime = new Date().getTime() + expiresIn * 1000; // Hitung waktu kadaluwarsa

          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("userRole", response.data.role); // Simpan role pengguna
          localStorage.setItem("tokenExpiration", expirationTime); // Simpan waktu kadaluwarsa

          loginUser(response.data.token); // Memperbarui status login di context
          navigate("/"); // Redirect ke halaman utama setelah login sukses
        }
      } catch (error) {
        console.error("Login failed:", error);
        setErrorMessage("Invalid email or password."); // Set pesan error
      }
    } else {
      try {
        const response = await axios.post(
          "https://ecommerce-backend-ebon-six.vercel.app/api/user/register",
          {
            username,
            email,
            password,
          }
        );

        if (response.data.token) {
          // Gunakan SweetAlert setelah sukses registrasi
          SweetAlert({
            title: "Registration Successful!",
            message: `User ${username} registered successfully`,
            icon: "success",
          });

          setCurrentState("Login"); // Alihkan ke halaman login setelah registrasi sukses
          resetInputs(); // Reset input setelah berhasil registrasi
        }
      } catch (error) {
        console.error("Registration failed:", error);
        // Cek apakah error disebabkan oleh email/username yang sudah digunakan
        if (error.response && error.response.status === 400) {
          setErrorMessage("Email or username is already."); // Set pesan error
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      }
    }
  };

  const toggleStateHandler = () => {
    resetInputs(); // Reset input setiap kali mode berubah
    setCurrentState(currentState === "Login" ? "Sign Up" : "Login");
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {errorMessage && (
        <div className="w-full text-center text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      {currentState === "Sign Up" && (
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p onClick={toggleStateHandler} className="cursor-pointer">
            Create account
          </p>
        ) : (
          <p onClick={toggleStateHandler} className="cursor-pointer">
            Login Here
          </p>
        )}
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default UserLogin;
