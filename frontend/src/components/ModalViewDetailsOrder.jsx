import React from "react";
import { format } from "date-fns";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import { ChevronDown, Dot } from "lucide-react";
import PropTypes from "prop-types";

const ModalViewDetailsOrder = ({
  isViewModalOpen = false,
  isModalVisible = false,
  selectedOrder = {},
  handleClickOutside = () => {},
  closeDetailsWithAnimation = () => {},
  toggleDetails = () => {},
  isOpen = false,
  currency = "Rp",
  formatPrice = (price) => price.toLocaleString(),
  delivery_fee = 0,
  assets = {},
}) => {
  if (!isViewModalOpen) return null;

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center transition-opacity duration-700 ease-in-out ${
        isModalVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={handleClickOutside}
    >
      <div
        className={`  
          w-full lg:max-w-3xl 2xl:max-w-6xl lg:h-[90vh] h-full bg-white shadow-xl overflow-hidden  
          transform transition-all duration-700 ease-in-out mx-0 lg:mx-4 rounded-none lg:rounded-2xl   
          ${
            isModalVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          }  
          flex flex-col   
        `}
      >
        {/* Header Section */}
        <div className="sticky top-0 z-10 border-b-2 border-gray-100 transition-all duration-300 ease-in-out">
          <div
            className={`flex justify-between items-center p-5 rounded-md ${
              selectedOrder.status === "Pending"
                ? "bg-gradient-to-r from-yellow-50 to-yellow-200"
                : ["Paid", "Shipped", "Completed", "Returned"].includes(
                    selectedOrder.status
                  )
                ? "bg-gradient-to-r from-green-50 to-green-200"
                : selectedOrder.status === "Canceled"
                ? "bg-gradient-to-r from-red-50 to-red-200"
                : "bg-gradient-to-r from-gray-50 to-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-800">Order</h2>
              <span
                className={`text-md font-medium ${
                  selectedOrder.status === "Pending"
                    ? "text-yellow-500"
                    : ["Paid", "Shipped", "Completed", "Returned"].includes(
                        selectedOrder.status
                      )
                    ? "text-green-600"
                    : selectedOrder.status === "Canceled"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {selectedOrder.status}
              </span>
              <span className="text-md text-gray-600">
                #{selectedOrder._id}
              </span>
            </div>

            <button
              onClick={closeDetailsWithAnimation}
              className="text-gray-500 hover:text-gray-700 transition-all duration-300"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Left Column: Shipping Information & Order Summary */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Shipping Information
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: FaUser,
                      text: `${selectedOrder.firstName} ${selectedOrder.lastName}`,
                    },
                    { icon: FaEnvelope, text: selectedOrder.email },
                    {
                      icon: FaMapMarkerAlt,
                      text: `${selectedOrder.street}, ${selectedOrder.city}, ${selectedOrder.state}, ${selectedOrder.zipCode}, ${selectedOrder.country}`,
                    },
                    { icon: FaPhone, text: selectedOrder.phone },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <item.icon className="text-gray-600 w-5 h-5" />
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 pb-4 border-b last:border-b-0 border-gray-200 relative"
                    >
                      <img
                        src={item.imageUrl || "/placeholder-image.png"}
                        alt={item.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="font-semibold text-sm mt-1 text-gray-600">
                              {currency}
                              {formatPrice(item.price)}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center">
                              x{item.quantity} <Dot /> Size: {item.size}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {selectedOrder.orderDate
                                ? format(
                                    new Date(selectedOrder.orderDate),
                                    "dd MMM yyyy HH:mm"
                                  )
                                : "No Date"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Return Details, Payment Method & Total Amount */}
            <div className="space-y-6">
              {/* Return Details Dropdown */}
              {selectedOrder.items.some(
                (item) =>
                  item.return &&
                  (item.return.reason ||
                    item.return.description ||
                    (item.return.returnImages &&
                      item.return.returnImages.length > 0))
              ) && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="w-full">
                    <button
                      onClick={toggleDetails}
                      className="text-lg font-semibold cursor-pointer flex justify-between items-center text-gray-800 border-b pb-2 mb-4 w-full"
                    >
                      Return Details
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform duration-300 transform ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    {/* Existing return details rendering */}
                    <div
                      className={`space-y-2 transition-all ease-in-out duration-500 ${
                        isOpen
                          ? "opacity-100 max-h-screen"
                          : "opacity-0  max-h-0"
                      }`}
                    >
                      {selectedOrder.items
                        .filter(
                          (item) =>
                            item.return &&
                            (item.return.reason ||
                              item.return.description ||
                              (item.return.returnImages &&
                                item.return.returnImages.length > 0))
                        )
                        .map((item, idx) => (
                          <div key={`return-${idx}`} className="px-2">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-sm">
                                Return Request
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.return.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : item.return.status === "Approved"
                                    ? "bg-green-100 text-green-700"
                                    : item.return.status === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {item.return.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Reason:</strong> {item.return.reason}
                            </p>
                            {item.return.returnImages &&
                              item.return.returnImages.length > 0 && (
                                <div className="flex space-x-2 mt-2 overflow-x-auto">
                                  {item.return.returnImages.map(
                                    (imageUrl, imgIndex) => (
                                      <img
                                        key={imgIndex}
                                        src={imageUrl}
                                        alt={`Return Evidence ${imgIndex + 1}`}
                                        className="w-24 h-24 object-cover rounded-md cursor-pointer"
                                        onClick={() =>
                                          window.open(imageUrl, "_blank")
                                        }
                                      />
                                    )
                                  )}
                                </div>
                              )}
                            {item.return.description && (
                              <div
                                className="text-xs text-gray-500 italic mt-2"
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordWrap: "break-word",
                                }}
                              >
                                {item.return.description
                                  .split("\n")
                                  .map((paragraph, index) => (
                                    <p key={index} className="mb-1">
                                      {paragraph}
                                    </p>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  {/* Always show the date */}
                  <div className="text-right mt-2">
                    {selectedOrder.items
                      .filter((item) => item.return?.createdAt)
                      .map((item, idx) => (
                        <span
                          key={`date-${idx}`}
                          className="text-xs text-gray-400"
                        >
                          {format(
                            new Date(item.return.createdAt),
                            "dd MMM yyyy HH:mm"
                          )}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-xl p-5 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Payment Method
                </h3>
                <div className="flex items-center">
                  {/* Payment method icons rendering */}
                  <div className="flex items-center">
                    {selectedOrder.paymentMethod.toLowerCase() === "qris" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.qris_icon}
                        alt="QRIS"
                      />
                    ) : selectedOrder.paymentMethod.toLowerCase() === "bca" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.bca_icon}
                        alt="BCA"
                      />
                    ) : selectedOrder.paymentMethod.toLowerCase() === "bni" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.bni_icon}
                        alt="BNI"
                      />
                    ) : selectedOrder.paymentMethod.toLowerCase() === "bri" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.bri_icon}
                        alt="BRI"
                      />
                    ) : selectedOrder.paymentMethod.toLowerCase() ===
                      "mandiri" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.mandiri_icon}
                        alt="Mandiri"
                      />
                    ) : selectedOrder.paymentMethod.toLowerCase() ===
                      "indomart" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.indomart_icon}
                        alt="Indomart"
                      />
                    ) : selectedOrder.paymentMethod.toLowerCase() ===
                      "alfamart" ? (
                      <img
                        className="h-6 mx-2"
                        src={assets.alfamart_icon}
                        alt="Alfamart"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedOrder.paymentMethod.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Total Amount
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Subtotal",
                      items: selectedOrder.items,
                    },
                    {
                      label: "Delivery Fee",
                      value: delivery_fee,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>{item.label}</span>
                      <span>
                        {item.label === "Subtotal"
                          ? 
                            item.items.map((item, idx) => (
                              <div key={idx}>
                                {currency}
                                {formatPrice(item.price)} x {item.quantity}
                              </div>
                            ))
                          :
                            `${currency}${formatPrice(item.value)}`}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>
                      {currency}
                      {formatPrice(
                        selectedOrder.items.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        ) + delivery_fee
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ModalViewDetailsOrder.propTypes = {
  isViewModalOpen: PropTypes.bool,
  isModalVisible: PropTypes.bool,
  selectedOrder: PropTypes.shape({
    status: PropTypes.string,
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    street: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipCode: PropTypes.string,
    country: PropTypes.string,
    phone: PropTypes.string,
    orderDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        imageUrl: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.number,
        size: PropTypes.string,
        return: PropTypes.shape({
          reason: PropTypes.string,
          description: PropTypes.string,
          status: PropTypes.string,
          returnImages: PropTypes.arrayOf(PropTypes.string),
          createdAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
          ]),
        }),
      })
    ),
  }),
  handleClickOutside: PropTypes.func,
  closeDetailsWithAnimation: PropTypes.func,
  toggleDetails: PropTypes.func,
  isOpen: PropTypes.bool,
  currency: PropTypes.string,
  formatPrice: PropTypes.func,
  delivery_fee: PropTypes.number,
  assets: PropTypes.object,
};

export default ModalViewDetailsOrder;
