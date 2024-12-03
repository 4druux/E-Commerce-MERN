import React from "react";
import PropTypes from "prop-types";
import { ShoppingCart, CreditCard, Minus, Plus } from "lucide-react";

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
  openModal,
}) => {
  return (
    <>
      {/* Modal Cart */}
      {isModalCart && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            loadingCart ? "bg-transparent" : "bg-black bg-opacity-50"
          }`}
          onClick={toggleModalCart}
        >
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t rounded-t-xl border-gray-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Image */}
            <div className="flex items-center mt-2 mb-6">
              <img
                src={productData.image}
                alt={productData.name}
                className="w-24 h-24 object-cover rounded-md"
                onClick={openModal}
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
          className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            loadingCart ? "bg-transparent" : "bg-black bg-opacity-50"
          }`}
          onClick={toggleModalCheckOut}
        >
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t rounded-t-xl border-gray-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Image */}
            <div className="flex items-center mt-2 mb-6">
              <img
                src={productData.image}
                alt={productData.name}
                className="w-24 h-24 object-cover rounded-md"
                onClick={openModal}
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
  openModal: PropTypes.func.isRequired,
};

export default ModalProduct;
