import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* Grid layout for desktop, flex-col for mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-14 my-10 mt-40 text-sm">
        {/* Company Section */}
        <div className="col-span-4">
          <img
            src={assets.forever_icon}
            className="w-40 h-12"
            alt="Atlas Icon"
          />
          <div className="flex items-center space-x-3 my-3">
            <a href="https://www.instagram.com/andrew.smg/" target="_blank">
              <FaInstagram className="w-6 h-6 text-[#E4405F] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="https://www.threads.net" target="_blank">
              <FaThreads className="w-6 h-6 text-[#262626] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="https://github.com/4druux" target="_blank">
              <FaGithub className="w-6 h-6 text-[#333333] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="https://twitter.com" target="_blank">
              <FaXTwitter className="w-6 h-6 text-[#1DA1F2] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="mailto:vortexseries505gmail.com" target="_blank">
              <SiGmail className="w-6 h-6 text-[#EA4335] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
          </div>

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
            <Link to="/" onClick={scrollToTop} className="hover:text-blue-600">
              <li>Home</li>
            </Link>
            <Link
              to="/about"
              onClick={scrollToTop}
              className="hover:text-blue-600"
            >
              <li>About us</li>
            </Link>
            <Link
              to="/cart"
              onClick={scrollToTop}
              className="hover:text-blue-600"
            >
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
            <li>+62 XXX-XXXX-XXX</li>

            <li>vortexseries505@gmail.com</li>
          </ul>
        </div>

        {/* Payment Gateway */}
        <div className="col-span-4">
          <p className="text-base font-medium mb-5 text-gray-800">
            PAYMENT GATEWAY
          </p>
          {/* Neater and responsive grid for payment icons */}
          <div className="grid grid-cols-3  md:grid-cols-4  gap-4 justify-center items-center">
            <img src={assets.bca_icon} alt="BCA" className="h-6 mx-auto" />
            <img src={assets.bni_icon} alt="BNI" className="h-5 mx-auto" />
            <img src={assets.bri_icon} alt="BRI" className="h-6 mx-auto" />
            <img
              src={assets.mandiri_icon}
              alt="Mandiri"
              className="h-6 mx-auto"
            />
            <img
              src={assets.indomart_icon}
              alt="Indomart"
              className="h-6 mx-auto"
            />
            <img
              src={assets.alfamart_icon}
              alt="Alfamart"
              className="h-6 mx-auto"
            />
            <img src={assets.qris_icon} alt="QRIS" className="h-6 mx-auto" />
          </div>
        </div>
      </div>

      <div>
        <hr />
        <div className="py-5 text-sm text-gray-600 flex flex-col items-center md:flex-row gap-1 md:justify-center ">
          Copyright 2024 © 2024 Forver Fashion
          <div className="flex gap-1 ">
            <p>- Developer by</p>
            <a
              href="https://4druux-portfolio.vercel.app/"
              target="_blank"
              className="text-blue-500 hover:text-blue-600 hover:translate-y-[-4px] transform transition-all duration-300 ease-in-out cursor-pointer"
            >
              4druuu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
