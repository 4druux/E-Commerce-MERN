import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const CheckOut = () => {
  const [method, setMethod] = useState("cod");
  const { navigate } = useContext(ShopContext);
  const location = useLocation();

  const { selectedItems = [], delivery_fee = 0 } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);

    // Mengambil data form dari local storage jika ada
    const storedData = JSON.parse(localStorage.getItem("checkoutData"));
    if (storedData) {
      document.querySelector('input[placeholder="First Name"]').value =
        storedData.firstName || "";
      document.querySelector('input[placeholder="Last Name"]').value =
        storedData.lastName || "";
      document.querySelector('input[placeholder="Email address"]').value =
        storedData.email || "";
      document.querySelector('input[placeholder="Street "]').value =
        storedData.street || "";
      document.querySelector('input[placeholder="City"]').value =
        storedData.city || "";
      document.querySelector('input[placeholder="State"]').value =
        storedData.addressState || "";
      document.querySelector('input[placeholder="Zip code"]').value =
        storedData.zipCode || "";
      document.querySelector('input[placeholder="Country"]').value =
        storedData.country || "";
      document.querySelector('input[placeholder="Phone "]').value =
        storedData.phone || "";
      setMethod(storedData.paymentMethod || "cod");
    }
  }, []);

  const handleCheckout = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const firstName = document.querySelector(
      'input[placeholder="First Name"]'
    ).value;
    const lastName = document.querySelector(
      'input[placeholder="Last Name"]'
    ).value;
    const email = document.querySelector(
      'input[placeholder="Email address"]'
    ).value;
    const street = document.querySelector('input[placeholder="Street "]').value;
    const city = document.querySelector('input[placeholder="City"]').value;
    const state = document.querySelector('input[placeholder="State"]').value;
    const zipCode = document.querySelector(
      'input[placeholder="Zip code"]'
    ).value;
    const country = document.querySelector(
      'input[placeholder="Country"]'
    ).value;
    const phone = document.querySelector('input[placeholder="Phone "]').value;

    // Regex untuk validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validasi untuk memastikan semua field diisi dan email memiliki format yang benar
    if (
      !firstName ||
      !lastName ||
      !email ||
      !street ||
      !city ||
      !state ||
      !zipCode ||
      !country ||
      !phone
    ) {
      toast.error("Please fill in all fields", {
        autoClose: 1500,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    } else if (!emailRegex.test(email)) {
      toast.error("email is not valid ", {
        autoClose: 1500,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    }

    // Simpan data form ke local storage
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        firstName,
        lastName,
        email,
        street,
        city,
        addressState: state,
        zipCode,
        country,
        phone,
        paymentMethod: method,
      })
    );

    // Refetch data untuk memastikan `imageUrl` dan `name` benar-benar tersedia
    const itemsWithDetails = await Promise.all(
      selectedItems.map(async (item) => {
        if (!item.imageUrl || !item.name) {
          const productResponse = await axios.get(
            `https://ecommerce-backend-ebon-six.vercel.app/api/products/${item._id}`
          );
          const product = productResponse.data;
          item.imageUrl = product.image
            ? product.image[0]
            : "/placeholder-image.png";
          item.name = product.name;
        }
        return item;
      })
    );

    navigate("/payment", {
      state: {
        firstName,
        lastName,
        email,
        street,
        city,
        addressState: state,
        zipCode,
        country,
        phone,
        paymentMethod: method,
        selectedItems: itemsWithDetails,
        delivery_fee,
      },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2="INFORMATION" />
        </div>
        {/* Input Fields */}
        <div className="flex gap-3">
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First Name"
          />
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street "
        />
        <div className="flex gap-3">
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zip code"
          />
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone "
        />
      </div>

      {/* Right Side */}
      <div className="mt-12">
        <div className="mt-8 min-w-80">
          <CartTotal selectedItems={selectedItems} />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3 lg:max-w-lg">
            <div
              onClick={() => setMethod("qris")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "qris" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "qris" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-6 mx-2" src={assets.qris_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("bca")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "bca" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "bca" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-5 mx-2" src={assets.bca_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("bni")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "bni" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "bni" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-4 mx-2" src={assets.bni_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("bri")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "bri" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "bri" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-5 mx-2" src={assets.bri_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("mandiri")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "mandiri" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "mandiri" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-6 mx-2" src={assets.mandiri_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("indomart")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "indomart" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "indomart" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-6 mx-2" src={assets.indomart_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("alfamart")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "alfamart" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "alfamart" ? "bg-gray-950" : ""
                }`}
              ></p>
              <img className="h-6 mx-2" src={assets.alfamart_icon} alt="" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-2 border p-2 px-3 cursor-pointer ${
                method === "cod" ? "border-gray-950" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-2.5 h-2.5 border rounded-full ${
                  method === "cod" ? "bg-black" : ""
                }`}
              ></p>
              <p
                className={`text-xs font-medium whitespace-nowrap ${
                  method === "cod" ? "text-gray-950" : "text-gray-500"
                }`}
              >
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-center sm:text-end mt-8">
            <button
              onClick={handleCheckout}
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PROCEED TO PAYMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
