import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
// import io from "socket.io-client"; 

export const ShopContext = createContext();

// const socket = io("https://ecommerce-backend-ebon-six.vercel.app"); 

const ShopContextProvider = (props) => {
  const currency = "Rp";
  const delivery_fee = 2500;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchCartData = useCallback(
    async (token) => {
      try {
        const response = await axios.get("https://ecommerce-backend-ebon-six.vercel.app/api/cart", {
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
        "https://ecommerce-backend-ebon-six.vercel.app/api/user/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const role = responseUser.data.role;

      const endpoint =
        role === "admin"
          ? "https://ecommerce-backend-ebon-six.vercel.app/api/orders"
          : "https://ecommerce-backend-ebon-six.vercel.app/api/orders/user-orders";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.orders);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem("authToken");
        toast.error("Session expired. Please log in again.");
        navigate(userRole === "admin" ? "/admin/login" : "/login"); // Navigate based on role
      } else {
        toast.error("Failed to load orders.");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const tokenExpiration = localStorage.getItem("tokenExpiration"); // Ambil waktu kadaluwarsa token

    // Fungsi untuk cek apakah token sudah kadaluwarsa
    const checkSessionExpiration = () => {
      const currentTime = new Date().getTime();
      if (tokenExpiration && currentTime > tokenExpiration) {
        // Jika token kadaluwarsa
        setIsLoggedIn(false);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("tokenExpiration"); // Hapus waktu kadaluwarsa

        toast.error("Session expired. Please log in again.");
        navigate(userRole === "admin" ? "/admin/login" : "/login"); // Arahkan berdasarkan role
      }
    };

    if (token) {
      setIsLoggedIn(true);
      fetchCartData(token);
      fetchOrders();

      // Pengecekan token setiap 60 detik
      const intervalId = setInterval(checkSessionExpiration, 60000); // 60 detik
      return () => clearInterval(intervalId); // Bersihkan interval saat komponen tidak digunakan
    } else {
      setIsLoggedIn(false);
      setCartItems([]);
    }

    fetchProducts();
  }, [fetchCartData, fetchOrders, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "https://ecommerce-backend-ebon-six.vercel.app/api/products/all"
      );
      setProducts(response.data);
    } catch {
      toast.error("Failed to load products.");
    }
  };

  const addToCart = async (itemId, size, price, name) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const productResponse = await axios.get(
        `https://ecommerce-backend-ebon-six.vercel.app/api/products/${itemId}`
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
        quantity: 1,
        name,
        imageUrl,
      };

      const response = await axios.post(
        "https://ecommerce-backend-ebon-six.vercel.app/api/cart/add",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(response.data.items);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://ecommerce-backend-ebon-six.vercel.app/api/cart/update",
        { productId: itemId, size, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items);
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      toast.error("Failed to update cart quantity.");
    }
  };

  const removeFromCart = async (itemId, size) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://ecommerce-backend-ebon-six.vercel.app/api/cart/remove",
        { productId: itemId, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error("Failed to remove item from cart.");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.put(
        "https://ecommerce-backend-ebon-six.vercel.app/api/orders/status",
        { orderId, status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Emit event to notify about the status update
      // socket.emit("orderUpdated", { orderId, status: newStatus });

      // Fetch ulang pesanan setelah status diperbarui
      fetchOrders();

      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    }
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
    console.log("Token received after login:", token); // Tambahkan log token yang diterima
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
    fetchCartData(token);
    fetchOrders(); // Tidak perlu mengirim token di sini, token sudah diambil dari localStorage
    toast.success("Login successful!");
  };

  const logoutUser = () => {
    localStorage.removeItem("authToken"); // Hapus token yang tersimpan
    setIsLoggedIn(false); // Ubah state login menjadi false
    setCartItems([]); // Hapus data keranjang
    setOrders([]); // Kosongkan pesanan
    toast.success("Logout successful!");
    navigate("/"); // Arahkan kembali ke halaman login
  };

  const saveOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  // Fungsi untuk membatalkan pesanan
  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");

      // Hanya memperbarui status menjadi Canceled
      await axios.put(
        "https://ecommerce-backend-ebon-six.vercel.app/api/orders/status", // Pastikan path ini sesuai dengan router
        { orderId, status: "Canceled" },
        {  
          headers: { Authorization: `Bearer ${token}` }, // Sertakan token
        }
      );

      // Emit event to notify about the cancelation
      // socket.emit("orderUpdated", { orderId, status: "Canceled" });

      // Refresh pesanan setelah pembatalan
      fetchOrders();
    } catch (error) {
      toast.error("Failed to cancel order."), error;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`https://ecommerce-backend-ebon-six.vercel.app/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Emit event to notify about the deletion
      // socket.emit("orderDeleted", { orderId });

      fetchOrders(); // Perbarui daftar pesanan setelah penghapusan
      toast.success("Order berhasil dihapus!");
    } catch (error) {
      console.error("Error menghapus order:", error);
      toast.error("Gagal menghapus order.");
    }
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
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
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ShopContextProvider;
