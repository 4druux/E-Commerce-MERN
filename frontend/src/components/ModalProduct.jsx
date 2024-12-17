import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ShoppingCart, CreditCard, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const ModalProduct = ({
  isModalCart,
  isModalCheckOut,
  toggleModalCart,
  toggleModalCheckOut,
  productData,
  currency,
  formatPrice,
  allSizes,
  handleSizeClick,
  size,
  quantity,
  setQuantity,
  handleAddToCart,
  handleCheckout,
  loadingCart,
  LoadingCheckout,
}) => {
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const closeModal = () => {
    setIsImageModalOpen(false);
  };

  // Effect untuk Modal Cart
  useEffect(() => {
    if (isModalCart) {
      // Sedikit delay untuk memastikan animasi berjalan
      setTimeout(() => {
        setIsCartModalVisible(true);
      }, 50);
    } else {
      setIsCartModalVisible(false);
    }
  }, [isModalCart]);

  // Effect untuk Modal Checkout
  useEffect(() => {
    if (isModalCheckOut) {
      // Sedikit delay untuk memastikan animasi berjalan
      setTimeout(() => {
        setIsCheckoutModalVisible(true);
      }, 50);
    } else {
      setIsCheckoutModalVisible(false);
    }
  }, [isModalCheckOut]);

  // Fungsi untuk menutup modal dengan animasi
  const handleCloseCartModal = () => {
    setIsCartModalVisible(false);
    setTimeout(() => {
      toggleModalCart();
    }, 300);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalVisible(false);
    setTimeout(() => {
      toggleModalCheckOut();
    }, 300);
  };

  return (
    <>
      {/* Modal Cart */}
      {isModalCart && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out ${
            loadingCart ? "bg-transparent" : "bg-black/30"
          } ${isCartModalVisible ? "opacity-100" : "opacity-0"}`}
          onClick={handleCloseCartModal}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t rounded-t-xl border-gray-200 p-6 transform transition-all duration-300 ease-in-out ${
              isCartModalVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Image */}
            <div className="flex items-center mt-2 mb-6">
              <img
                src={productData.image}
                alt={productData.name}
                className="w-24 h-24 object-cover rounded-md"
                onClick={() => openImageModal(productData.image)}
              />
              <div className="ml-4">
                <p className="text-md font-medium">{productData.name}</p>
                <p className="text-xl font-semibold">
                  {currency}
                  {formatPrice(productData.price)}
                </p>
              </div>
            </div>

            {/* Size Selection */}
            <p className="font-semibold mb-4">Select Size</p>
            <div className="flex gap-2 mb-4">
              {allSizes.map((item, index) => {
                const isAvailable = productData.sizes.includes(item);
                return (
                  <button
                    key={index}
                    onClick={() => handleSizeClick(item)}
                    className={`py-2 px-4 border text-sm transition-all duration-300 transform hover:-translate-y-1 ${
                      isAvailable
                        ? item === size
                          ? "bg-gray-900 text-white border-black"
                          : "bg-gray-100 hover:bg-gray-200"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isAvailable}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Quantity Selection */}
            <div className="flex flex-col">
              <p className="font-semibold mb-4">Quantity</p>
              <div className="flex items-center space-x-3 mb-4 ">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="flex items-center justify-center bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                  className="w-20 text-center border-2 rounded-lg py-1 bg-gray-50"
                  min="1"
                />
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex items-center justify-center bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center shadow-md hover:shadow-lg space-x-2 py-3 ${
                  !size
                    ? "bg-gray-100 text-gray-500"
                    : "bg-gray-900 text-white hover:scale-[1.02] transition-all duration-300"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{loadingCart ? "ADDING..." : "ADD TO CART"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Checkout */}
      {isModalCheckOut && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out ${
            LoadingCheckout ? "bg-transparent" : "bg-black/30"
          } ${isCheckoutModalVisible ? "opacity-100" : "opacity-0"}`}
          onClick={handleCloseCheckoutModal}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t rounded-t-xl border-gray-200 p-6 transform transition-all duration-300 ease-in-out ${
              isCheckoutModalVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Image */}
            <div className="flex items-center mt-2 mb-6">
              <img
                src={productData.image}
                alt={productData.name}
                className="w-24 h-24 object-cover rounded-md"
                onClick={() => openImageModal(productData.image)}
              />
              <div className="ml-4">
                <p className="text-md font-medium">{productData.name}</p>
                <p className="text-xl font-semibold">
                  {currency}
                  {formatPrice(productData.price)}
                </p>
              </div>
            </div>

            {/* Size Selection */}
            <p className="font-semibold mb-4">Select Size</p>
            <div className="flex gap-2 mb-4">
              {allSizes.map((item, index) => {
                const isAvailable = productData.sizes.includes(item);
                return (
                  <button
                    key={index}
                    onClick={() => handleSizeClick(item)}
                    className={`py-2 px-4 border text-sm transition-all duration-300 transform hover:-translate-y-1 ${
                      isAvailable
                        ? item === size
                          ? "bg-gray-900 text-white border-black"
                          : "bg-gray-100 hover:bg-gray-200"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isAvailable}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Quantity Selection */}
            <div className="flex flex-col">
              <p className="font-semibold mb-4">Quantity</p>
              <div className="flex items-center space-x-3 mb-4 ">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="flex items-center justify-center bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                  className="w-20 text-center border-2 rounded-lg py-1 bg-gray-50"
                  min="1"
                />
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex items-center justify-center bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleCheckout}
                className={`w-full flex items-center justify-center shadow-md hover:shadow-lg space-x-2 py-3 ${
                  !size
                    ? "bg-gray-100 text-gray-500"
                    : "bg-gray-900 text-white hover:scale-[1.02] transition-all duration-300"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>CHECKOUT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] backdrop-blur-sm p-4"
            onClick={closeModal}
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
                onClick={closeModal}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// PropTypes validation
ModalProduct.propTypes = {
  isModalCart: PropTypes.bool.isRequired,
  isModalCheckOut: PropTypes.bool.isRequired,
  toggleModalCart: PropTypes.func.isRequired,
  toggleModalCheckOut: PropTypes.func.isRequired,
  productData: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sizes: PropTypes.arrayOf(PropTypes.string).isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  currency: PropTypes.string.isRequired,
  formatPrice: PropTypes.func.isRequired,
  allSizes: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleSizeClick: PropTypes.func.isRequired,
  size: PropTypes.string,
  quantity: PropTypes.number.isRequired,
  setQuantity: PropTypes.func.isRequired,
  handleAddToCart: PropTypes.func.isRequired,
  handleCheckout: PropTypes.func.isRequired,
  loadingCart: PropTypes.bool.isRequired,
  LoadingCheckout: PropTypes.bool.isRequired,
};

export default ModalProduct;
