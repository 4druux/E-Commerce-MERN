import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { assets } from "../assets/assets";

const AdminPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Overlay untuk layar kecil dan besar ketika sidebar aktif */}
      <div
        className={`fixed inset-0 bg-black opacity-50 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Konten utama yang menyesuaikan dengan lebar sidebar pada layar besar */}
      <div
        className={`flex-1 transition-all duration-500 ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        {/* Navbar untuk menu dan profil */}
        <div className="flex justify-between items-center p-4 bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
          {/* Ikon menu di kiri */}
          <img
            onClick={toggleSidebar}
            src={assets.menu_icon_left}
            className="w-5 cursor-pointer"
            alt="Menu"
          />

          {/* Ruang kosong untuk membuat posisi ikon profil di kanan */}
          <div className="flex-1"></div>

          {/* Ikon profil di kanan */}
          <div className="relative" ref={profileMenuRef}>
            <img
              onClick={toggleProfileMenu}
              src={assets.profile_icon}
              className="w-5 cursor-pointer"
              alt="Profile"
            />
            {isProfileMenuOpen && (
              <div
                className={`absolute z-10 right-0 mt-2 w-40 py-3 px-4 bg-white text-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
                  isProfileMenuOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-[-10px]"
                }`}
              >
                <button
                  onClick={() => alert("Pengaturan Akun")}
                  className="block py-2 px-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Pengaturan Akun
                </button>
                <button
                  onClick={handleLogout}
                  className="block py-2 px-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Konten Utama */}
        <div className="pt-16 px-0 mt-9 md:mt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
