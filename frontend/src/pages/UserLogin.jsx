import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SweetAlert from "../components/SweetAlert";
import { ShopContext } from "../context/ShopContext";

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
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let progress = [0, 0, 0];
    let currentIndex = 0;

    if (hasLowerCase) {
      progress[currentIndex] = 100;
      currentIndex += 1;
    }
    if (hasUpperCase && currentIndex < 3) {
      progress[currentIndex] = 100;
      currentIndex += 1;
    }
    if (hasNumber && hasSpecialChar && currentIndex < 3) {
      progress[currentIndex] = 100;
    }

    setProgressWidth(progress);
    setIsPasswordStrong(progress.every((val) => val === 100));
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
          "http://localhost:5173/api/user/login",
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
          "http://localhost:5173/api/user/register",
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
      {currentState === "Sign Up" && password && (
        <div className="w-full flex gap-1 mt-2">
          <div
            className="h-2 flex-1 rounded transition-all duration-300"
            style={{
              backgroundColor: progressWidth[0] ? "#28a745" : "#e0e0e0",
            }}
          />
          <div
            className="h-2 flex-1 rounded transition-all duration-300"
            style={{
              backgroundColor: progressWidth[1] ? "#28a745" : "#e0e0e0",
            }}
          />
          <div
            className="h-2 flex-1 rounded transition-all duration-300"
            style={{
              backgroundColor: progressWidth[2] ? "#28a745" : "#e0e0e0",
            }}
          />
        </div>
      )}

      <div className="w-full flex text-sm sm:text-xs">
        {currentState === "Login" && (
          <p className="text-blue-500 cursor-pointer ">Forgot your password?</p>
        )}
        <p
          onClick={toggleStateHandler}
          className="text-blue-500 cursor-pointer ml-auto"
        >
          {currentState === "Login" ? "Create account" : "Login Here"}
        </p>
      </div>

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
    </form>
  );
};

export default UserLogin;
