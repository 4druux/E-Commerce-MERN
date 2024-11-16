import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { formatPrice } from "../utils/formatPrice";
import { useLocation } from "react-router-dom";
import CartItem from "../components/CartItem";
import SkeletonCart from "../components/SkeletonCart";

const Cart = () => {
  const location = useLocation();
  const {
    products,
    currency,
    delivery_fee,
    updateQuantity,
    removeFromCart,
    setCartItems,
    cartItems,
    fetchCartData,
    navigate,
  } = useContext(ShopContext);

  const [selectedItems, setSelectedItems] = useState([]);
  const [showDelete, setShowDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetchCartData(token).then(() => setIsLoading(false)); 
  }, [fetchCartData]);

  useEffect(() => {
    if (location.state?.selectedItems) {
      setSelectedItems(location.state.selectedItems);
    }
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
      setCartItems((prevData) =>
        prevData.map((item) =>
          item.productId === itemId && item.size === size
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

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
    setCartItems((prevData) =>
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
      <div className="border-t pt-14">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCart key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 my-10">No items available</p>
      ) : (
        <div>
          {cartItems.map((item, index) => {
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
      )}

      {cartItems.length > 0 && (
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
      )}
    </div>
  );
};

export default Cart;
