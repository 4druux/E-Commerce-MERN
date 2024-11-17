import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SweetAlert from "../components/SweetAlert";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const UserLogin = () => {
  const [currentState, setCurrentState] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progressWidth, setProgressWidth] = useState([0, 0, 0]);
  const { loginUser } = useContext(ShopContext);
  const navigate = useNavigate();

  const resetInputs = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setProgressWidth([0, 0, 0]);
  };

  const validatePasswordStrength = (password) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let progress = [0, 0, 0]; // Default semua abu-abu

    // Hitung jumlah kriteria yang terpenuhi
    const criteriaMet = [
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (criteriaMet >= 1) {
      progress[0] = 1; // Merah
    }
    if (criteriaMet >= 2) {
      progress[1] = 2; // Kuning
    }
    if (criteriaMet >= 4) {
      progress[2] = 3; // Hijau
    }

    setProgressWidth(progress); // Update progress
    setIsPasswordStrong(criteriaMet === 4); // Kuat jika semua kriteria terpenuhi
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (currentState === "Sign Up") {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      // Password validation
      validatePasswordStrength(password);
      if (progressWidth[2] !== 100) {
        setErrorMessage(
          "Password is too weak. It should include uppercase letters, numbers, and special characters."
        );
        return;
      }
    }

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
          const expiresIn = response.data.expiresIn;
          const expirationTime = new Date().getTime() + expiresIn * 1000;

          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("userRole", response.data.role);
          localStorage.setItem("tokenExpiration", expirationTime);

          loginUser(response.data.token);
          navigate("/");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else {
          setErrorMessage("An error occurred. Please try again later.");
        }
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
          SweetAlert({
            title: "Registration Successful!",
            message: `Hallo ${username} registered successfully.`,
            icon: "success",
          });

          setCurrentState("Login");
          resetInputs();
          window.scrollTo(0, 0);
        }
      } catch (error) {
        // Only handle specific registration errors
        if (error.response && error.response.status === 400) {
          setErrorMessage("Email or username is already.");
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      }
    }
  };

  const toggleStateHandler = () => {
    resetInputs();
    setCurrentState(currentState === "Login" ? "Sign Up" : "Login");
    window.scrollTo(0, 0);
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 gap-6 p-5 sm:p-8 bg-white shadow-xl rounded-xl transition-all duration-500 hover:shadow-2xl"
    >
      <div className="inline-flex items-center gap-2 mb-4">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {errorMessage && (
        <div className="w-full text-center text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}

      {currentState === "Sign Up" && (
        <div className="relative w-full">
          <input
            className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
            type="text"
            id="username"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label
            htmlFor="username"
            className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1
        ${username ? "-top-2 text-xs" : "top-3 text-sm"}`}
            style={{ pointerEvents: "none" }}
          >
            Username
          </label>
          <span className="absolute left-4 -top-2.5 w-2/5 h-px bg-white"></span>
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
          className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1
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
          onChange={(e) => {
            setPassword(e.target.value);
            if (currentState === "Sign Up")
              validatePasswordStrength(e.target.value);
          }}
        />
        <label
          htmlFor="password"
          className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1
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

      {currentState === "Sign Up" && (
        <div className="relative w-full">
          <input
            className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            placeholder=" "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <label
            htmlFor="confirmPassword"
            className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1
        ${confirmPassword ? "-top-2 text-xs" : "top-3 text-sm"}`}
            style={{ pointerEvents: "none" }}
          >
            Confirm Password
          </label>
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 cursor-pointer"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
          <span className="absolute left-4 -top-2.5 w-2/5 h-px bg-white"></span>
        </div>
      )}

      {/* Password Strength Indicator */}
      {currentState === "Sign Up" && (
        <div className="w-full flex items-center gap-4 text-sm">
          <span
            className={`${
              password.length >= 5 ? "text-gray-600" : "text-red-600"
            } flex items-center gap-2`}
          >
            at least 5 characters
            <div className="relative group cursor-pointer">
              <span className="sm:text-xs">
                <img
                  src={assets.inform_icon}
                  alt=""
                  className="sm:w-6 sm:h-6 w-4 h-4"
                />
              </span>

              <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-56 p-2 text-xs z-10 text-white bg-gray-800 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                Tips for a good password:
                <ul className="list-disc list-inside mt-1">
                  <li>Use both upper and lowercase characters</li>
                  <li>Include at least one symbol (# $ ! % & etc.)</li>
                </ul>
              </div>
            </div>
          </span>

          {/* Progress Bar Container */}
          <div className="flex-1 flex">
            <div className="w-full h-3 rounded-full border border-gray-200 bg-white relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background:
                    progressWidth[2] === 3
                      ? "#28a745"
                      : progressWidth[1] === 2
                      ? "#ffc107"
                      : progressWidth[0] === 1
                      ? "#ff0000"
                      : "transparent",
                  width:
                    progressWidth[2] === 3
                      ? "100%"
                      : progressWidth[1] === 2
                      ? "66%"
                      : progressWidth[0] === 1
                      ? "33%"
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {currentState === "Login" && (
        <div className="w-full flex justify-between text-sm sm:text-xs">
          <p className="text-blue-500 cursor-pointer">Forgot your password?</p>
          <p>
            <span
              onClick={toggleStateHandler}
              className="text-blue-500 cursor-pointer"
            >
              Create account
            </span>
          </p>
        </div>
      )}

      <button
        type="submit"
        className={`px-8 py-2 mt-4 font-normal text-white rounded-3xl transition-all duration-300 transform
    ${
      (currentState === "Sign Up" &&
        (!isPasswordStrong ||
          !username ||
          !email ||
          !password ||
          !confirmPassword)) ||
      (currentState === "Login" && (!email || !password))
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gray-900 hover:bg-gray-800 hover:scale-105 hover:shadow-lg"
    }`}
        disabled={
          (currentState === "Sign Up" &&
            (!isPasswordStrong ||
              !username ||
              !email ||
              !password ||
              !confirmPassword)) ||
          (currentState === "Login" && (!email || !password))
        }
      >
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>

      {currentState === "Sign Up" && (
        <div className="mt-4 text-center text-sm sm:text-xs">
          <p>
            <span className="text-black">Already have an account?</span>
            <span
              onClick={toggleStateHandler}
              className="text-blue-500 cursor-pointer"
            >
              {" Login Here"}
            </span>
          </p>
        </div>
      )}
    </form>
  );
};

export default UserLogin;
