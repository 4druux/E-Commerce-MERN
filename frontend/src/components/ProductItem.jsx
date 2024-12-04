import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatPrice } from "../utils/formatPrice";
import { Star, ShoppingCart, Package, TrendingUp } from "lucide-react";
import ModalAddToCart from "./ModalAddToCart";

const ProductItem = ({ id, image, name, price, reviews, soldCount, rank }) => {
  const { currency, isLoggedIn, setIsModalLogin } = useContext(ShopContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = Array.isArray(image) ? image : [image];

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const averageRating = calculateAverageRating(reviews);
  const reviewCount = reviews.length;

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setIsModalLogin(true);
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative group">
        <Link className="block text-gray-700" to={`/product/${id}`}>
          <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-300 border border-white group-hover:shadow-lg group-hover:border group-hover:border-gray-300">
            <div
              className="relative overflow-hidden group/image"
              style={{ paddingTop: "120%", maxWidth: "100%" }}
            >
              <img
                className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-300 ease-in-out group-hover:scale-110"
                src={images[0]}
                alt={name}
              />

              {rank && rank <= 3 && (
                <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl px-1.5 py-1 group-hover:scale-105 transition-transform duration-300 ease-in-out">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-white mr-1 -rotate-12" />
                    <span className="text-xs font-medium text-white">
                      Top {rank}
                    </span>
                  </div>
                </div>
              )}

              {/* Shopping Cart Icon - Mobile/Tablet */}
              <div className="lg:hidden absolute top-1 right-2">
                <div
                  onClick={handleCartClick}
                  className="bg-white/80 p-2 rounded-full shadow-lg  cursor-pointer transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                </div>
              </div>

              {/* Overlay Shopping Cart Icon - Desktop */}
              <div className="hidden md:block">
                <div className="absolute inset-0 opacity-0 group-hover/image:opacity-100 bg-black bg-opacity-0 group-hover/image:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div
                    onClick={handleCartClick}
                    className="opacity-0 group-hover/image:opacity-100 bg-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-110"
                  >
                    <ShoppingCart className="w-7 h-7 text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-base font-medium text-gray-900 line-clamp-2 overflow-hidden">
                {name}
              </p>
              <p className="mt-2 text-sm  text-gray-900">
                {currency}
                {formatPrice(price)}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center  bg-orange-50 border border-orange-100 rounded px-1 py-0.5">
                  <Star
                    fill="currentColor"
                    className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500"
                  />
                  <span className="ml-1 text-gray-900 text-xs">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-700 text-xs ml-1">
                    ({reviewCount})
                  </span>
                </div>
                <div className="h-4 border-r-2 border-gray-200"></div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                    <span className="text-gray-900 ml-1  text-xs">
                      {soldCount} Sold
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Modal Add to Cart */}
      <ModalAddToCart
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productId={id}
      />
    </>
  );
};

ProductItem.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      rating: PropTypes.number.isRequired,
    })
  ).isRequired,
  soldCount: PropTypes.number.isRequired,
  rank: PropTypes.number,
};

export default ProductItem;
