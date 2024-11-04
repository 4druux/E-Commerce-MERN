import React, { useContext, useState, useEffect, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { format } from "date-fns";
import { formatPrice } from "../utils/formatPrice";
import { assets } from "../assets/assets";

// Socket connection dihapus dan digantikan dengan polling berkala

const Orders = () => {
  const { orders, updateOrderStatus, fetchOrders, deleteOrder, delivery_fee } =
    useContext(ShopContext);
  const [filteredStatus, setFilteredStatus] = useState("All");
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [orderToDelete, setOrderToDelete] = useState(null); // Order selected for deletion
  const [isLoading, setIsLoading] = useState(true); // Loading untuk load awal
  const [isUpdating, setIsUpdating] = useState(false); // Loading untuk operasi status update

  const intervalRef = useRef(null); // Gunakan ref untuk polling interval

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchAndSetOrders = async (showLoading = true) => {
      if (token) {
        if (showLoading) setIsLoading(true); // Hanya tampilkan loading pada fetch manual
        await fetchOrders(token);
        setIsLoading(false);
      }
    };

    fetchAndSetOrders(); // Panggil saat pertama kali render

    // Polling untuk fetch data setiap 10 detik tanpa loading indicator
    intervalRef.current = setInterval(() => {
      fetchAndSetOrders(false); // Tidak tampilkan loading saat polling otomatis
    }, 10000);

    return () => clearInterval(intervalRef.current); // Bersihkan interval saat unmount
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdating(true); // Tampilkan loading hanya saat update status
    await updateOrderStatus(orderId, newStatus);
    const token = localStorage.getItem("authToken");
    await fetchOrders(token);
    setIsUpdating(false); // Akhiri loading setelah update selesai
  };

  // Open confirmation modal for deleting an order
  const openDeleteModal = (orderId) => {
    setOrderToDelete(orderId); // Set the order to be deleted
    setShowModal(true); // Show modal
  };

  // Close the modal without deleting
  const closeModal = () => {
    setShowModal(false);
    setOrderToDelete(null); // Reset the selected order
  };

  // Confirm and delete the order
  const confirmDelete = async () => {
    if (orderToDelete) {
      setIsUpdating(true); // Tampilkan loading saat menghapus
      await deleteOrder(orderToDelete);
      const token = localStorage.getItem("authToken");
      await fetchOrders(token);
      setIsUpdating(false); // Akhiri loading setelah selesai
      setShowModal(false);
    }
  };

  const filteredOrders =
    filteredStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filteredStatus);

  const getStatusClassName = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-600"; // Warna kuning untuk Pending
      case "Paid":
      case "Processing":
      case "Shipped":
      case "Completed":
      case "Returned":
        return "bg-green-100 text-green-600"; // Warna hijau untuk Paid hingga Returned
      case "Canceled":
        return "bg-red-100 text-red-600"; // Warna merah untuk Canceled
      default:
        return "bg-gray-100 text-gray-600"; // Warna default jika status tidak dikenal
    }
  };

  if (isLoading) {
    // Loading hanya muncul saat load awal
    return (
      <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
      </div>
    );
  }

  return (
    <div className="px-0 sm:px-4 lg:px-0">
      <div className="mb-6 text-2xl">
        <Title text1={"ORDER"} text2={"LIST"} />
      </div>

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
                ? "bg-black text-white shadow-lg transform scale-105 border-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6 my-5">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg p-4 lg:hover:shadow-2xl transition-transform duration-300 transform  items-start"
            >
              <div className="w-full flex-1">
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold mb-2">
                        Order #{order._id}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Customer:{" "}
                        <span className="font-medium text-gray-800">
                          {order.firstName} {order.lastName} ({order.username})
                        </span>
                      </p>
                      <p>
                        Date:{" "}
                        <span className="font-medium text-gray-800">
                          {format(new Date(order.orderDate), "dd MMM yyyy")}
                        </span>
                      </p>
                      <p>
                        Email:{" "}
                        <span className="font-medium text-gray-800">
                          {order.email}
                        </span>
                      </p>
                      <p>
                        Phone:{" "}
                        <span className="font-medium text-gray-800">
                          {order.phone}
                        </span>
                      </p>
                      <p>
                        Address:{" "}
                        <span className="font-medium text-gray-800">
                          {order.street}, {order.city}, {order.state},{" "}
                          {order.zipCode}, {order.country}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Dropdown for Admin to Update Order Status */}
                  <div className="mt-4 md:mt-0 md:text-right">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border p-2 mt-2 rounded text-sm w-full md:w-auto"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Returned">Returned</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => openDeleteModal(order._id)}
                    className="absolute top-0 right-0 mt-2 mr-2"
                    aria-label="Delete order"
                  >
                    <img
                      src={assets.recycle_bin}
                      alt="Delete"
                      className="w-4 h-4 sm:w-6 sm:h-6"
                    />
                  </button>
                </div>

                {/* Order Items */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 py-2"
                      >
                        <img
                          src={item.imageUrl || "/placeholder-image.png"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              Price:{" "}
                              <span className="font-medium text-gray-800">
                                {formatPrice(item.price)}
                              </span>
                            </p>
                            Fee:{" "}
                            <span className="font-medium text-gray-800">
                              {formatPrice(delivery_fee)}
                            </span>
                            <p>
                              Quantity:{" "}
                              <span className="font-medium text-gray-800">
                                {item.quantity}
                              </span>
                            </p>
                            <p>
                              Size:{" "}
                              <span className="font-medium text-gray-800">
                                {item.size}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center border-t pt-4 space-y-4 md:space-y-0">
                  <div className="text-sm text-gray-600">
                    Payment Method:{" "}
                    <span className="font-medium text-gray-800 capitalize">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full ${getStatusClassName(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total:{" "}
                    <span className="font-medium text-gray-800">
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
          ))
        ) : (
          <div className="flex-grow flex items-end justify-center py-36">
            <p className="text-center text-gray-500">No orders found.</p>
          </div>
        )}
      </div>

      {/* Modal for confirming deletion */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete this order?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isUpdating && (
        <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}
    </div>
  );
};

export default Orders;
