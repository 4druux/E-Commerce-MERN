import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { unformatPrice } from "../utils/formatPrice";

// import io from "socket.io-client";

export const ShopContext = createContext();

// const socket = io("http://localhost:5001");

const ShopContextProvider = (props) => {
  const currency = "Rp";
  const delivery_fee = 2500;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalLogin, setIsModalLogin] = useState(false);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchCartData = useCallback(
    async (token) => {
      try {
        const response = await axios.get("http://localhost:5001/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data.items);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setIsLoggedIn(false);
          localStorage.removeItem("authToken");
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error("Failed to load cart data.");
        }
      }
    },
    [navigate]
  );

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole"); // Get user role from localStorage

    if (!token) {
      toast.error("No token found. Please log in again.");
      navigate(userRole === "admin" ? "/admin/login" : "/login");
      return;
    }

    try {
      const responseUser = await axios.get(
        "http://localhost:5001/api/user/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const role = responseUser.data.role;

      const endpoint =
        role === "admin"
          ? "http://localhost:5001/api/orders"
          : "http://localhost:5001/api/orders/user-orders";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.orders);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem("authToken");
        toast.error("Session expired. Please log in again.");
        navigate(userRole === "admin" ? "/admin/login" : "/login");
      } else {
        toast.error("Failed to load orders.");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const tokenExpiration = localStorage.getItem("tokenExpiration");

    const checkSessionExpiration = () => {
      const currentTime = new Date().getTime();
      if (tokenExpiration && currentTime > tokenExpiration) {
        setIsLoggedIn(false);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("tokenExpiration");

        toast.error("Session expired. Please log in again.");
        navigate(userRole === "admin" ? "/admin/login" : "/login");
      }
    };

    if (token) {
      setIsLoggedIn(true);
      fetchCartData(token);
      fetchOrders();
      fetchProducts();

      // Pengecekan token setiap 60 detik
      const intervalId = setInterval(checkSessionExpiration, 60000);
      return () => clearInterval(intervalId);
    } else {
      setIsLoggedIn(false);
      setCartItems([]);
    }

    fetchProducts();
  }, [fetchCartData, fetchOrders, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/products/all"
      );

      if (response.status === 200) {
        setProducts(response.data);
      } else {
        console.error("Unexpected response status:", response.status);
        toast.error("Failed to load products. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
    }
  };

  // CheckOut.jsx || EditItem.jsx || Product.jsx || ProductItem.jsx
  const fetchProductsById = async (productId) => {
    const existingProduct = products.find(
      (product) => product._id === productId
    );

    if (!existingProduct) {
      return null;
    }

    try {
      const response = await axios.get(
        `http://localhost:5001/api/products/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch product details", error);
      return null;
    }
  };

  // Product.jsx
  const addToCart = async (itemId, size, price, name, quantity = 1) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const cartResponse = await axios.get("http://localhost:5001/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = cartResponse.data.items;

      const existingItem = cartItems.find(
        (item) => item.productId === itemId && item.size === size
      );

      if (existingItem) {
        const updatedQuantity = existingItem.quantity + quantity;

        const updateResponse = await axios.put(
          "http://localhost:5001/api/cart/update",
          {
            productId: itemId,
            size,
            quantity: updatedQuantity,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCartItems(updateResponse.data.items);
      } else {
        const productResponse = await axios.get(
          `http://localhost:5001/api/products/${itemId}`
        );
        const product = productResponse.data;

        const imageUrl =
          product.image && product.image.length > 0
            ? product.image[0]
            : "/placeholder-image.png";

        const dataToSend = {
          productId: itemId,
          size,
          price,
          quantity,
          name,
          imageUrl,
        };

        // Tambahkan ke keranjang
        const response = await axios.post(
          "http://localhost:5001/api/cart/add",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  // Cart.jsx
  const updateQuantity = async (itemId, size, quantity) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5001/api/cart/update",
        { productId: itemId, size, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items);
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      toast.error("Failed to update cart quantity.");
    }
  };

  // Cart.jsx
  const removeFromCart = async (itemId, size) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5001/api/cart/remove",
        { productId: itemId, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error("Failed to remove item from cart.");
    }
  };

  // Payment.jsx
  const handlePayment = async (paymentData, onSuccess, onError) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5001/api/cart/checkout",
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        for (const item of paymentData.selectedItems) {
          await axios.post(
            "http://localhost:5001/api/cart/remove",
            {
              productId: item._id,
              size: item.size,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error("Payment failed with status:", response.status);
        if (onError) {
          onError();
        }
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      if (onError) {
        onError();
      }
    }
  };

  // UserOrders.jsx
  const submitReview = async (formData, currentOrderForReview) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `http://localhost:5001/api/products/${currentOrderForReview.items[0].productId}/review`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        await updateOrderStatus(currentOrderForReview._id, "Completed");
      } else {
        toast.error("Failed to submit review.");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("An error occurred while submitting the review.");
    }
  };

  // Orders.jsx || UserOrders.jsx
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.put(
        "http://localhost:5001/api/orders/status",
        { orderId, status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Emit event to notify about the status update
      // socket.emit("orderUpdated", { orderId, status: newStatus });

      // Fetch ulang pesanan setelah status diperbarui
      fetchOrders();

      // toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    }
  };

  // UserOrders.jsx
  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.put(
        "http://localhost:5001/api/orders/status",
        { orderId, status: "Canceled" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Emit event to notify about the cancelation
      // socket.emit("orderUpdated", { orderId, status: "Canceled" });

      fetchOrders();
    } catch (error) {
      toast.error("Failed to cancel order."), error;
    }
  };

  // Orders.jsx
  const deleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:5001/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Emit event to notify about the deletion
      // socket.emit("orderDeleted", { orderId });

      fetchOrders();
      toast.success("Order berhasil dihapus!");
    } catch (error) {
      console.error("Error menghapus order:", error);
      toast.error("Gagal menghapus order.");
    }
  };

  // ListItem.jsx
  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:5001/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  // EditItem.jsx
  const updateProduct = async (productId, formData, imageURLs, navigate) => {
    try {
      if (!formData.price || formData.price === "0") {
        toast.error("Please enter a valid price.");
        return false;
      }

      const formattedData = {
        ...formData,
        price: unformatPrice(formData.price),
        image: imageURLs.filter((url) => url !== null),
      };

      await axios.put(
        `http://localhost:5001/api/products/${productId}`,
        formattedData
      );

      toast.success("Product updated successfully.", {
        position: "top-right",
        autoClose: 3000,
        className: "custom-toast",
      });

      navigate("/admin/list");
      return true;
    } catch (error) {
      console.error("Failed to update product", error);
      toast.error("Failed to update product.", {
        position: "top-right",
        className: "custom-toast",
      });
      return false;
    }
  };

  // ReviewItem.jsx
  const fetchProductAndReviews = async (productId) => {
    const token = localStorage.getItem("authToken");
    try {
      const productResponse = await axios.get(
        `http://localhost:5001/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reviewResponse = await axios.get(
        `http://localhost:5001/api/products/admin/${productId}/reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        product: productResponse.data,
        reviews: reviewResponse.data.reviews || [],
      };
    } catch (error) {
      console.error("Gagal mendapatkan data produk atau ulasan", error);
      toast.error("Gagal mendapatkan data produk atau ulasan");
      return { product: null, reviews: [] };
    }
  };

  // ReviewItem.jsx
  const submitReplyToReview = async (productId, reviewId, replyText) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `http://localhost:5001/api/products/admin/${productId}/reviews/${reviewId}/reply`,
        { adminReply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Gagal mengirim balasan", error);
      toast.error("Gagal mengirim balasan");
    }
  };

  // ReviewItem.jsx
  const deleteReview = async (productId, reviewId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(
        `http://localhost:5001/api/products/admin/${productId}/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Gagal menghapus ulasan", error);
      toast.error("Gagal menghapus ulasan");
    }
  };

  const saveOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartAmount = () => {
    return cartItems.reduce((acc, item) => {
      const product = products.find(
        (product) => product._id === item.productId
      );
      return acc + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const loginUser = (token) => {
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
    fetchCartData(token);
    fetchOrders();
    // toast.success("Login successful!");
  };

  const logoutUser = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setCartItems([]);
    setOrders([]);
    // toast.success("Logout successful!");
    navigate("/login");
  };

  const value = {
    products,
    fetchProductsById,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCartCount,
    getCartAmount,
    isLoggedIn,
    loginUser,
    logoutUser,
    navigate,
    orders,
    setOrders,
    saveOrder,
    updateOrderStatus,
    fetchOrders,
    cancelOrder,
    deleteOrder,
    fetchCartData,
    handlePayment,
    deleteProduct,
    updateProduct,
    fetchProductAndReviews,
    submitReplyToReview,
    deleteReview,
    submitReview,
    isModalLogin,
    setIsModalLogin,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ShopContextProvider;
