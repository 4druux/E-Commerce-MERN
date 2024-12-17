import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { formatPrice } from "../utils/formatPrice";
import { assets } from "../assets/assets";
import SweetAlert from "../components/SweetAlert";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handlePayment } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

  const {
    firstName = "First Name",
    lastName = "Last Name",
    email = "Email",
    street = "Street",
    city = "City",
    addressState = "State",
    zipCode = "Zip Code",
    country = "Country",
    phone = "Phone",
    paymentMethod = "Payment Method",
    selectedItems = [],
    delivery_fee = 0,
  } = location.state || {};

  const paymentData = {
    firstName,
    lastName,
    email,
    street,
    city,
    state: addressState,
    zipCode,
    country,
    phone,
    paymentMethod,
    selectedItems,
  };

  const onConfirmPayment = async () => {
    setIsLoading(true);

    try {
      await handlePayment(
        paymentData,
        async () => {
          setIsLoading(false);
          setIsAlertActive(true);

          const result = await SweetAlert({
            title: "Payment Successful!",
            message: "Your payment has been processed successfully.",
            icon: "success",
          });

          if (result) {
            setIsAlertActive(false);
            navigate("/orders", { replace: true });
          }
        },
        () => {
          setIsLoading(false);
        }
      );
    } catch (error) {
      setIsLoading(false);
      console.error("Payment failed:", error);
    }
  };

  useEffect(() => {
    if (isLoading || isAlertActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading, isAlertActive]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 sm:pt-14 min-h-[80vh] border-t w-full px-0 sm:px-0">
      <div className="w-full max-w-full mx-auto">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"PAYMENT"} text2={"SUMMARY"} />
        </div>

        {/* Payment Details */}
        <div className="lg:bg-white px-4 lg:p-8 lg:shadow-md space-y-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <h2 className="text-base  text-gray-600">Shipping Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <FaUser className="text-gray-700 mr-3" />
                <div>
                  <p className="text-base font-medium text-gray-800">Name</p>
                  <p className="text-sm text-gray-500">
                    {firstName} {lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-700 mr-3" />
                <div>
                  <p className="text-base font-medium text-gray-800">Email</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-700 mr-3" />
                <div>
                  <p className="text-base font-medium text-gray-800">Address</p>
                  <p className="text-sm text-gray-500">
                    {street}, {city}, {addressState}, {zipCode}, {country}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-gray-700 mr-3" />
                <div>
                  <p className="text-base font-medium text-gray-800">Phone</p>
                  <p className="text-sm text-gray-500">{phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-base text-gray-600">Order Summary</h2>
            <div className="space-y-4">
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <img
                      src={item.imageUrl || "/placeholder-image.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm p-1 text-gray-500 bg-gray-100 border w-max">
                        {item.size}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-black">
                      <p>Rp{formatPrice(item.price)}</p>
                      <p className="ml-2 text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-gray-500">
                  No items found.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-medium text-gray-600">
                Payment Method
              </h3>
              {/* Display Payment Method */}
              <div className="flex items-center">
                {paymentMethod.toLowerCase() === "qris" ? (
                  <img className="h-6 mx-2" src={assets.qris_icon} alt="QRIS" />
                ) : paymentMethod.toLowerCase() === "bca" ? (
                  <img className="h-6 mx-2" src={assets.bca_icon} alt="BCA" />
                ) : paymentMethod.toLowerCase() === "bni" ? (
                  <img className="h-6 mx-2" src={assets.bni_icon} alt="BNI" />
                ) : paymentMethod.toLowerCase() === "bri" ? (
                  <img className="h-6 mx-2" src={assets.bri_icon} alt="BRI" />
                ) : paymentMethod.toLowerCase() === "mandiri" ? (
                  <img
                    className="h-6 mx-2"
                    src={assets.mandiri_icon}
                    alt="Mandiri"
                  />
                ) : paymentMethod.toLowerCase() === "indomart" ? (
                  <img
                    className="h-6 mx-2"
                    src={assets.indomart_icon}
                    alt="Indomart"
                  />
                ) : paymentMethod.toLowerCase() === "alfamart" ? (
                  <img
                    className="h-6 mx-2"
                    src={assets.alfamart_icon}
                    alt="Alfamart"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800">
                    {paymentMethod.toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            {/* Cart Total Component */}
            <CartTotal
              selectedItems={selectedItems}
              shippingFee={delivery_fee}
            />
          </div>
        </div>

        {/* Confirm Payment Button */}
        <div className="w-full text-center mt-10">
          <button
            onClick={onConfirmPayment}
            className="bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition duration-150"
          >
            CONFIRM PAYMENT
          </button>
        </div>
      </div>
      {/* Overlay Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}
    </div>
  );
};

export default Payment;
