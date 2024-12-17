import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ModalLogin from "./ModalLogin";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronLeftIcon, Search } from "lucide-react";

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
  const [isDropdownNotifOpen, setIsDropdownNotifOpen] = useState(false);
  const location = useLocation();

  const dropdownRef = useRef(null);
  const dropdownNotifRef = useRef(null);
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
      if (
        dropdownNotifRef.current &&
        !dropdownNotifRef.current.contains(event.target)
      ) {
        setIsDropdownNotifOpen(false);
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
  }, [dropdownRef, dropdownNotifRef, sidebarRef]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  const isSearchPage =
    location.pathname === "/collection" || location.pathname === "/orders";

  useEffect(() => {
    if (!isSearchPage) {
      setShowSearch(false);
    }
  }, [location, isSearchPage, setShowSearch]);

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

  const handleNotifClick = () => {
    if (loginStatus) {
      setIsDropdownNotifOpen((prev) => !prev);
    } else {
      setIsDropdownNotifOpen(true);
    }
  };

  const toggleSidebar = () => {
    setVisible(!visible);
  };

  const menuItems = [
    {
      to: "/",
      label: "HOME",
      activeColor: "bg-black text-white",
    },
    {
      to: "/collection",
      label: "COLLECTION",
      activeColor: "bg-black text-white",
    },
    {
      to: "/about",
      label: "ABOUT",
      activeColor: "bg-black text-white",
    },
    {
      to: "/contact",
      label: "CONTACT",
      activeColor: "bg-black text-white",
    },
  ];

  const sidebarVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
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
            <div className="flex items-start md:gap-6 gap-4">
              {isSearchPage && (
                <Search
                  onClick={() => setShowSearch((prev) => !prev)}
                  className="w-6 mt-1 cursor-pointer text-gray-700"
                  alt="Search"
                />
              )}

              {loginStatus && (
                <Link to="/cart" className="relative">
                  <img
                    src={assets.cart_icon}
                    className="w-5 min-w-5 mt-1"
                    alt="Cart"
                  />
                  <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                    {getCartCount()}
                  </p>
                </Link>
              )}

              {loginStatus && (
                <div className="relative" ref={dropdownNotifRef}>
                  <Bell
                    className="w-6 h-6 mt-1 cursor-pointer"
                    alt="notification"
                    onClick={handleNotifClick}
                  />
                  <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-red-500 text-white aspect-square rounded-full text-[8px]">
                    {12}
                  </p>

                  {loginStatus && (
                    <div
                      className={`absolute z-50 left-1/2 transform -translate-x-1/2 mt-4 w-60 py-3 px-4 bg-white text-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-out ${
                        isDropdownNotifOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible translate-y-[-10px]"
                      }`}
                    >
                      <div className="flex flex-col overflow-y-auto max-h-64 [&::-webkit-scrollbar]:w-[4px] scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                        {Array.from({ length: 20 }).map((_, index) => (
                          <div
                            key={index}
                            className="text-center py-2 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:translate-y-1 transition-all duration-500 ease-in-out"
                          >
                            <span className="text-sm font-semibold ">
                              Coming Soon
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="relative" ref={dropdownRef}>
                <img
                  src={assets.profile_icon}
                  className="w-5 mt-1 cursor-pointer"
                  alt="Profile"
                  onClick={handleProfileClick}
                />

                {/* Dropdown untuk pengguna yang belum login */}
                {!loginStatus && (
                  <div
                    className={`absolute z-50 left-1/2 transform -translate-x-1/2 mt-4 w-36 py-3 px-4 bg-white text-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
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
                    className={`absolute z-50 left-1/2 transform -translate-x-1/2 mt-4 w-36 py-3 px-4 bg-white text-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
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
                className="w-5 mt-2 cursor-pointer sm:hidden"
                alt="Menu"
              />
            </div>

            {/* Overlay background ketika sidebar aktif */}
            <AnimatePresence>
              {visible && (
                <>
                  {/* Overlay background */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={toggleSidebar}
                  />

                  {/* Sidebar menu */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={sidebarVariants}
                    className="fixed top-0 right-0 bottom-0 w-3/5 bg-white shadow-2xl rounded-l-3xl z-[100] overflow-hidden"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={toggleSidebar}
                        className="flex items-center gap-4 p-6 border-b border-gray-100 cursor-pointer group"
                      >
                        <ChevronLeftIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                        <p className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          Back
                        </p>
                      </motion.div>

                      {/* Menu Items */}
                      <motion.nav
                        initial="hidden"
                        animate="visible"
                        className="flex-grow p-4 space-y-2 overflow-y-auto"
                        variants={{
                          hidden: {
                            opacity: 0,
                            transition: {
                              staggerChildren: 0.05,
                              staggerDirection: -1,
                            },
                          },
                          visible: {
                            opacity: 1,
                            transition: {
                              delayChildren: 0.2,
                              staggerChildren: 0.1,
                            },
                          },
                        }}
                      >
                        {menuItems.map((item, index) => (
                          <NavLink
                            key={index}
                            to={item.to}
                            onClick={toggleSidebar}
                            className={({ isActive }) => `  
                      group flex items-center px-4 py-3 rounded-xl   
                      transition-all duration-300 ease-in-out  
                      ${
                        isActive
                          ? `${item.activeColor} shadow-lg`
                          : "hover:bg-gray-100 text-gray-700"
                      }  
                    `}
                          >
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="font-medium"
                            >
                              {item.label}
                            </motion.span>
                          </NavLink>
                        ))}
                      </motion.nav>

                      {/* Footer */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 text-center border-t border-gray-100"
                      >
                        <p className="text-xs text-gray-500">
                          © 2024 Forver Fashion
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {isModalLogin && <ModalLogin />}

      <div className="pt-24">{/* Konten utama mulai di sini */}</div>
    </>
  );
};

export default Navbar;
