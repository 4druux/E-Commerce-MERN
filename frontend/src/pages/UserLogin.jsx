import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const UserLogin = () => {
  const [currentState, setCurrentState] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useContext(ShopContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currentState === "Login") {
      try {
        const response = await axios.post("/api/user/login", {
          email,
          password,
        });

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
        alert("Login failed. Please try again.");
      }
    } else {
      try {
        const response = await axios.post("/api/user/register", {
          username,
          email,
          password,
        });

        if (response.data.token) {
          alert(`User ${username} registered successfully!`);
          setCurrentState("Login"); // Alihkan ke halaman login setelah registrasi sukses
        }
      } catch (error) {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
      }
    }
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
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
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
