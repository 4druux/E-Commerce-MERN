import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="container">
      {/* Grid layout for desktop, flex-col for mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-14 my-10 mt-40 text-sm">
        {/* Company Section */}
        <div className="col-span-4">
          <img
            src={assets.forever_icon}
            className="mb-5 w-40 h-12"
            alt="Atlas Icon"
          />
          <p className="w-full text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
            illum culpa quo cupiditate minus, sequi repudiandae dolor obcaecati
            sed aliquam.
          </p>
        </div>

        {/* Company Links */}
        <div className="col-span-2">
          <p className="text-base font-medium mb-5 text-gray-800">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <Link to="/" onClick={scrollToTop}>
              <li>Home</li>
            </Link>
            <Link to="/about" onClick={scrollToTop}>
              <li>About us</li>
            </Link>
            <Link to="/cart" onClick={scrollToTop}>
              <li>Delivery</li>
            </Link>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div className="col-span-2">
          <p className="text-base font-medium mb-5 text-gray-800">
            GET IN TOUCH
          </p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+62 877-0855-9046</li>
            <li>4drux@gmail.com</li>
          </ul>
        </div>

        {/* Payment Gateway */}
        <div className="col-span-4">
          <p className="text-base font-medium mb-5 text-gray-800">
            PAYMENT GATEWAY
          </p>
          {/* Neater grid for payment icons */}
          <div className="grid grid-cols-3 gap-1 sm:gap-4 items-center sm:grid-cols-3">
            <img src={assets.bca_icon} alt="BCA" className="h-8 " />
            <img src={assets.bni_icon} alt="BNI" className="h-8 " />
            <img src={assets.bri_icon} alt="BRI" className="h-8 " />
            <img src={assets.mandiri_icon} alt="Mandiri" className="h-8 " />
            <img src={assets.indomart_icon} alt="Indomart" className="h-8 " />
            <img src={assets.alfamart_icon} alt="Alfamart" className="h-8 " />
            <img src={assets.qris_icon} alt="QRIS" className="h-8 " />
          </div>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2024@ 4drux.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
