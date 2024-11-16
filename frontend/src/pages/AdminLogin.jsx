import React, { useState } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage(""); 
    try {
      const response = await axios.post(
        "http://localhost:5173/api/user/login",
        {
          email,
          password,
        }
      );

      const { token, role, expiresIn } = response.data; 
      const expirationTime = new Date().getTime() + expiresIn * 1000; 

      // Simpan token dan role ke localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role); 
      localStorage.setItem("tokenExpiration", expirationTime); 

      if (role === "admin") {
        navigate("/admin/dashboard"); 
      } else {
        setErrorMessage("You do not have admin privileges."); 
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid email or password."); 
      } else {
        setErrorMessage("Login failed. Please try again."); 
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-md gap-6 p-5 sm:p-8 bg-white shadow-xl rounded-xl transition-all duration-500 hover:shadow-2xl"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <p className="prata-regular text-3xl">Login</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        {errorMessage && (
          <div className="w-full text-center text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="relative w-full">
          <input
            className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
            type="email"
            id="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label
            htmlFor="email"
            className={`absolute left-4 text-gray-500 transition-all duration-200 transform bg-white px-1
          ${email ? "-top-2 text-xs" : "top-3 text-sm"}`}
            style={{ pointerEvents: "none" }}
          >
            Email
          </label>
          <span className="absolute left-4 -top-2.5 w-2/5 h-px bg-white"></span>
        </div>

        <div className="relative w-full">
          <input
            className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label
            htmlFor="password"
            className={`absolute left-4 text-gray-500 transition-all duration-200 transform bg-white px-1
          ${password ? "-top-2 text-xs" : "top-3 text-sm"}`}
            style={{ pointerEvents: "none" }}
          >
            Password
          </label>
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
          <span className="absolute left-4 -top-2.5 w-2/5 h-px bg-white"></span>
        </div>

        <button
          type="submit"
          disabled={!email || !password} 
          className={`px-8 py-2 mt-4 font-normal text-white rounded-3xl transition-all duration-300 transform 
    ${
      !email || !password
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gray-900 hover:bg-gray-800 hover:scale-105 hover:shadow-lg"
    }`}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
