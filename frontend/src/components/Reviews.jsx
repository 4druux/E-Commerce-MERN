import React, { useState, useRef, useEffect } from "react";
import { ClipboardList, Star } from "lucide-react";
import { FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";
import { useReviewFilter } from "../utils/useReviewFilter"; // Sesuaikan path import

const Reviews = ({ reviews, productData }) => {
  // Gunakan custom hook
  const {
    selectedRatingFilter,
    selectedSizeFilter,
    showImageOnly,
    selectedDateFilter,
    allSizes,

    setShowImageOnly,

    countAllReviews,
    countReviewsWithImage,
    countReviewsByRating,

    handleRatingFilterChange,
    handleSizeFilterChange,
    handleDateFilterChange,

    isRatingDropdownOpen,
    isSizeDropdownOpen,
    isDateDropdownOpen,
    setIsRatingDropdownOpen,
    setIsSizeDropdownOpen,
    setIsDateDropdownOpen,

    filteredReviews,
  } = useReviewFilter(reviews);

  // State yang masih diperlukan
  const [selectedReviewImage, setSelectedReviewImage] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Dropdown state dan refs
  const ratingDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  const handleSizeFilterChangeWithDropdown = (size) => {
    handleSizeFilterChange(size);
    setIsSizeDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target)
      ) {
        setIsRatingDropdownOpen(false);
      }
      if (
        sizeDropdownRef.current &&
        !sizeDropdownRef.current.contains(event.target)
      ) {
        setIsSizeDropdownOpen(false);
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target)
      ) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsDateDropdownOpen, setIsRatingDropdownOpen, setIsSizeDropdownOpen]);

  useEffect(() => {
    if (isReviewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isReviewModalOpen]);

  const openReviewModal = (image) => {
    setSelectedReviewImage(image);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Dropdown toggle and filter change handlers
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  return (
    <div className="mt-20">
      <div className="flex justify-between my-5">
        <div>
          <button
            className={`border px-5 py-3 text-sm  ${
              activeTab === "description" ? "font-bold border-black" : ""
            }`}
            onClick={() => handleTabClick("description")}
          >
            Description
          </button>
          <button
            className={`border px-5 py-3 text-sm ${
              activeTab === "reviews" ? "font-bold border-black" : ""
            }`}
            onClick={() => handleTabClick("reviews")}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === "reviews" && (
          <div>
            <button
              onClick={toggleFilterMenu}
              className={`border px-5 py-3 text-sm ${
                isFilterMenuOpen ? "font-bold border-black" : ""
              }`}
            >
              Filters
            </button>
          </div>
        )}
      </div>

      {activeTab === "reviews" && isFilterMenuOpen && (
        <div className="my-4 border p-4 flex flex-col rounded-2xl shadow-md bg-white transition-all duration-300  hover:border-gray-300">
          <div className="flex flex-wrap gap-4 justify-start">
            {/* All Button */}
            <button
              className={`border px-5 py-3 text-sm text-gray-600 flex flex-col items-center justify-center w-full sm:w-auto rounded-md  bg-white transition-all duration-300 ${
                !selectedRatingFilter && !selectedSizeFilter && !showImageOnly
                  ? "font-medium shadow-md sm:shadow-lg border-gray-300 text-gray-950"
                  : ""
              }`}
              onClick={() => {
                setShowImageOnly(false);
              }}
            >
              All
              <span className="text-xs mt-1">({countAllReviews})</span>
            </button>

            {/* With Image Button */}
            <button
              className={`border px-5 py-3 text-sm text-gray-600 flex flex-col items-center justify-center w-full sm:w-auto rounded-md  bg-white transition-all duration-300 ${
                showImageOnly
                  ? "font-medium shadow-md sm:shadow-lg border-gray-300 text-gray-950"
                  : ""
              }`}
              onClick={() => setShowImageOnly(!showImageOnly)}
            >
              With Image
              <span className="text-xs mt-1">({countReviewsWithImage})</span>
            </button>

            {/* Filter by Rating Dropdown */}
            <div className="relative w-full sm:w-auto" ref={ratingDropdownRef}>
              <button
                onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                className={`border px-5 py-3 text-sm text-gray-600 flex flex-col items-center justify-center w-full sm:w-auto rounded-md  bg-white transition-all duration-300 ${
                  selectedRatingFilter
                    ? "font-medium shadow-md sm:shadow-lg border-gray-300 text-gray-950"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <span>Filter by Rating</span>
                  {selectedRatingFilter > 0 && (
                    <span className="ml-2 flex items-center">
                      <span className="mr-1">(</span>
                      <Star
                        fill="currentColor"
                        className={`w-4 h-4 ${
                          selectedRatingFilter > 0
                            ? "text-orange-500"
                            : "text-orange-300 opacity-60"
                        }`}
                      />
                      <span className="ml-1">{selectedRatingFilter})</span>
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">
                  ({countReviewsByRating(selectedRatingFilter)})
                </span>
              </button>

              {isRatingDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 p-2"
                  style={{ minWidth: "150px" }}
                >
                  <div className="flex flex-col gap-2">
                    {[...Array(5)].map((_, rowIndex) => {
                      const starCount = 5 - rowIndex;
                      const reviewCount = countReviewsByRating(starCount);

                      return (
                        <button
                          key={rowIndex}
                          onClick={() =>
                            reviewCount > 0 &&
                            handleRatingFilterChange(starCount)
                          }
                          className={`p-2 rounded-md transition focus:outline-none w-full flex items-center justify-between ${
                            reviewCount === 0
                              ? "cursor-not-allowed opacity-50"
                              : "group cursor-pointer"
                          } ${
                            starCount === selectedRatingFilter
                              ? "font-bold border-black"
                              : ""
                          } ${
                            starCount !== 1 ? "border-b border-gray-300" : ""
                          }`}
                          disabled={reviewCount === 0}
                        >
                          {/* Render stars */}
                          <div className="flex space-x-1">
                            {[...Array(starCount)].map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                fill="currentColor"
                                className={`w-4 h-4 transition-all duration-300 ${
                                  reviewCount === 0
                                    ? "text-gray-200"
                                    : starCount === selectedRatingFilter
                                    ? "text-orange-500"
                                    : "text-orange-300 opacity-60"
                                } ${
                                  reviewCount > 0 &&
                                  "group-hover:text-orange-500 group-hover:opacity-100"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Display review count next to stars */}
                          <span
                            className={`ml-2 text-sm ${
                              reviewCount === 0
                                ? "text-gray-400"
                                : "text-gray-600 group-hover:text-black"
                            }`}
                          >
                            ({reviewCount})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filter by Size Dropdown */}
            <div
              className="relative inline-block w-full sm:w-auto"
              ref={sizeDropdownRef}
            >
              <button
                onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
                className={`border px-5 py-3 text-sm text-gray-600 flex flex-col items-center justify-center w-full sm:w-auto rounded-md  bg-white transition-all duration-300 ${
                  selectedSizeFilter
                    ? "font-medium shadow-md sm:shadow-lg border-gray-300 text-gray-950"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <span>Filter by Size</span>
                  {selectedSizeFilter && (
                    <span className="ml-2 flex items-center">
                      <span className="mr-1">(</span>
                      <span>{selectedSizeFilter}</span>
                      <span className="ml-1">)</span>
                    </span>
                  )}
                </div>
              </button>

              {isSizeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 sm:w-auto">
                  <div className="flex sm:justify-between justify-center gap-2 p-2">
                    {allSizes.map((size, i) => {
                      const availableSizesFromReviews = reviews.reduce(
                        (acc, review) => {
                          if (review.size && !acc.includes(review.size)) {
                            acc.push(review.size);
                          }
                          return acc;
                        },
                        []
                      );

                      const isAvailable =
                        availableSizesFromReviews.includes(size);
                      const reviewCountForSize = reviews.filter(
                        (review) => review.size === size
                      ).length;

                      return (
                        <button
                          key={i}
                          onClick={() =>
                            handleSizeFilterChangeWithDropdown(size)
                          }
                          className={`w-12 h-10 flex items-center justify-center border  text-sm transition-transform transform ${
                            selectedSizeFilter === size
                              ? "bg-gray-900 text-white"
                              : isAvailable
                              ? "bg-gray-100 hover:bg-gray-200"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          } ${
                            isAvailable ? "hover:scale-105" : ""
                          } focus:outline-none`}
                          disabled={reviewCountForSize === 0} // Disable if no reviews for this size
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filter by Date Dropdown */}
            <div
              className="relative inline-block w-full sm:w-auto"
              ref={dateDropdownRef}
            >
              <button
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className={`border px-5 py-3 text-sm text-gray-600 flex flex-col items-center justify-center w-full sm:w-auto rounded-md  bg-white transition-all duration-300 ${
                  selectedDateFilter
                    ? "font-medium shadow-md sm:shadow-lg border-gray-300 text-gray-950"
                    : ""
                }`}
              >
                {selectedDateFilter
                  ? `Filter by Date: ${
                      selectedDateFilter === "latest" ? "Newest" : "Oldest"
                    }`
                  : "Filter by Date"}
              </button>

              {isDateDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 "
                  style={{ minWidth: "128px" }}
                >
                  <div className="flex flex-col sm:justify-between justify-center gap-2 p-2">
                    <button
                      onClick={() => handleDateFilterChange("latest")}
                      className={`w-full  px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
                        selectedDateFilter === "latest"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 hover:bg-gray-200 "
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => handleDateFilterChange("oldest")}
                      className={`w-full  px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
                        selectedDateFilter === "oldest"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 hover:bg-gray-200 "
                      }`}
                    >
                      Oldest
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 border text-sm  p-6 rounded-2xl shadow-lg bg-white mb-8 transition-all duration-300 hover:shadow-2xl hover:border-gray-300 justify-between items-start">
        {activeTab === "description" ? (
          <div className="whitespace-pre-line">{productData.description}</div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <div
              key={index}
              className={`w-full ${
                index < filteredReviews.length - 1
                  ? "border-b border-gray-300"
                  : ""
              } pb-4`}
            >
              <div className="flex flex-col items-start gap-2">
                <p className="font-medium text-gray-800">{review.username}</p>

                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      fill={i < review.rating ? "currentColor" : "currentColor"}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-orange-500"
                          : "text-orange-300 opacity-60"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-600 flex gap-1">
                  Size:
                  <span className="text-gray-800">{review.size}</span>
                </p>
                <p className="text-gray-800">{review.reviewText}</p>
                {review.reviewImages && review.reviewImages.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.reviewImages.map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={img}
                        alt={`Review Image ${imgIndex + 1}`}
                        className="w-24 h-24 object-cover rounded cursor-pointer"
                        onClick={() => openReviewModal(img)}
                      />
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(review.createdAt))}
                </p>

                {review.adminReply && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md shadow-inner w-full">
                    <p className="text-gray-800 font-semibold">
                      admin response
                    </p>
                    <p className="text-gray-700">{review.adminReply}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center w-full">
            <ClipboardList
              className="h-24 w-24 text-gray-600 mb-4"
              strokeWidth={1}
            />
            <p className="text-xl text-gray-600">
              No reviews matching the selected filters.
            </p>
          </div>
        )}
      </div>

      {isReviewModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeReviewModal}
        >
          <img
            src={selectedReviewImage}
            alt="Full Review View"
            className="w-auto h-auto max-h-[90%] max-w-[90%] rounded"
          />
          <button
            className="absolute top-4 right-4 text-white  transition-all duration-300 hover:rotate-90"
            onClick={closeReviewModal}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

// Tambahkan PropTypes untuk validasi
Reviews.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string,
      rating: PropTypes.number,
      size: PropTypes.string,
      reviewText: PropTypes.string,
      reviewImages: PropTypes.arrayOf(PropTypes.string),
      createdAt: PropTypes.string,
      adminReply: PropTypes.string,
    })
  ),
  productData: PropTypes.shape({
    description: PropTypes.string,
  }),
};

export default Reviews;
