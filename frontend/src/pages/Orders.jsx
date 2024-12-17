import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { format } from "date-fns";
import { formatPrice } from "../utils/formatPrice";
import { assets } from "../assets/assets";
import SkeletonOrders from "../components/SkeletonOrders";
import SkeletonOrderFilters from "../components/SkeletonOrderFilters";
import SweetAlert from "../components/SweetAlert";
import ReactPaginate from "react-paginate";

import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Dot,
  Search,
  Trash2,
  X,
  XCircleIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
} from "react-icons/fa";

const Orders = () => {
  const {
    orders,
    currency,
    updateOrderStatus,
    updateReturnStatus,
    fetchOrders,
    deleteOrder,
    delivery_fee,
  } = useContext(ShopContext);
  const intervalRef = useRef(null);
  const [filteredStatus, setFilteredStatus] = useState("All");
  const [search, setSearch] = useState("");
  const showSearch = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [openReturnItems, setOpenReturnItems] = useState({});

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;

  const toggleReturnItemDetails = (orderId, itemIndex) => {
    setOpenReturnItems((prev) => ({
      ...prev,
      [`${orderId}-${itemIndex}`]: !prev[`${orderId}-${itemIndex}`],
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchAndSetOrders = async (showLoading = true) => {
      if (token) {
        if (showLoading) setIsLoading(true);

        // setTimeout(async () => {
        await fetchOrders(token);
        setIsLoading(false);
        // }, 6000000);
      }
    };

    fetchAndSetOrders();

    intervalRef.current = setInterval(() => {
      fetchAndSetOrders(false);
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, [fetchOrders]);

  const openDeleteModal = (orderId) => {
    setIsOverlay(true);
    SweetAlert({
      title: "Delete Confirmation",
      message: "Are you sure you want to delete this order?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeOnClickOutside: true,
    }).then(async (willDelete) => {
      setIsOverlay(false);
      if (willDelete) {
        setIsUpdating(true);
        await deleteOrder(orderId);
        const token = localStorage.getItem("authToken");
        await fetchOrders(token);
        setIsUpdating(false);

        setIsOverlay(true);
        SweetAlert({
          title: "Order Deleted",
          message: "The order has been successfully deleted.",
          icon: "success",
          buttons: true,
          closeOnClickOutside: true,
        });
        setIsOverlay(false);
      }
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);

      await updateOrderStatus(orderId, newStatus);

      const token = localStorage.getItem("authToken");
      await fetchOrders(token);

      setFilteredStatus(newStatus);

      setIsOverlay(true);
      await SweetAlert({
        title: "Order Status Updated",
        message: `Order status has been updated to ${newStatus.toLowerCase()}.`,
        icon: "success",
      });
      setIsOverlay(false);
    } catch (error) {
      console.error("Failed to update order status:", error);

      await SweetAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to update order status.",
        icon: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturnStatusChange = async (orderId, item, newStatus) => {
    try {
      setIsUpdating(true);

      await updateReturnStatus(orderId, {
        productId: item.productId,
        size: item.size,
        status: newStatus,
      });

      const token = localStorage.getItem("authToken");
      await fetchOrders(token);

      setIsOverlay(true);
      await SweetAlert({
        title: "Return Status Updated",
        message: `Return request has been ${newStatus.toLowerCase()}.`,
        icon: "success",
      });
      setIsOverlay(false);
    } catch (error) {
      console.error("Failed to update return status:", error);

      await SweetAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to update return status.",
        icon: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (isImageOpen || isUpdating || isOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isImageOpen, isUpdating, isOverlay]);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageOpen(true);
  };

  const closeReviewModal = () => {
    setIsImageOpen(false);
  };

  const filteredOrders = useMemo(() => {
    let result = orders.slice();

    // Filter by search term if showSearch is active
    if (showSearch && search) {
      result = result.filter(
        (order) =>
          // Check if search matches any item name or username
          (order.items &&
            order.items.some((item) =>
              item.name?.toLowerCase().includes(search.toLowerCase())
            )) ||
          order.username?.toLowerCase().includes(search.toLowerCase())
      );
    } else if (filteredStatus !== "All") {
      result = result.filter((order) => order.status === filteredStatus);
    }

    result = result.sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
    );

    return result;
  }, [orders, search, filteredStatus, showSearch]);

  const displayedOrders = useMemo(() => {
    if (showSearch && search) {
      return filteredOrders;
    }

    return filteredOrders.slice(offset, offset + itemsPerPage);
  }, [filteredOrders, offset, itemsPerPage, search, showSearch]);

  // Menghitung jumlah halaman berdasarkan filteredOrders
  const pageCount = useMemo(() => {
    if (showSearch && search) {
      return 1;
    }
    return Math.ceil(filteredOrders.length / itemsPerPage);
  }, [filteredOrders, itemsPerPage, search, showSearch]);

  // Handle pagination
  const handlePageClick = (data) => {
    if (showSearch && search) {
      return;
    }

    const newPage = data.selected;
    setCurrentPage(newPage);

    setTimeout(() => {
      window.scrollTo({
        top: 50,
        behavior: "smooth",
      });
    }, 0);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const inputVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-600";
      case "Paid":
      case "Processing":
      case "Shipped":
      case "Completed":
      case "Returned":
        return "bg-green-100 text-green-600";
      case "Canceled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="px-0 sm:px-4 lg:px-0">
        <div className="mb-6 text-2xl">
          <Title text1={"ORDER"} text2={"LIST"} />
        </div>

        {/* Skeleton for Order Filters */}
        <SkeletonOrderFilters />

        {/* Skeleton for Order Items */}
        <div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonOrders key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 sm:px-4 lg:px-0">
      <div className="sm:mb-12 mb-4 flex flex-col sm:flex-row justify-between sm:gap-0 gap-3 text-2xl">
        <Title text1={"ORDER"} text2={"LIST"} />

        {/* Search Input */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="w-full sm:w-auto border border-gray-400 px-3 py-2 rounded-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex items-center w-full sm:w-[300px] h-5">
                <motion.div
                  className="flex items-center flex-grow h-full"
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full outline-none bg-inherit text-sm"
                    type="text"
                    placeholder="Search orders..."
                  />

                  {search && (
                    <button
                      onClick={handleClearSearch}
                      className="hover:bg-slate-100 rounded-full p-1 mr-1"
                    >
                      <X
                        className="w-5 cursor-pointer text-gray-700 hover:text-gray-900"
                        alt="Clear search"
                      />
                    </button>
                  )}
                </motion.div>

                <div className="border-l-2 pl-2">
                  <Search
                    className="w-5 text-gray-700 cursor-pointer"
                    alt="Search"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!search ? (
        <>
          {/* Filter for mobile (dropdown) */}
          <div className="block md:hidden mb-6">
            <select
              value={filteredStatus}
              onChange={(e) => setFilteredStatus(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {[
                "All",
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

          {/* Filter for desktop (buttons) */}
          <div className="hidden md:flex gap-2 my-6 justify-center whitespace-nowrap">
            {[
              "All",
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
                    ? "bg-gray-800 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {/* Orders List */}
      <div className="space-y-6 my-5">
        {displayedOrders.length > 0 ? (
          displayedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden max-w-7xl mx-auto my-6 transition-all duration-300 hover:shadow-xl"
            >
              {/* Header dengan Order ID dan Status */}
              <div
                className={`flex justify-between items-center p-5 rounded-lg ${
                  order.status === "Pending"
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-200"
                    : ["Paid", "Shipped", "Completed", "Returned"].includes(
                        order.status
                      )
                    ? "bg-gradient-to-r from-green-50 to-green-200"
                    : order.status === "Canceled"
                    ? "bg-gradient-to-r from-red-50 to-red-200"
                    : "bg-gradient-to-r from-gray-50 to-gray-200"
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <h2 className="text-sm md:text-xl font-bold text-gray-800">
                    Order
                  </h2>
                  <span className="text-xs md:text-lg text-gray-600">
                    #{order._id}
                  </span>
                  <div
                    className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusClassName(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 px-4 py-5">
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  className="border p-2 w-full md:w-auto rounded-full text-sm  bg-white text-gray-800"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Returned">Returned</option>
                  <option value="Canceled">Canceled</option>
                </select>

                <button
                  onClick={() => openDeleteModal(order._id)}
                  className="p-2 rounded-full group bg-red-50 border border-red-200 hover:bg-red-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out"
                  aria-label="Delete order"
                >
                  <Trash2 className="w-5 h-5 text-red-300 group-hover:text-red-500" />
                </button>
              </div>

              {/* Konten Utama dengan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-0 p-0 md:p-6 pb-4">
                {/* Kolom Kiri: Order Information */}
                <div className="px-5 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        icon: FaUser,
                        text: `${order.firstName} ${order.lastName} (${order.username})`,
                      },
                      { icon: FaEnvelope, text: order.email },
                      {
                        icon: FaMapMarkerAlt,
                        text: `${order.street}, ${order.city}, ${order.state}, ${order.zipCode}, ${order.country}`,
                      },
                      { icon: FaPhone, text: order.phone },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <item.icon className="text-gray-600 w-5 h-5" />
                        <p className="text-sm text-gray-700">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom Tengah: Order Items */}
                <div className="px-5 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <img
                          src={item.imageUrl || "/placeholder-image.png"}
                          alt={item.name}
                          className=" w-24 h-24 object-cover rounded-md"
                        />

                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm line-clamp-1">
                                {item.name}
                              </h4>
                              <p className="font-semibold text-sm mt-1 text-gray-600">
                                {currency}
                                {formatPrice(item.price)}
                              </p>
                              <p className="text-xs text-gray-600 flex items-center">
                                x{item.quantity} <Dot /> Size: {item.size}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {format(
                                  new Date(order.orderDate),
                                  "dd MMM yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom Kanan: Order Summary */}
                <div className="px-5 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    {/* Payment Method */}
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-xl px-2 py-4 flex items-center justify-between">
                      Payment Method
                      {order.paymentMethod.toLowerCase() === "qris" ? (
                        <img
                          className="h-6 "
                          src={assets.qris_icon}
                          alt="QRIS"
                        />
                      ) : order.paymentMethod.toLowerCase() === "bca" ? (
                        <img className="h-6 " src={assets.bca_icon} alt="BCA" />
                      ) : order.paymentMethod.toLowerCase() === "bni" ? (
                        <img className="h-4 " src={assets.bni_icon} alt="BNI" />
                      ) : order.paymentMethod.toLowerCase() === "bri" ? (
                        <img className="h-6 " src={assets.bri_icon} alt="BRI" />
                      ) : order.paymentMethod.toLowerCase() === "mandiri" ? (
                        <img
                          className="h-6 "
                          src={assets.mandiri_icon}
                          alt="Mandiri"
                        />
                      ) : order.paymentMethod.toLowerCase() === "indomart" ? (
                        <img
                          className="h-6 "
                          src={assets.indomart_icon}
                          alt="Indomart"
                        />
                      ) : order.paymentMethod.toLowerCase() === "alfamart" ? (
                        <img
                          className="h-6 "
                          src={assets.alfamart_icon}
                          alt="Alfamart"
                        />
                      ) : (
                        <span className="font-medium text-gray-800 capitalize ">
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <div className="flex flex-col text-sm text-gray-600">
                        {order.items.length > 1 ? (
                          order.items.map((item, index) => (
                            <span key={index}>
                              {`${currency}${formatPrice(
                                item.price * item.quantity
                              )} x${item.quantity}`}
                            </span>
                          ))
                        ) : (
                          <span>
                            {`${currency}${formatPrice(
                              order.items[0].price * order.items[0].quantity
                            )} x${order.items[0].quantity}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Delivery Fee
                      </span>
                      <span className="text-sm text-gray-600">
                        {currency}
                        {formatPrice(delivery_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="font-semibold text-gray-800">
                        {currency}
                        {formatPrice(
                          order.items.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          ) + delivery_fee
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Details Section */}
              {order.items.filter(
                (item) =>
                  item.return &&
                  (item.return.reason ||
                    item.return.description ||
                    (item.return.returnImages &&
                      item.return.returnImages.length > 0))
              ).length > 0 && (
                <div>
                  {order.items
                    .filter(
                      (item) =>
                        item.return &&
                        (item.return.reason ||
                          item.return.description ||
                          (item.return.returnImages &&
                            item.return.returnImages.length > 0))
                    )
                    .map((item, idx) => (
                      <div
                        key={`return-${order._id}-${idx}`}
                        className={`p-4 border-t rounded-lg transition-all duration-300 ease-in-out  ${
                          openReturnItems[`${order._id}-${idx}`]
                            ? "bg-white"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-semibold flex items-center ${
                              openReturnItems[`${order._id}-${idx}`]
                                ? "text-gray-800"
                                : "text-gray-800"
                            } ${
                              item.return.status === "Pending"
                                ? "animate-pulse"
                                : ""
                            }`}
                          >
                            {item.return.status === "Approved" ? (
                              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                            ) : item.return.status === "Rejected" ? (
                              <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
                            ) : (
                              <AlertCircleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                            )}
                            Return Request Details
                          </h4>

                          <ChevronDown
                            className={`h-5 w-5 text-gray-600 transition-transform duration-300 transform  cursor-pointer ${
                              openReturnItems[`${order._id}-${idx}`]
                                ? "rotate-180"
                                : "rotate-0"
                            } ${
                              item.return.status === "Pending"
                                ? "animate-pulse"
                                : ""
                            }`}
                            onClick={() =>
                              toggleReturnItemDetails(order._id, idx)
                            }
                          />
                        </div>

                        <AnimatePresence mode="wait">
                          {openReturnItems[`${order._id}-${idx}`] && (
                            <motion.div
                              key={`return-details-${order._id}-${idx}`}
                              initial={{
                                opacity: 0,
                                height: 0,
                                scale: 0.97,
                                translateY: -10,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                scale: 1,
                                translateY: 0,
                                transition: {
                                  duration: 0.35,
                                  type: "tween",
                                  ease: [0.25, 0.1, 0.25, 1],
                                },
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                                scale: 0.97,
                                translateY: -10,
                                transition: {
                                  duration: 0.5,
                                  type: "tween",
                                  ease: [0.25, 0.1, 0.25, 1],
                                },
                              }}
                              className="overflow-hidden origin-top"
                            >
                              <div className="flex flex-col px-6 space-y-5 mt-8">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-600 font-medium">
                                      Return Reason:
                                    </p>
                                    <p className="text-gray-800">
                                      {item.return.reason}
                                    </p>
                                  </div>

                                  <select
                                    value={item.return.status}
                                    onChange={(e) =>
                                      handleReturnStatusChange(
                                        order._id,
                                        item,
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-1 rounded-full text-sm font-medium border w-full md:w-auto  bg-white text-gray-800 "
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                  </select>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-600 font-medium">
                                    Return Images:
                                  </p>
                                  {item.return.returnImages &&
                                    item.return.returnImages.length > 0 && (
                                      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        <div className="flex gap-2 mt-2 pb-2 min-w-full">
                                          {item.return.returnImages.map(
                                            (imageUrl, imgIndex) => (
                                              <img
                                                key={imgIndex}
                                                src={imageUrl}
                                                alt={`Return Evidence ${
                                                  imgIndex + 1
                                                }`}
                                                className="flex-shrink-0 w-24 h-24 object-cover rounded-md cursor-pointer transition-all 
                                            duration-500 brightness-90 shadow-md hover:scale-110 hover:shadow-xl hover:brightness-100 active:scale-95"
                                                onClick={() =>
                                                  openImageModal(imageUrl)
                                                }
                                              />
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {item.return.description && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                                      Description:
                                    </h5>
                                    <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 italic border-l-4 border-blue-500">
                                      {item.return.description}
                                    </div>
                                  </div>
                                )}

                                <div className="text-right text-xs text-gray-500">
                                  Requested on:{" "}
                                  {item.return.createdAt
                                    ? format(
                                        new Date(item.return.createdAt),
                                        "dd MMM yyyy HH:mm"
                                      )
                                    : "Date not available"}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-28">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-600" />
            <p className="mt-4 text-gray-500">No orders found.</p>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isImageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] backdrop-blur-sm p-4"
            onClick={closeReviewModal}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 100, // Mulai dari bawah
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0, // Naik ke posisi normal
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 100, // Turun ke bawah saat keluar
                scale: 0.9,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                mass: 2, // Massa lebih ringan
              }}
              className="relative bg-white/25 rounded-2xl p-0 sm:p-3 backdrop-blur-xl shadow-2xl border border-white/20 
              flex flex-col items-center justify-center max-w-[90%] max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full Review View"
                className="w-auto h-auto max-h-[80vh] max-w-[80vw] rounded-xl object-contain shadow-2xl 
                transform transition-all duration-500 ease-in-out hover:scale-105"
              />

              <button
                className="absolute top-3 right-3 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full p-2 
                text-white transition-all duration-300 hover:rotate-180 hover:scale-110"
                onClick={closeReviewModal}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isUpdating && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-[100] transition-opacity duration-300 ease-in-out ${
            isOverlay ? "bg-transparent" : " bg-black/30"
          }`}
        >
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}

      {isOverlay && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"></div>
      )}

      {/* Pagination */}
      {!search && filteredOrders.length > 0 && (
        <div className="flex justify-center my-8">
          <ReactPaginate
            previousLabel={
              <div className="flex items-center space-x-2">
                <ChevronsLeft className="w-6 h-6 text-gray-700" />
              </div>
            }
            nextLabel={
              <div className="flex items-center space-x-2">
                <ChevronsRight className="w-6 h-6 text-gray-700" />
              </div>
            }
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={1}
            onPageChange={handlePageClick}
            containerClassName="flex items-center space-x-1 md:space-x-4 border p-2 rounded-full shadow-md"
            pageClassName="relative w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-medium transition-all duration-300 hover:-translate-y-1"
            previousClassName={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300"
            }`}
            nextClassName={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentPage === pageCount - 1
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300"
            }`}
            breakClassName="px-3 py-2 text-gray-500 select-none"
            activeClassName="bg-gray-800 text-white shadow-md scale-105"
            pageLinkClassName="absolute inset-0 flex items-center justify-center"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
};

export default Orders;
