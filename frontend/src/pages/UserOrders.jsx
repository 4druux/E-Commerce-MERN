import React, { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { format } from "date-fns";
import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import SkeletonUserOrders from "../components/SkeletonUserOrders";
import SkeletonOrderFilters from "../components/SkeletonOrderFilters";
import SweetAlert from "../components/SweetAlert";
import { ClipboardList, Dot } from "lucide-react";
import ModalUserOrders from "../components/ModalViewDetailsOrder";
import ModalReview from "../components/ModalReview";
import ModalReturn from "../components/ModalReturn";

const UserOrders = () => {
  const {
    orders,
    currency,
    delivery_fee,
    fetchOrders,
    cancelOrder,
    submitReturn,
    submitReview,
    search,
    showSearch,
  } = useContext(ShopContext);

  const [isFetchingOrders, setIsFetchingOrders] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState("Pending");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const [returnData, setReturnData] = useState({
    reason: "",
    description: "",
    images: [],
  });

  // Fungsi untuk menangani upload gambar return
  const handleReturnImageUpload = (e) => {
    const files = Array.from(e.target.files);

    setReturnData((prev) => ({
      ...prev,
      images: [...prev.images, ...files.slice(0, 5 - prev.images.length)],
    }));
  };

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

  const [isOpen, setIsOpen] = useState(false);
  const toggleDetails = () => setIsOpen(!isOpen);

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
        true;
        await cancelOrder(order._id);
        setFilteredStatus("Canceled");
        setIsLoading(false);

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
    // Validasi input return
    if (!returnData.reason || !currentOrderForReturn) {
      setIsAlertActive(true);

      await SweetAlert({
        title: "Validation Required",
        message: "Please select a return reason and ensure the order is valid.",
        icon: "warning",
      });
      setIsAlertActive(false);
      return;
    }

    setIsLoading(true);
    try {
      const formData = {
        reason: returnData.reason,
        description: returnData.description || "",
        returnImages: [],
      };

      // Konversi gambar
      if (returnData.images?.length) {
        formData.returnImages = await Promise.all(
          returnData.images.map(convertToBase64)
        );
      }

      // Submit return
      await submitReturn(currentOrderForReturn, formData);

      // Reset state dan tutup modal
      setIsLoading(false);
      closeReturnModalWithAnimation();

      setIsAlertActive(true);
      // Notifikasi sukses
      await SweetAlert({
        title: "Return Successful",
        message:
          "Your order has been successfully returned. Our team will process it shortly.",
        icon: "success",
      });
      setIsAlertActive(false);
      // Update status dan refresh
      setFilteredStatus("Returned");
      fetchOrders();
    } catch (error) {
      setIsLoading(false);

      setIsAlertActive(true);
      await SweetAlert({
        title: "Return Failed",
        message:
          error.response?.data?.message ||
          "Unable to process your return. Please try again.",
        icon: "error",
      });
      setIsAlertActive(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    // Validasi rating
    if (!reviewData.rating || reviewData.rating === 0) {
      setIsAlertActive(true);
      await SweetAlert({
        title: "Rating Required",
        message: "Please rate the product by selecting stars.",
        icon: "warning",
      });
      setIsAlertActive(false);
      return;
    }

    setIsLoading(true);
    try {
      const formData = {
        rating: reviewData.rating,
        reviewText: reviewData.review || "",
        size: currentOrderForReview.items[0].size,
        reviewImages: [],
      };

      // Konversi gambar review
      if (reviewData.images?.length) {
        formData.reviewImages = await Promise.all(
          reviewData.images.map(convertToBase64)
        );
      }

      // Submit review
      await submitReview(formData, currentOrderForReview);

      // Reset state dan tutup modal
      setIsLoading(false);
      closeReviewModalWithAnimation();
      setIsReviewModalVisible(false);

      setIsAlertActive(true);
      // Notifikasi sukses
      await SweetAlert({
        title: "Review Submitted",
        message:
          "Thank you for sharing your feedback. Your review has been received.",
        icon: "success",
      });
      setIsAlertActive(false);
      // Update status dan refresh
      setFilteredStatus("Completed");
      fetchOrders();
    } catch (error) {
      setIsLoading(false);

      setIsAlertActive(true);
      await SweetAlert({
        title: "Review Submission Failed",
        message:
          error.response?.data?.message ||
          "We couldn't submit your review. Please try again.",
        icon: "error",
      });
      setIsAlertActive(true);
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

  useEffect(() => {
    // Simulate fetching orders
    setIsFetchingOrders(true);
    setFilteredOrders([]); // Reset filtered orders initially

    setIsFetchingOrders(false);
  }, [orders]);

  const filteredOrdersList = useMemo(() => {
    let result = orders.slice();

    // Filter by search term
    if (showSearch && search) {
      result = result.filter(
        (order) =>
          // Check if items[0]?.name exists and matches the search term
          order.items &&
          order.items.some((item) =>
            item.name?.toLowerCase().includes(search.toLowerCase())
          )
      );
    } else if (filteredStatus) {
      // Filter by status only if no search term is provided
      result = result.filter((order) => order.status === filteredStatus);
    }

    // Sort by order date, showing the most recent orders first
    result = result.sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
    );

    return result;
  }, [orders, search, filteredStatus, showSearch]);

  useEffect(() => {
    setFilteredOrders(filteredOrdersList);
  }, [filteredOrdersList]);

  if (isFetchingOrders) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl mb-3">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        <SkeletonOrderFilters />

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

      {!showSearch || !search ? (
        <>
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
                className={`px-3 py-1 rounded-full border text-xs hover:scale-105 transition-all duration-300 ${
                  filteredStatus === status
                    ? "bg-gray-800 text-white shadow-lg transform scale-105 "
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-600" />
          <p className="mt-4 text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-5 sm:px-5 sm:py-4 border hover:shadow-xl transition-all duration-300 cursor-pointer   
    sm:flex sm:flex-row sm:items-center sm:justify-between"
              onClick={() => handleViewDetails(order)}
            >
              <div className="flex items-start gap-4 text-sm flex-1 min-w-0">
                <img
                  className="w-24 flex-shrink-0 rounded-lg"
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
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    {currency}
                    {formatPrice(
                      order.items.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      ) + delivery_fee
                    )}
                  </p>
                  <div className="flex flex-wrap items-center mt-1 text-sm text-gray-600">
                    <p>x{order.items[0]?.quantity || "N/A"}</p>
                    <Dot />
                    <p>Size: {order.items[0]?.size || "N/A"}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Date
                    <span className="text-gray-400 ml-1">
                      {order.orderDate
                        ? format(new Date(order.orderDate), "dd MMM yyyy HH:mm")
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
                    className="bg-red-50 text-red-600 px-3 py-2 hover:bg-red-100 transition-all duration-300 border border-orange-200 text-xs font-medium"
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
                      className="bg-orange-50 text-orange-600 px-4 py-2  hover:bg-orange-100 transition-all duration-300 border border-orange-200 hover:border-orange-300 text-xs font-medium"
                    >
                      Return Item
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsCompleted(order);
                      }}
                      className="bg-green-50 text-green-600 px-4 py-2  hover:bg-green-100 transition-all duration-300 border border-green-200 hover:border-green-300 text-xs font-medium"
                    >
                      Completed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalUserOrders
        isViewModalOpen={isViewModalOpen}
        isModalVisible={isModalVisible}
        selectedOrder={selectedOrder}
        handleClickOutside={handleClickOutside}
        closeDetailsWithAnimation={closeDetailsWithAnimation}
        toggleDetails={toggleDetails}
        isOpen={isOpen}
        currency={currency}
        formatPrice={formatPrice}
        delivery_fee={delivery_fee}
        assets={assets}
      />

      <ModalReview
        isReviewModalOpen={isReviewModalOpen}
        isLoading={isLoading}
        isAlertActive={isAlertActive}
        isReviewModalVisible={isReviewModalVisible}
        reviewData={reviewData}
        setReviewData={setReviewData}
        closeReviewModalWithAnimation={closeReviewModalWithAnimation}
        handleReviewSubmit={handleReviewSubmit}
      />

      <ModalReturn
        isReturnModalOpen={isReturnModalOpen}
        isLoading={isLoading}
        isAlertActive={isAlertActive}
        isReturnModalVisible={isReturnModalVisible}
        returnData={returnData}
        setReturnData={setReturnData}
        closeReturnModalWithAnimation={closeReturnModalWithAnimation}
        handleReturnImageUpload={handleReturnImageUpload}
        confirmReturnOrder={confirmReturnOrder}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-[100] transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}

      {isAlertActive && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"></div>
      )}
    </div>
  );
};

export default UserOrders;
