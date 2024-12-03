import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatPrice } from "../utils/formatPrice";
// import { assets } from "../assets/assets";
import { Star } from "lucide-react";

const ProductItem = ({ id, image, name, price, reviews, soldCount }) => {
  const { currency } = useContext(ShopContext);
  const images = Array.isArray(image) ? image : [image];

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const averageRating = calculateAverageRating(reviews);
  const reviewCount = reviews.length;

  return (
    <Link className="block text-gray-700" to={`/product/${id}`}>
      <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg hover:border hover:border-gray-300 duration-300">
        <div
          className="relative overflow-hidden"
          style={{ paddingTop: "120%", maxWidth: "100%" }}
        >
          <img
            className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-300 ease-in-out hover:scale-110"
            src={images[0]}
            alt={name}
          />
        </div>
        <div className="p-4">
          <p className="text-base text-gray-900 line-clamp-2 overflow-hidden">
            {name}
          </p>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {currency}
            {formatPrice(price)}
          </p>
          {/* <div className="mt-2 inline-block border bg-orange-50 rounded px-1 py-0.5 align-middle">
            {renderSingleStarWithRating(averageRating, reviewCount)}
          </div> */}
          <div className="flex items-center text-orange-500 mt-2">
            <Star fill="currentColor" className="w-4 h-4" />
            <span className="ml-1 text-gray-700 text-sm">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm ml-1">({reviewCount} )</span>
          </div>

          <p className="mt-2 text-sm text-gray-600">Sold: {soldCount}</p>
        </div>
      </div>
    </Link>
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
};

export default ProductItem;
