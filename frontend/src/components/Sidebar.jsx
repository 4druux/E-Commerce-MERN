import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  PlusIcon,
  ClipboardListIcon,
  ShoppingCartIcon,
  XIcon,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsSidebarOpen }) => {
  const sidebarVariants = {
    hidden: {
      x: "-100%",
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

  const menuItems = [
    {
      to: "/admin/dashboard",
      icon: HomeIcon,
      label: "Dashboard",
      activeColor: "bg-black text-white",
    },
    {
      to: "/admin/add",
      icon: PlusIcon,
      label: "Add Product",
      activeColor: "bg-black text-white",
    },
    {
      to: "/admin/list",
      icon: ClipboardListIcon,
      label: "Product Management",
      activeColor: "bg-black text-white",
    },
    {
      to: "/admin/orders",
      icon: ShoppingCartIcon,
      label: "Orders",
      activeColor: "bg-black text-white",
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            key="sidebar"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-lg rounded-r-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3"
              >
                <img
                  src={assets.forever_icon}
                  alt="Logo"
                  className="w-40 h-auto"
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>

            {/* Menu Items */}
            <motion.nav
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="p-4 space-y-2"
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
                  className={({ isActive }) => `  
                  group flex items-center space-x-3 px-4 py-2.5 rounded-xl   
                  transition-all duration-300 ease-in-out hover:-translate-y-1
                  ${
                    isActive
                      ? `${item.activeColor} shadow-lg`
                      : "hover:bg-gray-100 text-gray-700"
                  }  
                `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-700"
                          } transition-colors`}
                        />
                      </motion.div>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    </>
                  )}
                </NavLink>
              ))}
            </motion.nav>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-0 left-0 right-0 p-6 text-center border-t border-gray-100"
            >
              <p className="text-xs text-gray-500">© 2024 Forever Fashion</p>
            </motion.div>
          </motion.div>

          {/* Overlay background ketika sidebar aktif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;
