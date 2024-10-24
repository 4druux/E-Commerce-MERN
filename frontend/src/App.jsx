import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import CheckOut from "./pages/CheckOut";
import Payment from "./pages/Payment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserOrders from "./pages/UserOrders";

// Import halaman UserLogin dan AdminLogin
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";

// Panel Admin
import AdminPanel from "./components/AdminPanel";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import ListItems from "./pages/ListItems";
import Orders from "./pages/Orders";
import ReviewItem from "./pages/ReviewItem";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="px-4 sm:px-[6vw] md:px-[9vw] lg:px-[10vw]">
      <ToastContainer />
      {!isAdmin && <Navbar />}
      {!isAdmin && <SearchBar />}
      <Routes>
        {/* Routes untuk bagian user */}
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserLogin />} />
        <Route path="/check-out" element={<CheckOut />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/orders" element={<UserOrders />} />{" "}
        {/* Ubah import di sini */}
        {/* Routes untuk bagian admin */}
        <Route path="/admin/login" element={<AdminLogin />} />{" "}
        {/* Login untuk Admin */}
        <Route path="/admin/register" element={<AdminLogin />} />{" "}
        {/* Register untuk Admin */}
        <Route path="/admin" element={<AdminPanel />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add" element={<AddItem />} />
          <Route path="edit/:id" element={<EditItem />} />
          <Route path="/admin/reviews/:productId" element={<ReviewItem />} />
          <Route path="list" element={<ListItems />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;
