import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { format } from "date-fns";
import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
} from "react-icons/fa"; // Icon untuk detail dan tombol close

const UserOrders = () => {
  const {
    orders,
    currency,
    delivery_fee,
    fetchOrders,
    cancelOrder,
    updateOrderStatus,
  } = useContext(ShopContext);
  const [filteredStatus, setFilteredStatus] = useState("Pending");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentOrderForReview, setCurrentOrderForReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    review: "",
    images: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      fetchOrders(token); // Fetch orders on initial render
    }

    // Set up polling to fetch orders every 10 seconds
    const intervalId = setInterval(() => {
      if (token) {
        fetchOrders(token); // Fetch orders periodically
      }
    }, 10000); // Polling interval set to 10 seconds (adjust as needed)

    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
    };
  }, [fetchOrders]);

  useEffect(() => {
    if (selectedOrder) {
      document.body.classList.add("overflow-hidden");
      setIsModalVisible(true);
    } else {
      document.body.classList.remove("overflow-hidden");
      setIsModalVisible(false);
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedOrder]);

  const filteredOrders = orders.filter(
    (order) => order.status === filteredStatus
  );

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay") {
      closeDetails();
    }
  };

  const closeDetailsWithAnimation = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedOrder(null);
    }, 700);
  };

  const confirmCancelOrder = (order) => {
    setOrderToCancel(order);
    setIsCancelModalVisible(true);
  };

  const handleCancelOrder = () => {
    if (orderToCancel) {
      cancelOrder(orderToCancel._id);
      setIsCancelModalVisible(false);
      setFilteredStatus("Canceled");
    }
  };

  const handleMarkAsCompleted = (order) => {
    setCurrentOrderForReview(order);
    setIsReviewModalVisible(true);
  };

  const handleMarkAsReturned = async (order) => {
    await updateOrderStatus(order._id, "Returned");
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");

    const formData = {
      rating: reviewData.rating,
      reviewText: reviewData.review,
      size: currentOrderForReview.items[0].size,
    };

    if (reviewData.images && reviewData.images.length > 0) {
      const imagePromises = reviewData.images.map((image) =>
        convertToBase64(image)
      );
      const base64Images = await Promise.all(imagePromises);
      formData.reviewImages = base64Images;
    } else {
      formData.reviewImages = [];
    }

    try {
      await axios.post(
        `https://ecommerce-backend-ebon-six.vercel.app/api/products/${currentOrderForReview.items[0].productId}/review`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await updateOrderStatus(currentOrderForReview._id, "Completed");

      setIsReviewModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error("Failed to submit review:", error.response?.data || error);
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div className="block md:hidden mb-6">
        <select
          value={filteredStatus}
          onChange={(e) => setFilteredStatus(e.target.value)}
          className="w-full p-2 border rounded-md "
        >
          {[
            "Pending",
            "Paid",
            "Processing",
            "Shipped",
            "Completed",
            "Returned",
            "Canceled",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:flex gap-2 my-6 justify-center whitespace-nowrap">
        {[
          "Pending",
          "Paid",
          "Processing",
          "Shipped",
          "Completed",
          "Returned",
          "Canceled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilteredStatus(status)}
            className={`px-3 py-1 rounded-full border text-xs transition duration-300 ${
              filteredStatus === status
                ? "bg-black text-white shadow-lg transform scale-105 border-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No orders found.</p>
      ) : (
        <div>
          {filteredOrders.map((order, index) => (
            <div
              key={index}
              className="py-4 my-5 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-4 text-sm">
                <img
                  className="w-16 sm:w-20"
                  src={order.items[0]?.imageUrl || "/placeholder-image.png"}
                  alt={order.items[0]?.name || "No Product Image"}
                />
                <div>
                  <p className="font-medium text-base sm:text-base">
                    {order.items[0]?.name || "No Product Name"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                    <p className="text-sm">
                      {currency}
                      {formatPrice(
                        order.items.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        ) + delivery_fee
                      )}
                    </p>
                    <p>x{order.items[0]?.quantity || "N/A"}</p>
                    <p>Size: {order.items[0]?.size || "N/A"}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Date:{" "}
                    <span className="text-gray-400">
                      {order.orderDate
                        ? format(new Date(order.orderDate), "dd MMM yyyy")
                        : "No Date"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-between items-center">
                <div className="flex items-center justify-center">
                  <div
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : ["Paid", "Shipped", "Completed", "Returned"].includes(
                            order.status
                          )
                        ? "bg-green-100 text-green-600"
                        : order.status === "Canceled"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </div>
                </div>

                {order.status === "Paid" && (
                  <button
                    onClick={() => confirmCancelOrder(order)}
                    className="bg-red-500 text-white px-3 py-2 rounded-sm hover:bg-red-600 transition text-xs"
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === "Shipped" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAsReturned(order)}
                      className="bg-yellow-500 text-white px-3 py-2 rounded-sm hover:bg-yellow-600 transition text-xs"
                    >
                      Returned
                    </button>
                    <button
                      onClick={() => handleMarkAsCompleted(order)}
                      className="bg-green-500 text-white px-3 py-2 rounded-sm hover:bg-green-600 transition text-xs"
                    >
                      Completed
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleViewDetails(order)}
                  className="border px-3 py-2 text-xs font-medium rounded-sm hover:bg-gray-100 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
          onClick={handleClickOutside}
        >
          <div
            className={`bg-white ${
              isModalVisible ? "translate-y-0" : "translate-y-full"
            } md:rounded-md overflow-auto shadow-lg w-full max-w-screen-md h-full md:h-auto p-6 relative transform transition-transform duration-700 ease-in-out`}
          >
            <button
              onClick={closeDetailsWithAnimation}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shipping Information</h3>
              <div className="flex items-center">
                <FaUser className="text-gray-700 mr-3" />
                <p className="text-sm text-gray-500">
                  {selectedOrder.firstName} {selectedOrder.lastName}
                </p>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-700 mr-3" />
                <p className="text-sm text-gray-500">{selectedOrder.email}</p>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-700 mr-3" />
                <p className="text-sm text-gray-500">
                  {selectedOrder.street}, {selectedOrder.city},{" "}
                  {selectedOrder.state}, {selectedOrder.zipCode},{" "}
                  {selectedOrder.country}
                </p>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-gray-700 mr-3" />
                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium">Order Summary</h3>
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <img
                      className="w-16 h-16 object-cover rounded"
                      src={item.imageUrl || "/placeholder-image.png"}
                      alt={item.name}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedOrder.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : [
                              "Paid",
                              "Shipped",
                              "Completed",
                              "Returned",
                            ].includes(selectedOrder.status)
                          ? "bg-green-100 text-green-600"
                          : selectedOrder.status === "Canceled"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedOrder.status}
                    </div>
                  </div>
                  <p className="text-sm">
                    {currency}
                    {formatPrice(
                      selectedOrder.items.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      ) + delivery_fee
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="text-right">
                <h3 className="text-lg font-medium">Total Amount</h3>
                <p className="text-xl font-bold">
                  {currency}
                  {formatPrice(
                    selectedOrder.items.reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    ) + delivery_fee
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCancelModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4 text-gray-800">
              Are you sure you want to cancel this order?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setIsCancelModalVisible(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isReviewModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Leave a Review
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center mb-4 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={`text-2xl ${
                    reviewData.rating >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Image Upload and Preview */}
            <div className="flex flex-wrap gap-4 mb-4">
              {reviewData.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-32 h-32 md:w-40 md:h-40 lg:w-32 lg:h-32"
                >
                  <div className="w-full h-full border border-gray-300 bg-gray-100 flex items-center justify-center relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() =>
                          setReviewData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }))
                        }
                        className="w-8 h-8"
                      >
                        <img
                          src={assets.recycle_bin}
                          alt="Remove"
                          className="filter invert"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {reviewData.images.length < 5 && (
                <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-32 lg:h-32 border border-gray-300 bg-gray-100 flex items-center justify-center">
                  <label className="flex items-center justify-center w-full h-full cursor-pointer">
                    <span className="text-2xl text-gray-500">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          images: [...prev.images, ...e.target.files],
                        }))
                      }
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Review Textarea */}
            <textarea
              className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Write your review"
              value={reviewData.review}
              onChange={(e) =>
                setReviewData({ ...reviewData, review: e.target.value })
              }
            />

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsReviewModalVisible(false)}
                className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
