import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";

const ModalLogin = ({ onLoginSuccess }) => {
  const { loginUser, isLoginModalOpen, setIsLoginModalOpen } =
    useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();

  const resetInputs = () => {
    setEmail("");
    setPassword("");
    setErrorMessage("");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://ecommerce-backend-ebon-six.vercel.app/api/user/login",
        { email, password }
      );

      if (response.data.token) {
        const { token, role, expiresIn } = response.data;
        const expirationTime = new Date().getTime() + expiresIn * 1000;

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("tokenExpiration", expirationTime);

        loginUser(token);
        setIsLoginModalOpen(false);
        resetInputs();

        // Navigasi berdasarkan role
        if (role === "admin") {
          navigate("/admin/dashboard"); // Arahkan admin ke dashboard
        } else {
          // Jika bukan admin, panggil onLoginSuccess untuk navigasi fleksibel
          if (onLoginSuccess) {
            onLoginSuccess(); // Panggil callback untuk melanjutkan proses
          }
        }
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setErrorMessage("Invalid email or password. Please try again.");
            break;
          case 403:
            setErrorMessage(
              "You don't have permission to access this account."
            );
            break;
          default:
            setErrorMessage("An error occurred. Please try again later.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsModalVisible(true), 100);
    } else {
      document.body.style.overflow = "auto";
      setIsModalVisible(false);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoginModalOpen]);

  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay") {
      closeModalWithAnimation(false);
    }
  };

  const closeModalWithAnimation = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsLoginModalOpen(false);
    }, 700);
  };

  if (!isLoginModalOpen) return null;

  return (
    <div
      id="modal-overlay"
      onClick={handleClickOutside}
      className={`fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
        isLoading ? "bg-transparent" : "bg-black bg-opacity-50"
      }`}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full text-white"></div>
        </div>
      )}
      <div
        className={`relative w-[90%] sm:max-w-md p-5 sm:p-8 bg-white shadow-xl rounded-xl transition-all duration-700 ease-in-out ${
          isModalVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-gray-900 hover:text-gray-800 transition-all duration-300 hover:rotate-90"
          onClick={closeModalWithAnimation}
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col items-center m-auto mt-14 gap-6"
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
              className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1 ${
                email ? "-top-2 text-xs" : "top-3 text-sm"
              }`}
            >
              Email
            </label>
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
              className={`absolute left-4 text-gray-500 transition-all duration-150 transform bg-white px-1 ${
                password ? "-top-2 text-xs" : "top-3 text-sm"
              }`}
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

          <div className="w-full flex justify-between text-sm">
            <p
              onClick={() => {
                navigate("/forgot-password");
                closeModalWithAnimation();
              }}
              className="text-blue-500 hover:text-blue-700 cursor-pointer"
            >
              Forgot your password?
            </p>
            <p>
              <span
                onClick={() => {
                  navigate("/register");
                  closeModalWithAnimation();
                }}
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                Create account
              </span>
            </p>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2 group font-normal ${
              !email || !password
                ? "bg-gray-200 cursor-not-allowed text-gray-500"
                : "bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-[1.02] hover:shadow-lg"
            }`}
            disabled={!email || !password}
          >
            <span>Sign In</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-opacity ${
                !email || !password ? "opacity-0" : "opacity-100"
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
        </form>
      </div>
    </div>
  );
};

// Tambahkan validasi prop
ModalLogin.propTypes = {
  onLoginSuccess: PropTypes.func, // Menentukan bahwa onLoginSuccess adalah fungsi
};

export default ModalLogin;
