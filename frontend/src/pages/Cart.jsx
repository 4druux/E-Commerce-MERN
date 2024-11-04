import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { formatPrice } from "../utils/formatPrice";
import axios from "axios";
import { useLocation } from "react-router-dom";
import CartItem from "../components/CartItem";

const Cart = () => {
  const location = useLocation();
  const {
    products,
    currency,
    delivery_fee,
    updateQuantity,
    removeFromCart,
    navigate,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDelete, setShowDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true); // State untuk loading

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("https://ecommerce-backend-ebon-six.vercel.app/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartData(response.data.items);

        if (location.state?.selectedItems) {
          setSelectedItems(location.state.selectedItems);
        }
        setIsLoading(false); // Hentikan loading setelah data berhasil diterima
      } catch (error) {
        console.error("Failed to fetch cart data", error);
        setIsLoading(false); // Hentikan loading jika terjadi error
      }
    };

    fetchCartData();
  }, [location.state]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleQuantityChange = async (itemId, size, newQuantity) => {
    if (newQuantity >= 1) {
      await updateQuantity(itemId, size, newQuantity);
      setCartData((prevData) =>
        prevData.map((item) =>
          item.productId === itemId && item.size === size
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Perbarui selectedItems jika item yang berubah sudah dipilih
      setSelectedItems((prevItems) =>
        prevItems.map((selectedItem) =>
          selectedItem._id === itemId && selectedItem.size === size
            ? { ...selectedItem, quantity: newQuantity }
            : selectedItem
        )
      );
    }
  };

  const handleCheckboxChange = (item, productData) => {
    const isSelected = selectedItems.some(
      (selectedItem) =>
        selectedItem._id === item.productId && selectedItem.size === item.size
    );

    if (isSelected) {
      setSelectedItems((prevItems) =>
        prevItems.filter(
          (selectedItem) =>
            selectedItem._id !== item.productId ||
            selectedItem.size !== item.size
        )
      );
    } else {
      setSelectedItems((prevItems) => [
        ...prevItems,
        {
          _id: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: productData.price,
          imageUrl:
            productData.image && productData.image.length > 0
              ? productData.image[0]
              : "/placeholder-image.png",
          name: productData.name,
        },
      ]);
    }
  };

  const handleRemoveItem = async (itemId, size) => {
    await removeFromCart(itemId, size);
    setCartData((prevData) =>
      prevData.filter((item) => item.productId !== itemId || item.size !== size)
    );

    setSelectedItems((prevItems) =>
      prevItems.filter(
        (selectedItem) =>
          selectedItem._id !== itemId || selectedItem.size !== size
      )
    );
  };

  const handleIncrement = (itemId, size, currentQuantity) => {
    handleQuantityChange(itemId, size, currentQuantity + 1);
  };

  const handleDecrement = (itemId, size, currentQuantity) => {
    if (currentQuantity > 1) {
      handleQuantityChange(itemId, size, currentQuantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item.productId
          );

          if (!productData) {
            return null;
          }

          return (
            <CartItem
              key={index}
              item={item}
              productData={productData}
              selectedItems={selectedItems}
              handleCheckboxChange={handleCheckboxChange}
              handleDecrement={handleDecrement}
              handleQuantityChange={handleQuantityChange}
              handleIncrement={handleIncrement}
              handleRemoveItem={handleRemoveItem}
              currency={currency}
              formatPrice={formatPrice}
              showDelete={showDelete}
              setShowDelete={setShowDelete}
              isMobile={isMobile}
            />
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal
            selectedItems={selectedItems}
            delivery_fee={delivery_fee}
          />
          <div className="w-full text-center sm:text-end">
            <button
              onClick={() =>
                navigate("/check-out", {
                  state: { selectedItems, delivery_fee },
                })
              }
              className="bg-black text-white text-sm my-8 px-8 py-3 mx-auto sm:mx-0"
              disabled={selectedItems.length === 0}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
