import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import SweetAlert from "../components/SweetAlert";
import { assets } from "../assets/assets";
import { SiGmail } from "react-icons/si";

// Daftar username email yang tidak diperbolehkan
const invalidUsernames = [
  "test",
  "admin",
  "user",
  "info",
  "mail",
  "email",
  "sample",
  "example",
  "demo",
  "fake",
  "noreply",
  "no-reply",
  "postmaster",
  "root",
  "webmaster",
  "administrator",
  "support",
  "contact",
  "help",
  "account",
  "service",
  "guest",
  "temp",
  "temporary",
];

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [progressWidth, setProgressWidth] = useState([0, 0, 0]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  // OTP states
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  // Tambahkan state ini di bagian atas komponen
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
      });
    };

    scrollToTop();

    return () => {
      scrollToTop();
    };
  }, [isOtpSent, errorMessage]);

  useEffect(() => {
    if (isLoading || isOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading, isOverlay]);

  // Fungsi untuk validasi format email
  const validateEmailFormat = useCallback((email) => {
    // Regular expression untuk validasi email yang lebih ketat
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Daftar domain email yang umum digunakan
    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
    ];

    if (!email) {
      setEmailError("Email is required");
      setIsValidEmail(false);
      return false;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      setIsValidEmail(false);
      return false;
    }

    // Memisahkan username dan domain dari email
    const [username, domain] = email.split("@");

    // Validasi panjang username
    if (username.length < 4) {
      setEmailError("Email username too short");
      setIsValidEmail(false);
      return false;
    }

    // Validasi username tidak boleh hanya angka
    if (/^\d+$/.test(username)) {
      setEmailError("Email username cannot contain only numbers");
      setIsValidEmail(false);
      return false;
    }

    // Cek apakah username ada dalam daftar yang tidak diperbolehkan
    if (invalidUsernames.includes(username.toLowerCase())) {
      setEmailError("This email username is not allowed");
      setIsValidEmail(false);
      return false;
    }

    // Validasi pola username yang mencurigakan
    if (
      username.includes("test") ||
      username.includes("temp") ||
      username.includes("fake") ||
      /^[a-z]{1,2}\d+$/i.test(username)
    ) {
      // Mencegah pola seperti "a1234"
      setEmailError("This email pattern looks suspicious");
      setIsValidEmail(false);
      return false;
    }

    // Validasi domain
    if (!commonDomains.includes(domain.toLowerCase())) {
      setEmailError(
        "Please use a common email provider (Gmail, Yahoo, Hotmail, Outlook, or iCloud)"
      );
      setIsValidEmail(false);
      return false;
    }

    // Validasi berurutan seperti "abc123", "123456", dll
    if (/^(?:abc|xyz|123|test)\d*$/i.test(username)) {
      setEmailError("This email username pattern is not allowed");
      setIsValidEmail(false);
      return false;
    }

    // Validasi karakter berulang
    if (/(.)\1{2,}/.test(username)) {
      setEmailError("Email username cannot contain repeated characters");
      setIsValidEmail(false);
      return false;
    }

    setEmailError("");
    setIsValidEmail(true);
    return true;
  }, []);

  // Effect untuk validasi email saat input berubah
  useEffect(() => {
    if (email) {
      validateEmailFormat(email);
    } else {
      setIsValidEmail(false);
      setEmailError("");
    }
  }, [email, validateEmailFormat]);

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

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!validateEmailFormat(email)) {
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong) {
      setErrorMessage(
        "Password is too weak. It should include uppercase letters, numbers, and special characters."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://ecommerce-frontend-beta-dusky.vercel.app/api/user/register",
        {
          username,
          email,
          password,
        }
      );

      if (response.data.message) {
        setIsOtpSent(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage("Email or username already exists.");
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://ecommerce-frontend-beta-dusky.vercel.app/api/user/verify-otp",
        {
          email,
          otp,
        }
      );

      if (response.data.message) {
        setIsOverlay(true);
        await SweetAlert({
          title: "Success!",
          message: "Your email has been successfully verified.",
          icon: "success",
        });
        setIsOverlay(false);
        setIsOtpVerified(true);

        // Reset all states
        setOtp("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setResendAttempts(0);
        setResendTimer(0);

        navigate("/login");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage(error.response.data.message);
        if (error.response.data.message.includes("expired")) {
          // Jika OTP expired, kembali ke form registrasi
          setIsOtpSent(false);
          setOtp("");
          setErrorMessage("OTP has expired. Please register again.");
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        setErrorMessage("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://ecommerce-frontend-beta-dusky.vercel.app/api/user/resend-otp",
        { email }
      );

      if (response.data.message) {
        setResendAttempts((prev) => prev + 1);
        setResendTimer(30);

        // Clear any existing interval
        if (intervalId) {
          clearInterval(intervalId);
        }

        // Set new interval
        const newIntervalId = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(newIntervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Save the interval ID
        setIntervalId(newIntervalId);

        setIsOverlay(true);
        await SweetAlert({
          title: "OTP Resent!",
          message: `New OTP has been sent to your email. ${response.data.remainingAttempts} attempts remaining.`,
          icon: "success",
        });
        setIsOverlay(false);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage(error.response.data.message);
        if (error.response.data.message.includes("Maximum resend attempts")) {
          // Kembali ke form registrasi
          setIsOtpSent(false);
          setOtp("");
          setErrorMessage("");
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setProgressWidth("");
        }
      } else {
        setErrorMessage("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  if (isOtpSent && !isOtpVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {isLoading && (
          <div
            className={`fixed inset-0  flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out ${
              isOverlay ? "bg-transparent" : "bg-black/30"
            }`}
          >
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full text-white"></div>
          </div>
        )}

        {isOverlay && (
          <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-100 transition-opacity duration-300 ease-in-out "></div>
        )}

        <Link to="/" className="mb-8 group">
          <img
            src={assets.forever_icon}
            alt="Atlas Icon"
            className="w-32 sm:w-40 "
          />
        </Link>

        <div className="w-[90%] sm:max-w-md p-8 bg-white shadow-xl rounded-xl transition-all duration-500 hover:shadow-2xl  border border-gray-100">
          {/* Email Verification Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <SiGmail
                alt="Verification"
                className="w-9 h-9 object-contain text-[#EA4335] "
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">Weve sent a verification code to</p>
            <p className="text-blue-600 font-medium break-all">{email}</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="w-full text-center text-red-700 bg-red-100 border border-red-300 px-4 py-3 rounded-lg mb-6 flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* OTP Input Section */}
          <div className="space-y-6">
            <div className="relative group">
              <input
                className="w-full px-4 pt-6 pb-2 text-center text-2xl tracking-[1em] font-medium border-2 border-gray-300 rounded-lg shadow-sm   
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent   
        transition-all duration-300   
        placeholder-transparent   
        group-hover:border-blue-300"
                type="text"
                id="otp"
                maxLength="6"
                placeholder=" "
                value={otp}
                onChange={(e) => {
                  const re = /^[0-9\b]+$/;
                  if (e.target.value === "" || re.test(e.target.value)) {
                    setOtp(e.target.value);
                  }
                }}
              />
              <label
                htmlFor="otp"
                className={`absolute left-4 text-gray-500 transition-all duration-200 transform bg-white px-1   
        ${otp ? "-top-2 text-xs text-blue-600" : "top-3 text-sm"}  
        group-hover:text-blue-500`}
                style={{ pointerEvents: "none" }}
              >
                Enter 6-digit Code
              </label>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={verifyOtpHandler}
              className={`w-full py-3 px-4 rounded-full transition-all duration-300   
  flex items-center justify-center space-x-2 group  
  ${
    otp.length !== 6
      ? "bg-gray-200 cursor-not-allowed text-gray-500"
      : "bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-[1.02] hover:shadow-lg"
  }`}
              disabled={otp.length !== 6}
            >
              <span>Verify Email</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-opacity   
    ${otp.length !== 6 ? "opacity-0" : "opacity-100"}`}
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

            {/* Resend Section */}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">Didnt receive the code?</p>
              {resendTimer > 0 ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Resend available in {resendTimer} seconds
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  className={`text-blue-600 hover:text-blue-800 text-sm font-medium   
          flex items-center justify-center space-x-2 mx-auto   
          ${resendAttempts >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleResendOtp}
                  disabled={resendAttempts >= 3 || resendTimer > 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Resend Code{" "}
                    {resendAttempts > 0 &&
                      `(${3 - resendAttempts} attempts left)`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Back to Registration */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 text-sm   
      flex items-center justify-center space-x-2 mx-auto   
      hover:bg-gray-100 px-4 py-2 rounded-full transition-colors"
              onClick={() => {
                // Your existing reset logic
                setIsOtpSent(false);
                setOtp("");
                setErrorMessage("");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                // Reset OTP related states
                setResendAttempts(0);
                setResendTimer(0);
                if (intervalId) {
                  clearInterval(intervalId);
                  setIntervalId(null);
                }

                // Reset password strength states
                setIsPasswordStrong(false);
                setProgressWidth([0, 0, 0]);

                // Reset password visibility states
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 010 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back to Registration</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full text-white"></div>
        </div>
      )}
      <Link to="/" className="my-8">
        <img
          src={assets.forever_icon}
          alt="Atlas Icon"
          className="w-32 sm:w-40"
        />
      </Link>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 gap-6 p-5 sm:p-8 bg-white shadow-xl rounded-xl transition-all duration-500 hover:shadow-2xl  border border-gray-100"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <p className="prata-regular text-3xl">Sign Up</p>
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
        </div>
        <div className="relative w-full">
          <input
            className={`w-full px-4 pt-6 pb-2 border ${
              email && !isValidEmail
                ? "border-red-500"
                : "focus:ring-2 focus:ring-blue-500"
            } rounded-lg shadow-sm focus:outline-none  placeholder-transparent`}
            type="email"
            id="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
          />
          <label
            htmlFor="email"
            className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1  
          ${email ? "-top-2 text-xs" : "top-3 text-sm"}`}
            style={{ pointerEvents: "none" }}
          >
            Email
          </label>
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
          {email && isValidEmail && (
            <p className="text-green-500 text-xs mt-1">
              Valid email format. You will receive an OTP code for verification.
            </p>
          )}
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
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-full transition-all duration-300   
  flex items-center justify-center space-x-2 group  
  ${
    !isPasswordStrong || !username || !email || !password || !confirmPassword
      ? "bg-gray-200 cursor-not-allowed text-gray-500"
      : "bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-[1.02] hover:shadow-lg"
  }`}
          disabled={
            !isPasswordStrong ||
            !username ||
            !email ||
            !password ||
            !confirmPassword
          }
        >
          <span>Sign Up</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-opacity   
    ${
      !isPasswordStrong || !username || !email || !password || !confirmPassword
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
            <span className="text-black">Already have an account?</span>
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

export default Register;
