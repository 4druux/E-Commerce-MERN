import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
// import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
import { FaTimes } from "react-icons/fa";

const ModalAddToCart = ({ isOpen, onClose, productId }) => {
  const { products, addToCart } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    if (productId) {
      const foundProduct = products.find((p) => p._id === productId);
      setProduct(foundProduct || null);
    }
  }, [productId, products]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsModalVisible(true), 100);
    } else {
      document.body.style.overflow = "unset";
      setIsModalVisible(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay" && !loadingCart) {
      closeModalWithAnimation();
    }
  };

  // Fungsi Input Size
  const handleSizeClick = (selectedSize) => {
    if (product.sizes.includes(selectedSize)) {
      setSize(size === selectedSize ? "" : selectedSize);
    }
  };
  const handleClickInsideModal = (e) => {
    e.stopPropagation();
  };

  const closeModalWithAnimation = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleAddToCart = async () => {
    if (!size) {
      toast.error("Please select a size", {
        autoClose: 2000,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    }

    const quantityValue = parseInt(quantity, 10);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast.error("Invalid quantity", {
        autoClose: 2000,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    }

    if (!product || !product._id || !product.price || !product.name) {
      toast.error("Product not found", {
        autoClose: 2000,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    }

    setLoadingCart(true);

    try {
      const success = await addToCart(
        product._id,
        size,
        product.price,
        product.name,
        quantityValue
      );

      setLoadingCart(false);

      if (success) {
        closeModalWithAnimation();
        setSize("");
        setQuantity(1);

        toast.success("Product added to cart", {
          autoClose: 2000,
          position: "top-right",
          className: "custom-toast",
        });
      } else {
        toast.error("Failed to add item to cart", {
          autoClose: 2000,
          position: "top-right",
          className: "custom-toast",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart", {
        autoClose: 2000,
        position: "top-right",
        className: "custom-toast",
      });
      setLoadingCart(false);
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const averageRating = calculateAverageRating(product?.reviews || []);
  const reviewCount = product?.reviews?.length || 0;

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (!product) {
    return null;
  }

  return (
    isOpen && (
      <div
        id="modal-overlay"
        className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          loadingCart ? "bg-transparent" : "bg-black bg-opacity-50"
        }`}
        onClick={handleClickOutside}
      >
        {loadingCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full text-white"></div>
          </div>
        )}
        <div
          onClick={handleClickInsideModal}
          className={`bg-white rounded-none sm:rounded-2xl overflow-hidden shadow-2xl w-full h-full max-w-full max-h-full md:max-w-[80%] md:max-h-[45%] lg:max-h-[75vh]  xl:max-w-[70%] xl:max-h-[85%] 2xl:max-w-[60%] 2xl:max-h-[75%] relative transform transition-all duration-700 ease-in-out ${
            isModalVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          }`}
        >
          <div className="grid md:grid-cols-[1fr_1.5fr] h-full">
            {/* Image Section - Desktop */}
            <div className="hidden md:flex">
              <div className="w-full h-full ">
                <img
                  src={
                    product?.image && Array.isArray(product.image)
                      ? product.image[0]
                      : "default-image.jpg"
                  }
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="relative p-6 md:p-8 overflow-y-auto max-h-full flex flex-col">
              <button
                onClick={closeModalWithAnimation}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:rotate-90 bg-gray-100 rounded-full p-2 z-10"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              {/* Mobile Image - Vertical Layout */}
              <div className="md:hidden mb-6">
                <div className="w-full h-full relative">
                  <img
                    src={
                      product?.image && Array.isArray(product.image)
                        ? product.image[0]
                        : "default-image.jpg"
                    }
                    alt={product?.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <h2 className="text-2xl font-medium text-gray-900 line-clamp-1">
                  {product?.name}
                </h2>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center text-orange-500">
                    <Star fill="currentColor" className="w-4 h-4" />
                    <span className="ml-1 text-gray-700 text-base">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    ({reviewCount} reviews)
                  </span>
                </div>
                <p className="text-xl font-medium text-gray-900 line-clamp-1">
                  {product?.currency}
                  Rp{formatPrice(product?.price)}
                </p>
                <div className="flex flex-col">
                  <div className="mb-6">
                    {/* Size Section */}
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Size
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["S", "M", "L", "XL", "XXL"].map((sizeOption) => {
                        const isAvailable = product.sizes.includes(sizeOption);
                        return (
                          <button
                            key={sizeOption}
                            onClick={() => handleSizeClick(sizeOption)}
                            className={`py-2 px-4 border text-sm transition-all duration-300 transform hover:-translate-y-1  ${
                              isAvailable
                                ? sizeOption === size
                                  ? "bg-gray-900 hover:bg-gray-800 text-white border-gray-100"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!isAvailable}
                          >
                            {sizeOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-3"
                    >
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange("decrement")}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value)))
                        }
                        className="w-20 text-center border-2 rounded-lg py-1 bg-gray-50 "
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange("increment")}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
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
          </div>
        </div>
      </div>
    )
  );
};

ModalAddToCart.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  productId: PropTypes.string.isRequired,
};

export default ModalAddToCart;
