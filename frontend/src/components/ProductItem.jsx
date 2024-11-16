import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatPrice } from "../utils/formatPrice";
import { assets } from "../assets/assets";

const ProductItem = ({ id, image, name, price }) => {
  const { currency, fetchProductsById } = useContext(ShopContext);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const images = Array.isArray(image) ? image : [image];

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  useEffect(() => {
    const fetchData = async () => {
      const product = await fetchProductsById(id);
      if (product) {
        setAverageRating(calculateAverageRating(product.reviews));
        setReviewCount(product.reviews.length);
      }
    };
    fetchData();
  }, [id, fetchProductsById]);

  // Fungsi untuk render bintang rating
  const renderSingleStarWithRating = (rating, reviewCount) => {
    return (
      <div className="flex items-center">
        <img
          src={assets.star_icon}
          alt="Star"
          className="w-3 h-3 text-yellow-500"
        />
        <span className="ml-2 text-gray-800 text-xs">{rating.toFixed(1)}</span>
        <span className="ml-1 text-gray-500 text-xs">({reviewCount})</span>
      </div>
    );
  };

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
          <p className="text-base  text-gray-900">{name}</p>
          <div className="mt-2 inline-block border bg-orange-50 rounded px-1 py-0.5 align-middle">
            {renderSingleStarWithRating(averageRating, reviewCount)}
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {currency}
            {formatPrice(price)}
          </p>
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
};

export default ProductItem;
