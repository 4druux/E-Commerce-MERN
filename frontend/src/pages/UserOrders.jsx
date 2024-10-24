import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { format } from "date-fns";
import { formatPrice } from "../utils/formatPrice";
import io from "socket.io-client";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
} from "react-icons/fa"; // Icon untuk detail dan tombol close

// Socket connection
const socket = io("https://ecommerce-backend-ebon-six.vercel.app/");

const UserOrders = () => {
  const {
    orders,
    setOrders,
    currency,
    delivery_fee, // Pastikan delivery_fee diambil dari ShopContext
    fetchOrders,
    cancelOrder,
    updateOrderStatus,
  } = useContext(ShopContext);
  const [filteredStatus, setFilteredStatus] = useState("Pending"); // Set default status
  const [selectedOrder, setSelectedOrder] = useState(null); // State untuk detail pesanan
  const [isModalVisible, setIsModalVisible] = useState(false); // Untuk kontrol transisi modal
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false); // Modal untuk konfirmasi pembatalan
  const [orderToCancel, setOrderToCancel] = useState(null); // Pesanan yang akan dibatalkan

  // State untuk modal review
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
      fetchOrders(token);
    }

    // Mendengarkan event orderUpdated
    socket.on("orderUpdated", () => {
      if (token) {
        fetchOrders(token); // Fetch ulang pesanan jika ada perubahan status
      }
    });

    // Mendengarkan event orderDeleted
    socket.on("orderDeleted", ({ orderId }) => {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, [fetchOrders, setOrders]);

  // Tambahkan atau hapus overflow-hidden di body saat modal dibuka atau ditutup
  useEffect(() => {
    if (selectedOrder) {
      document.body.classList.add("overflow-hidden");
      setIsModalVisible(true); // Set modal terlihat
    } else {
      document.body.classList.remove("overflow-hidden");
      setIsModalVisible(false); // Set modal tidak terlihat
    }

    // Cleanup ketika komponen di-unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedOrder]);

  const filteredOrders = orders.filter(
    (order) => order.status === filteredStatus
  );

  // Fungsi untuk membuka detail order
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  // Fungsi untuk menutup detail order dengan klik di luar modal
  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay") {
      closeDetails();
    }
  };

  const closeDetailsWithAnimation = () => {
    setIsModalVisible(false); // Mulai transisi animasi ke bawah
    setTimeout(() => {
      setSelectedOrder(null); // Setelah animasi selesai, baru benar-benar tutup modal
    }, 700); // Durasi diperpanjang untuk transisi smooth
  };

  // Fungsi untuk menampilkan modal konfirmasi cancel order
  const confirmCancelOrder = (order) => {
    setOrderToCancel(order); // Set pesanan yang akan dibatalkan
    setIsCancelModalVisible(true); // Tampilkan modal
  };

  // Fungsi untuk membatalkan pesanan
  const handleCancelOrder = () => {
    if (orderToCancel) {
      cancelOrder(orderToCancel._id); // Pastikan menggunakan _id yang benar
      setIsCancelModalVisible(false); // Tutup modal konfirmasi
      setFilteredStatus("Canceled"); // Pindahkan pesanan ke filter Canceled

      // Emit event untuk memberitahu admin bahwa pesanan diperbarui
      socket.emit("orderUpdated", {
        orderId: orderToCancel._id,
        status: "Canceled",
      });
    }
  };

  // Fungsi untuk menangani mark sebagai completed
  const handleMarkAsCompleted = (order) => {
    setCurrentOrderForReview(order);
    setIsReviewModalVisible(true); // Tampilkan modal review
  };

  // Fungsi untuk menangani mark sebagai returned
  const handleMarkAsReturned = async (order) => {
    // Ubah status pesanan menjadi Returned
    await updateOrderStatus(order._id, "Returned");

    // Emit event untuk memberitahu admin bahwa pesanan diperbarui
    socket.emit("orderUpdated", { orderId: order._id, status: "Returned" });
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

    // Pastikan size diambil dari produk yang dibeli
    const formData = {
      rating: reviewData.rating,
      reviewText: reviewData.review,
      size: currentOrderForReview.items[0].size, // Ambil size dari produk yang dibeli
    };

    // Jika ada gambar, konversi ke base64
    if (reviewData.images && reviewData.images.length > 0) {
      const imagePromises = reviewData.images.map((image) =>
        convertToBase64(image)
      );
      const base64Images = await Promise.all(imagePromises);
      formData.reviewImages = base64Images;
    } else {
      formData.reviewImages = []; // Jika tidak ada gambar, kirim array kosong
    }

    try {
      await axios.post(
        `https://ecommerce-backend-ebon-six.vercel.app/api/products/${currentOrderForReview.items[0].productId}/review`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await updateOrderStatus(currentOrderForReview._id, "Completed");
      toast.success(
        "Review submitted and order marked as completed successfully!"
      );
      setIsReviewModalVisible(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Filter for mobile (dropdown) */}
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
            "Canceled", // Menambahkan filter untuk Canceled orders
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
          "Pending",
          "Paid",
          "Processing",
          "Shipped",
          "Completed",
          "Returned",
          "Canceled", // Menambahkan filter untuk Canceled orders
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

      {/* Daftar Pesanan */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No orders found.</p>
      ) : (
        <div>
          {filteredOrders.map((order, index) => (
            <div
              key={index}
              className="py-4 my-5 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Left side: Image and Details */}
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
                        ) + delivery_fee // Tambahkan delivery_fee
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

              {/* Right side: Status and View Details */}
              <div className="md:w-1/2 flex justify-between items-center">
                {/* Order Status berada di tengah */}
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
                        ? "bg-red-100 text-red-600" // Menambahkan warna merah untuk status Canceled
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </div>
                </div>

                {/* Tombol Cancel Order jika status Paid */}
                {order.status === "Paid" && (
                  <button
                    onClick={() => confirmCancelOrder(order)}
                    className="bg-red-500 text-white px-3 py-2 rounded-sm hover:bg-red-600 transition text-xs"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Tombol Returned dan Completed jika status Shipped */}
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

                {/* Tombol View Details */}
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

      {/* Detail Pesanan */}
      {selectedOrder && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
          onClick={handleClickOutside}
        >
          {/* Modal Full Screen dengan transisi dari bawah ke atas */}
          <div
            className={`bg-white ${
              isModalVisible ? "translate-y-0" : "translate-y-full"
            } md:rounded-md overflow-auto shadow-lg w-full max-w-screen-md h-full md:h-auto p-6 relative transform transition-transform duration-700 ease-in-out`}
          >
            {/* Tombol Close di pojok kanan */}
            <button
              onClick={closeDetailsWithAnimation}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            {/* Order Details Title */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
            </div>

            {/* Shipping Information */}
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

            {/* Order Summary */}
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
                  {/* Order Status berada di tengah */}
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
                          ? "bg-red-100 text-red-600" // Status merah untuk Canceled
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

            {/* Total Amount di pojok kanan */}
            <div className="mt-6 flex justify-end">
              <div className="text-right">
                <h3 className="text-lg font-medium">Total Amount</h3>
                <p className="text-xl font-bold">
                  {currency}
                  {formatPrice(
                    selectedOrder.items.reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    ) + delivery_fee // Sudah memasukkan delivery_fee
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Cancel Order */}
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

      {/* Modal Review */}
      {isReviewModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Leave a Review</h3>

            {/* Rating Stars */}
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={`text-xl ${
                    reviewData.rating >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Review Text */}
            <textarea
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Write your review"
              value={reviewData.review}
              onChange={(e) =>
                setReviewData({ ...reviewData, review: e.target.value })
              }
            />

            {/* Optional: Upload Image */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setReviewData({
                  ...reviewData,
                  images: [...e.target.files],
                })
              }
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={handleReviewSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Submit Review
              </button>

              <button
                onClick={() => setIsReviewModalVisible(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
