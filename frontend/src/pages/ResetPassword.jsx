import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import SweetAlert from "../components/SweetAlert";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [progressWidth, setProgressWidth] = useState([0, 0, 0]);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get("token");

    if (!resetToken) {
      setErrorMessage("Invalid or missing reset token");
    } else {
      setToken(resetToken);
    }
  }, [location, navigate]);

  const validatePasswordStrength = (password) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let progress = [0, 0, 0];
    const criteriaMet = [
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (criteriaMet >= 1) progress[0] = 1;
    if (criteriaMet >= 2) progress[1] = 2;
    if (criteriaMet >= 4) progress[2] = 3;

    setProgressWidth(progress);
    setIsPasswordStrong(criteriaMet === 4);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Validate token
    if (!token) {
      setErrorMessage("Invalid reset token");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("https://ecommerce-frontend-beta-dusky.vercel.app/api/user/reset-password", {
        token,
        newPassword,
      });

      SweetAlert({
        title: "Success!",
        message: "Your password has been reset successfully.",
        icon: "success",
      });

      navigate("/login");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to reset password";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full text-white"></div>
        </div>
      )}
      <Link to="/" className="my-8">
        <img src={assets.forever_icon} alt="Atlas Icon" className="w-32 sm:w-40" />
      </Link>
      <form
        onSubmit={handleResetPassword}
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 gap-6 p-5 sm:p-8 bg-white shadow-xl rounded-xl transition-all duration-500 hover:shadow-2xl  border border-gray-100"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <p className="prata-regular text-3xl">Reset Password</p>
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
            type={showPassword ? "text" : "password"}
            id="newPassword"
            placeholder=" "
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validatePasswordStrength(e.target.value);
            }}
          />
          <label
            htmlFor="newPassword"
            className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1  
    ${newPassword ? "-top-2 text-xs" : "top-3 text-sm"}`}
            style={{ pointerEvents: "none" }}
          >
            New Password
          </label>
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
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
        </div>
        {/* Password Strength Indicator */}
        <div className="w-full flex items-center gap-4 text-sm">
          <span
            className={`${
              newPassword.length >= 5 ? "text-gray-600" : "text-red-600"
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
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-full transition-all duration-300   
  flex items-center justify-center space-x-2 group  
  ${
    !isPasswordStrong || !newPassword || !confirmPassword
      ? "bg-gray-200 cursor-not-allowed text-gray-500"
      : "bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-[1.02] hover:shadow-lg"
  }`}
          disabled={!isPasswordStrong || !newPassword || !confirmPassword}
        >
          <span>Reset Password</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-opacity   
    ${
      !isPasswordStrong || !newPassword || !confirmPassword
        ? "opacity-0"
        : "opacity-100"
    }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="mt-4 text-center text-sm sm:text-xs">
          <p>
            <span className="text-black">Remember your password?</span>
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-700 cursor-pointer"
            >
              {" Login Here"}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
