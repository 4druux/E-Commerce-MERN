import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { format } from "date-fns";
import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import SkeletonUserOrders from "../components/SkeletonUserOrders";
import SkeletonOrderFilters from "../components/SkeletonOrderFilters";
import SweetAlert from "../components/SweetAlert";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
} from "react-icons/fa";

const UserOrders = () => {
  const {
    orders,
    currency,
    delivery_fee,
    fetchOrders,
    cancelOrder,
    updateOrderStatus,
    submitReview,
  } = useContext(ShopContext);

  const [isFetchingOrders, setIsFetchingOrders] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState("Pending");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [returnReason, setReturnReason] = useState("");
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [currentOrderForReturn, setCurrentOrderForReturn] = useState(null);

  const [isAlertActive, setIsAlertActive] = useState(false);

  const [currentOrderForReview, setCurrentOrderForReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    review: "",
    images: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      setIsFetchingOrders(true);
      fetchOrders(token).finally(() => setIsFetchingOrders(false));
    }

    // setTimeout(() => {
    //   fetchOrders(token).finally(() => setIsFetchingOrders(false));
    // }, 60000);

    // Set up polling to fetch orders every 10 seconds
    const intervalId = setInterval(() => {
      if (token) {
        fetchOrders(token);
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const isModalActive =
      isViewModalOpen ||
      isReviewModalOpen ||
      isReturnModalOpen ||
      isAlertActive ||
      selectedOrder ||
      isLoading;

    if (isModalActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    isViewModalOpen,
    isReviewModalOpen,
    isReturnModalOpen,
    isAlertActive,
    selectedOrder,
    isLoading,
  ]);

  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay" && !isLoading) {
      closeDetailsWithAnimation();
      closeReviewModalWithAnimation();
      closeReturnModalWithAnimation();
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
    setTimeout(() => setIsModalVisible(true), 50);
  };

  const closeDetailsWithAnimation = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsViewModalOpen(false);
      setSelectedOrder(null);
    }, 700);
  };

  const handleMarkAsCompleted = (order) => {
    setCurrentOrderForReview(order);
    setIsReviewModalOpen(true);
    setTimeout(() => setIsReviewModalVisible(true), 50);
  };

  const closeReviewModalWithAnimation = () => {
    setIsReviewModalVisible(false);
    setTimeout(() => {
      setIsReviewModalOpen(false);
      setCurrentOrderForReview(null);
    }, 700);
  };

  const handleCancelOrder = (order) => {
    setIsAlertActive(true);

    document.body.style.overflow = "hidden";

    SweetAlert({
      title: "Order Cancellation Confirmation",
      message: "Are you sure you want to cancel this order? ",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeOnClickOutside: false,
    }).then(async (willCancel) => {
      if (willCancel) {
        setIsLoading(true);
        await cancelOrder(order._id);
        setIsLoading(false);
        setFilteredStatus("Canceled");

        // Modal sukses setelah pembatalan
        SweetAlert({
          title: "Order Canceled",
          message: "Your order has been successfully canceled.",
          icon: "success",
          buttons: true,
          closeOnClickOutside: false,
        }).then(() => {
          setIsAlertActive(false);
          document.body.style.overflow = "auto";
        });
      } else {
        setIsAlertActive(false);
        document.body.style.overflow = "auto";
      }
    });
  };

  const closeReturnModalWithAnimation = () => {
    setIsReturnModalVisible(false);
    setTimeout(() => {
      setIsReturnModalOpen(false);
      setCurrentOrderForReturn(null);
    }, 700);
  };

  const handleReturnOrder = (order) => {
    setCurrentOrderForReturn(order);
    setIsReturnModalOpen(true);
    setTimeout(() => setIsReturnModalVisible(true), 50);
  };

  const confirmReturnOrder = async () => {
    if (returnReason && currentOrderForReturn) {
      setIsLoading(true);
      try {
        await updateOrderStatus(currentOrderForReturn._id, "Returned");

        setIsLoading(false);
        closeReturnModalWithAnimation();
        setIsAlertActive(true);

        await SweetAlert({
          title: "Order Successfully Returned",
          message: "Your order has been successfully returned.",
          icon: "success",
        });
        setIsAlertActive(false);
      } catch (error) {
        console.error("Failed to return order:", error.response?.data || error);
        setIsAlertActive(true);
        await SweetAlert({
          title: "Warning",
          message: "Failed to return the order.",
          icon: "error",
        });

        setIsAlertActive(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      await SweetAlert({
        title: "Warning",
        message: "Please select a reason for returning this item.",
        icon: "error",
      });
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewData.rating || reviewData.rating === 0) {
      setIsAlertActive(true);
      await SweetAlert({
        title: "Warning",
        message: "Please rate this product by selecting a star.",
        icon: "warning",
      });
      setIsAlertActive(false);
      return;
    }

    setIsLoading(true);

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
      await submitReview(formData, currentOrderForReview);

      closeReviewModalWithAnimation();
      setIsReviewModalVisible(false);
      setIsLoading(false);

      setIsAlertActive(true);
      await SweetAlert({
        title: "Review Submitted Successfully",
        message: "Thank you for submitting a review for your order.",
        icon: "success",
      });

      setIsAlertActive(false);
      fetchOrders();
    } catch (error) {
      console.error("Review submission failed:", error);
      setIsLoading(false);
      setIsAlertActive(true);

      await SweetAlert({
        title: "Warning",
        message: "Failed to submit the review. Please try again.",
        icon: "error",
      });

      setIsAlertActive(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // const handleReviewSubmit = async (event) => {
  //   event.preventDefault();
  //   setIsLoading(true);
  //   const token = localStorage.getItem("authToken");

  //   const formData = {
  //     rating: reviewData.rating,
  //     reviewText: reviewData.review,
  //     size: currentOrderForReview.items[0].size,
  //   };

  //   if (reviewData.images && reviewData.images.length > 0) {
  //     const imagePromises = reviewData.images.map((image) =>
  //       convertToBase64(image)
  //     );
  //     const base64Images = await Promise.all(imagePromises);
  //     formData.reviewImages = base64Images;
  //   } else {
  //     formData.reviewImages = [];
  //   }

  //   try {
  //     await axios.post(
  //       `http://localhost:5173/api/products/${currentOrderForReview.items[0].productId}/review`,
  //       formData,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     await updateOrderStatus(currentOrderForReview._id, "Completed");
  //     closeReviewModalWithAnimation();
  //     setIsReviewModalVisible(false);
  //     fetchOrders();
  //   } catch (error) {
  //     console.error("Failed to submit review:", error.response?.data || error);
  //     toast.error("Failed to submit review.");
  //   } finally {
  //     setIsLoading(false); // Hentikan loading
  //   }
  // };

  const filteredOrders = orders
    .filter((order) => order.status === filteredStatus)
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  if (isFetchingOrders) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl mb-3">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        {/* Skeleton for Order Filters */}
        <SkeletonOrderFilters />

        {/* Skeleton for Order Items */}
        <div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonUserOrders key={index} />
          ))}
        </div>
      </div>
    );
  }

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
        <div className="space-y-5">
          {filteredOrders.map((order, index) => (
            <div
              key={index}
              className={`${
                window.innerWidth < 768
                  ? "bg-white shadow-md rounded-lg p-5 border hover:shadow-lg transition cursor-pointer"
                  : "py-4 my-5 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              }`}
              onClick={
                window.innerWidth < 768 ? () => handleViewDetails(order) : null
              }
            >
              <div className="flex items-start gap-4 text-sm flex-1 min-w-0">
                <img
                  className="w-16 sm:w-20 flex-shrink-0 rounded"
                  src={order.items[0]?.imageUrl || "/placeholder-image.png"}
                  alt={order.items[0]?.name || "No Product Image"}
                />
                <div className="min-w-0">
                  <p
                    className="font-medium text-base sm:text-base truncate"
                    title={order.items[0]?.name || "No Product Name"}
                  >
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

              <div className="mt-6 md:mt-0 md:w-1/2 flex justify-between items-center">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelOrder(order);
                    }}
                    className="bg-red-500 text-white px-3 py-2 rounded-sm hover:bg-red-600 transition text-xs"
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === "Shipped" && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReturnOrder(order);
                      }}
                      className="bg-yellow-500 text-white px-3 py-2 rounded-sm hover:bg-yellow-600 transition text-xs"
                    >
                      Returned
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsCompleted(order);
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded-sm hover:bg-green-600 transition text-xs"
                    >
                      Completed
                    </button>
                  </div>
                )}

                {window.innerWidth >= 768 && (
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="border px-3 py-2 text-xs font-medium rounded-sm hover:bg-gray-100 transition"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isViewModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
          onClick={handleClickOutside}
        >
          <div
            className={`bg-white ${
              isModalVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            } md:rounded-md overflow-auto shadow-lg w-full max-w-screen-md h-full md:h-auto p-6 relative transform transition-all duration-700 ease-in-out`}
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Shipping Information</h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedOrder.status === "Pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : ["Paid", "Shipped", "Completed", "Returned"].includes(
                          selectedOrder.status
                        )
                      ? "bg-green-100 text-green-600"
                      : selectedOrder.status === "Canceled"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedOrder.status}
                </div>
              </div>

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

              <div className="mt-6 bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium">Payment Method</h3>
                <div className="flex items-center">
                  {selectedOrder.paymentMethod.toLowerCase() === "qris" ? (
                    <img
                      className="h-6 mx-2"
                      src={assets.qris_icon}
                      alt="QRIS"
                    />
                  ) : selectedOrder.paymentMethod.toLowerCase() === "bca" ? (
                    <img className="h-6 mx-2" src={assets.bca_icon} alt="BCA" />
                  ) : selectedOrder.paymentMethod.toLowerCase() === "bni" ? (
                    <img className="h-6 mx-2" src={assets.bni_icon} alt="BNI" />
                  ) : selectedOrder.paymentMethod.toLowerCase() === "bri" ? (
                    <img className="h-6 mx-2" src={assets.bri_icon} alt="BRI" />
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

            <div className="mt-6">
              <h3 className="text-lg font-medium">Order Summary</h3>
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-200"
                >
                  <div className="flex items-start gap-4 text-sm flex-1 min-w-0">
                    <img
                      className="w-16 sm:w-20 flex-shrink-0 object-cover rounded"
                      src={
                        selectedOrder.items[0]?.imageUrl ||
                        "/placeholder-image.png"
                      }
                      alt={selectedOrder.items[0]?.name || "No Product Image"}
                    />
                    <div className="min-w-0">
                      <p
                        className="font-medium text-base sm:text-base truncate"
                        title={
                          selectedOrder.items[0]?.name || "No Product Name"
                        }
                      >
                        {selectedOrder.items[0]?.name || "No Product Name"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                        <p className="text-sm">
                          {currency}
                          {formatPrice(
                            selectedOrder.items.reduce(
                              (total, item) =>
                                total + item.price * item.quantity,
                              0
                            ) + delivery_fee
                          )}
                        </p>
                        <p>x{selectedOrder.items[0]?.quantity || "N/A"}</p>
                        <p>Size: {selectedOrder.items[0]?.size || "N/A"}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Date:{" "}
                        <span className="text-gray-400">
                          {selectedOrder.orderDate
                            ? format(
                                new Date(selectedOrder.orderDate),
                                "dd MMM yyyy"
                              )
                            : "No Date"}
                        </span>
                      </p>
                    </div>
                  </div>
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

      {isReviewModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
          onClick={(e) => {
            if (e.target.id === "modal-overlay") {
              closeReviewModalWithAnimation();
            }
          }}
        >
          <div
            className={`bg-white ${
              isReviewModalVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            } p-8 rounded-lg shadow-xl max-w-lg w-full relative transform transition-all duration-700 ease-in-out`}
          >
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
                onClick={closeReviewModalWithAnimation}
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

      {isReturnModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
          onClick={(e) => {
            if (e.target.id === "modal-overlay") {
              closeReturnModalWithAnimation();
            }
          }}
        >
          <div
            className={`bg-white ${
              isReturnModalVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            } p-8 rounded-lg shadow-xl max-w-lg w-full relative transform transition-all duration-700 ease-in-out`}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Konfirmasi Pengembalian
            </h3>

            {/* Pilihan Alasan Pengembalian */}
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-2 mt-2 border rounded"
            >
              <option value="">Pilih Alasan Pengembalian</option>
              <option value="Produk rusak">Produk rusak</option>
              <option value="Produk tidak sesuai deskripsi">
                Produk tidak sesuai deskripsi
              </option>
              <option value="Tidak puas dengan produk">
                Tidak puas dengan produk
              </option>
              <option value="Salah pesan">Salah pesan</option>
            </select>

            {/* Tombol Konfirmasi */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeReturnModalWithAnimation}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={confirmReturnOrder}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Konfirmasi Pengembalian
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
