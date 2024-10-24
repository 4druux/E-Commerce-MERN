import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import PropTypes from "prop-types";

const Sidebar = ({ isOpen, setIsSidebarOpen }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300`}
    >
      <div className="flex justify-between items-center mb-4">
        <img src={assets.atlas_icon} alt="Logo" className="w-10" />
        <img
          src={assets.cross_icon}
          alt="Close"
          className="w-4 cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      <ul className="space-y-4 mt-10">
        <li>
        <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "bg-black text-white px-4 py-2 rounded-md flex items-center"
                : "px-4 py-2 rounded-md flex items-center hover:bg-gray-100"
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className="mr-2 group">
                  <img
                    src={assets.dashboard_icon}
                    className={`w-5 filter ${isActive ? "invert" : ""}`}
                    alt=""
                  />
                </span>
                Dashboard
              </>
            )}
          </NavLink>
        </li>
        <li>
        <NavLink
            to="/admin/add"
            className={({ isActive }) =>
              isActive
                ? "bg-black text-white px-4 py-2 rounded-md flex items-center"
                : "px-4 py-2 rounded-md flex items-center hover:bg-gray-100"
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className="mr-2 group">
                  <img
                    src={assets.add_icon}
                    className={`w-5 filter ${isActive ? "invert" : ""}`}
                    alt=""
                  />
                </span>
                Add Item
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/list"
            className={({ isActive }) =>
              isActive
                ? "bg-black text-white px-4 py-2 rounded-md flex items-center"
                : "px-4 py-2 rounded-md flex items-center hover:bg-gray-100"
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className="mr-2 group">
                  <img
                    src={assets.order_icon}
                    className={`w-5 filter ${isActive ? "invert" : ""}`}
                    alt=""
                  />
                </span>
                List Items
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive
                ? "bg-black text-white px-4 py-2 rounded-md flex items-center"
                : "px-4 py-2 rounded-md flex items-center hover:bg-gray-100"
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className="mr-2 group">
                  <img
                    src={assets.order_icon}
                    className={`w-5 filter ${isActive ? "invert" : ""}`}
                    alt=""
                  />
                </span>
                Orders
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;
