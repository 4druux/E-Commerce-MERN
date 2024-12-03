import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ModalLogin from "./ModalLogin";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    setShowSearch,
    getCartCount,
    isLoggedIn,
    logoutUser,
    setIsModalLogin,
    isModalLogin,
  } = useContext(ShopContext);
  const [loginStatus, setLoginStatus] = useState(isLoggedIn);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setLoginStatus(isLoggedIn);
  }, [isLoggedIn]);

  const handleLogout = () => {
    logoutUser();
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setVisible(false);
        document.body.classList.remove("overflow-hidden");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, sidebarRef]);

  useEffect(() => {
    if (visible) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [visible]);

  const isCollectionPage = location.pathname === "/collection";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const handleProfileClick = () => {
    if (loginStatus) {
      setIsDropdownOpen((prev) => !prev);
    } else {
      setIsDropdownOpen(true);
    }
  };

  const toggleSidebar = () => {
    setVisible(!visible);
  };

  return (
    <>
      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          isScrolled ? "shadow-md" : ""
        }`}
        style={{ zIndex: 49 }}
      >
        <div className="bg-white w-full">
          <div className="max-w-[100%] md:max-w-[85%] lg:max-w-[85%] xl:max-w-[82%] 2xl:max-w-[81%] mx-auto px-4 flex items-center justify-between py-5 font-medium relative">
            <Link to="/">
              <img src={assets.forever_logo} className="w-9" alt="Logo" />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden sm:flex gap-5 text-md text-gray-700">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 relative pb-2 mt-2 ${
                    isActive
                      ? "text-gray-950 after:content-[''] after:absolute after:w-8 after:h-[2px] after:bg-gray-950 after:bottom-0 after:left-[50%] after:translate-x-[-50%]"
                      : "text-gray-700"
                  }`
                }
              >
                <p>HOME</p>
              </NavLink>
              <NavLink
                to="/collection"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 relative pb-2 mt-2 ${
                    isActive
                      ? "text-gray-950 after:content-[''] after:absolute after:w-8 after:h-[2px] after:bg-gray-950 after:bottom-0 after:left-[50%] after:translate-x-[-50%]"
                      : "text-gray-700"
                  }`
                }
              >
                <p>COLLECTION</p>
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 relative pb-2 mt-2 ${
                    isActive
                      ? "text-gray-950 after:content-[''] after:absolute after:w-8 after:h-[2px] after:bg-gray-950 after:bottom-0 after:left-[50%] after:translate-x-[-50%]"
                      : "text-gray-700"
                  }`
                }
              >
                <p>ABOUT</p>
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 relative pb-2 mt-2 ${
                    isActive
                      ? "text-gray-950 after:content-[''] after:absolute after:w-8 after:h-[2px] after:bg-gray-950 after:bottom-0 after:left-[50%] after:translate-x-[-50%]"
                      : "text-gray-700"
                  }`
                }
              >
                <p>CONTACT</p>
              </NavLink>
            </ul>

            {/* Mobile Navigation and Other Icons */}
            <div className="flex items-center gap-6">
              {isCollectionPage && (
                <img
                  onClick={() => setShowSearch(true)}
                  src={assets.search_icon}
                  className="w-5 cursor-pointer"
                  alt="Search"
                />
              )}

              {loginStatus && (
                <Link to="/cart" className="relative">
                  <img
                    src={assets.cart_icon}
                    className="w-5 min-w-5"
                    alt="Cart"
                  />
                  <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                    {getCartCount()}
                  </p>
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <img
                  src={assets.profile_icon}
                  className="w-5 cursor-pointer"
                  alt="Profile"
                  onClick={handleProfileClick}
                />

                {/* Dropdown untuk pengguna yang belum login */}
                {!loginStatus && (
                  <div
                    className={`absolute z-50 right-0 mt-4 w-36 py-3 px-4 bg-white text-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
                      isDropdownOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible translate-y-[-10px]"
                    }`}
                  >
                    <p
                      onClick={() => {
                        setIsModalLogin(true);
                        setIsDropdownOpen(false);
                      }}
                      className="block py-2 px-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200 cursor-pointer"
                    >
                      Login
                    </p>
                    <Link
                      to="/register"
                      className="block py-2 px-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}

                {loginStatus && (
                  <div
                    className={`absolute z-50 right-0 mt-4 w-36 py-3 px-4 bg-white text-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
                      isDropdownOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible translate-y-[-10px]"
                    }`}
                  >
                    <Link
                      to="/profile"
                      className="block py-2 px-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block py-2 px-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    <p
                      onClick={handleLogout}
                      className="block py-2 px-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200 cursor-pointer"
                    >
                      Logout
                    </p>
                  </div>
                )}
              </div>

              <img
                onClick={toggleSidebar}
                src={assets.menu_icon}
                className="w-5 cursor-pointer sm:hidden"
                alt="Menu"
              />
            </div>

            {/* Overlay background ketika sidebar aktif */}
            {visible && (
              <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            )}

            {/* Sidebar menu */}
            <div
              ref={sidebarRef}
              className={`fixed top-0 right-0 bottom-0 bg-white transition-all z-50 ${
                visible ? "w-1/2" : "w-0"
              } overflow-hidden`}
            >
              <div className="flex flex-col gap-5 text-gray-600 h-full">
                <div
                  onClick={toggleSidebar}
                  className="flex items-center gap-4 p-3 cursor-pointer"
                >
                  <img
                    src={assets.dropdown_icon}
                    className="h-4 rotate-180"
                    alt="Back"
                  />
                  <p>Back</p>
                </div>
                <NavLink
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `py-2 pl-6 ${
                      isActive
                        ? "bg-black text-white rounded-md px-4"
                        : "text-gray-600"
                    }`
                  }
                  to="/"
                >
                  HOME
                </NavLink>
                <NavLink
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `py-2 pl-6 ${
                      isActive
                        ? "bg-black text-white rounded-md px-4"
                        : "text-gray-600"
                    }`
                  }
                  to="/collection"
                >
                  COLLECTION
                </NavLink>
                <NavLink
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `py-2 pl-6 ${
                      isActive
                        ? "bg-black text-white rounded-md px-4"
                        : "text-gray-600"
                    }`
                  }
                  to="/about"
                >
                  ABOUT
                </NavLink>
                <NavLink
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `py-2 pl-6 ${
                      isActive
                        ? "bg-black text-white rounded-md px-4"
                        : "text-gray-600"
                    }`
                  }
                  to="/contact"
                >
                  CONTACT
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalLogin && <ModalLogin />}

      <div className="pt-24">{/* Konten utama mulai di sini */}</div>
    </>
  );
};

export default Navbar;
