import React, { useState, useRef, useEffect } from "react";
import { ClipboardList, Star } from "lucide-react";
import { FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";
import { useReviewFilter } from "../utils/useReviewFilter";
import { motion, AnimatePresence } from "framer-motion";

const Reviews = ({ reviews, productData }) => {
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
                          disabled={reviewCountForSize === 0}
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
                          : "hover:bg-gray-50 "
                      }`}
                    >
                      Newest
                    </button>
                    <span className="border border-gray-100"></span>
                    <button
                      onClick={() => handleDateFilterChange("oldest")}
                      className={`w-full  px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
                        selectedDateFilter === "oldest"
                          ? "bg-gray-900 text-white"
                          : " hover:bg-gray-50 "
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

      <div className="flex flex-col gap-4 border text-sm  p-6 rounded-2xl shadow-md bg-white mb-8 transition-all duration-300  hover:border-gray-300 justify-between items-start">
        {activeTab === "description" ? (
          <div
            className="whitespace-pre-line"
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              wordBreak: "break-all",
            }}
          >
            {productData.description}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="w-full max-h-[100vh] overflow-y-auto [&::-webkit-scrollbar]:w-[4px] scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {filteredReviews.map((review, index) => (
              <div
                key={index}
                className={`w-full ${
                  index < filteredReviews.length - 1
                    ? "border-b border-gray-300 mb-3"
                    : ""
                } pb-4`}
              >
                <div className="flex flex-col items-start gap-2">
                  <p className="font-medium text-gray-800">{review.username}</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        fill={
                          i < review.rating ? "currentColor" : "currentColor"
                        }
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

                  {review.reviewImages && review.reviewImages.length > 0 && (
                    <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <div className="flex gap-2 mt-2 pb-2 min-w-full">
                        {review.reviewImages.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`Review Image ${imgIndex + 1}`}
                            className="flex-shrink-0 w-24 h-24 object-cover rounded cursor-pointer transition-all duration-500 brightness-90 shadow-md 
                            hover:scale-110 hover:shadow-xl hover:brightness-100 active:scale-95"
                            onClick={() => openReviewModal(img)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className="text-gray-800"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      wordBreak: "break-all",
                    }}
                  >
                    {review.reviewText.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <p className="text-gray-500 text-xs mt-2">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(review.createdAt))}
                  </p>
                  {review.adminReply && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl shadow-inner w-full">
                      <p className="text-gray-800 font-semibold">
                        admin response
                      </p>
                      <p className="text-gray-700">{review.adminReply}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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

      <AnimatePresence mode="wait">
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] backdrop-blur-sm p-4"
            onClick={closeReviewModal}
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
                src={selectedReviewImage}
                alt="Full Review View"
                className="w-auto h-auto max-h-[80vh] max-w-[80vw] rounded-xl object-contain shadow-2xl 
                transform transition-all duration-500 ease-in-out hover:scale-105"
              />

              <button
                className="absolute top-3 right-3 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full p-2 
                text-white transition-all duration-300 hover:rotate-180 hover:scale-110"
                onClick={closeReviewModal}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
