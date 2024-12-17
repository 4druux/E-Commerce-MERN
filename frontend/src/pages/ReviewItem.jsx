import React, { useState, useEffect, useRef, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../components/Title";
// import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import SkeletonReviewItem from "../components/SkeletonReviewItem";
import SweetAlert from "../components/SweetAlert";
import { ClipboardList, Star, Trash2 } from "lucide-react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useReviewFilter } from "../utils/useReviewFilter";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const ReviewItem = () => {
  const { fetchProductAndReviews, submitReplyToReview, deleteReview } =
    useContext(ShopContext);
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentReplyId, setCurrentReplyId] = useState(null);
  const ratingDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  const [selectedReviewImage, setSelectedReviewImage] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const navigate = useNavigate();

  const [isloading, setIsLoading] = useState(true);
  const [isReply, setIsReply] = useState();
  const [isDelete, setIsDelete] = useState();
  const [isOverlay, setIsOverlay] = useState();

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

  // Fetching product and reviews
  useEffect(() => {
    const getData = async () => {
      const { product, reviews } = await fetchProductAndReviews(productId);
      // setTimeout(() => {
      setProduct(product);
      setReviews(reviews);
      setAverageRating(calculateAverageRating(reviews));
      setIsLoading(false);
      // }, 600000);
    };

    getData();
  }, [productId, fetchProductAndReviews]);

  // Tutup Dropdown dengan klik luar konten
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

  // Handler untuk balasan admin
  const handleReplySubmit = async (reviewId) => {
    setIsReply(true);
    await submitReplyToReview(productId, reviewId, replyText);
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review._id === reviewId ? { ...review, adminReply: replyText } : review
      )
    );
    setReplyText("");
    setCurrentReplyId(null);
    setIsReply(false);
  };

  // Fungsi Rata-Rata Rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const handleSizeFilterChangeWithDropdown = (size) => {
    handleSizeFilterChange(size);
    setIsSizeDropdownOpen(false);
  };

  // Fungsi dynamis filter menu
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      // Nonaktifkan scroll saat SweetAlert muncul
      document.body.style.overflow = "hidden";
      setIsOverlay(true);

      const willDelete = await SweetAlert({
        title: "Delete Confirmation",
        message: "Are you sure you want to delete this review?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: true,
        // Callback tambahan untuk memastikan scroll diatur ulang
        onOpen: () => {
          document.body.style.overflow = "hidden";
        },
        onClose: () => {
          document.body.style.overflow = "unset";
          setIsOverlay(false);
        },
      });

      if (willDelete) {
        setIsDelete(true);
        await deleteReview(productId, reviewId);
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== reviewId)
        );
        setIsDelete(false);

        await SweetAlert({
          title: "Review Deleted",
          message: "The review has been successfully deleted.",
          icon: "success",
          buttons: true,
          closeOnClickOutside: true,
          // Pastikan scroll diatur ulang
          onClose: () => {
            document.body.style.overflow = "unset";
            setIsOverlay(false);
          },
        });
      }
    } catch (error) {
      console.error("Error in delete process:", error);
    } finally {
      // Terakhir, pastikan overlay dan scroll diatur
      document.body.style.overflow = "unset";
      setIsOverlay(false);
    }
  };

  useEffect(() => {
    if (isReviewModalOpen || isDelete || isReply || isOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isReviewModalOpen, isDelete, isReply, isOverlay]);

  const openReviewModal = (image) => {
    setSelectedReviewImage(image);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-0 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="text-2xl ">
          <Title text1={"PRODUCT"} text2={"REVIEW"} />
        </div>
      </div>

      {isloading ? (
        <SkeletonReviewItem />
      ) : (
        <>
          {/* Tampilkan data produk */}
          {product && (
            <div className="mb-8">
              <div
                className="bg-white cursor-pointer rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all 
                duration-300 hover:shadow-xl flex flex-col md:flex-row "
                onClick={() => navigate(-1)}
              >
                {/* Image Section - Ukuran lebih kecil */}
                <div className="w-full md:w-1/3 p-4 flex items-center justify-center">
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="max-w-full max-h-[300px] object-cover rounded-lg shadow-md" // batasi tingginya
                  />
                </div>

                {/* Product Information */}
                <div className="p-6 w-full md:w-2/3 flex flex-col mb-4">
                  <h1 className="text-xl font-medium text-gray-900 mb-4 ">
                    {product.name}
                  </h1>

                  {/* Rating Section */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          fill="currentColor"
                          className={`w-5 h-5 ${
                            star <= Math.round(averageRating)
                              ? "text-orange-500"
                              : "text-orange-300 opacity-60"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 ml-2 text-sm">
                      {averageRating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>

                  {/* Product Details - Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    {[
                      { label: "Category", value: product.category },
                      { label: "Sub Category", value: product.subCategory },
                      {
                        label: "Price",
                        value: `Rp${formatPrice(product.price || 0)}`,
                      },
                      { label: "Sizes", value: product.sizes.join(", ") },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col">
                        <p className="text-gray-800 font-medium text-sm">
                          {label}:
                        </p>
                        <p className="text-gray-500 text-base truncate">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end w-full mb-4">
            <button
              onClick={toggleFilterMenu}
              className={`border px-5 py-3 text-sm ${
                isFilterMenuOpen ? "font-bold border-black" : ""
              }`}
            >
              Filters
            </button>
          </div>

          {isFilterMenuOpen && (
            <div className="my-4 border p-4 flex flex-col rounded-2xl shadow-md bg-white transition-all duration-300  hover:border-gray-300">
              <div className="flex flex-wrap gap-4 justify-start">
                {/* All Button */}
                <button
                  className={`border px-5 py-3 text-sm text-gray-600 flex flex-col items-center justify-center w-full sm:w-auto rounded-md  bg-white transition-all duration-300 ${
                    !selectedRatingFilter &&
                    !selectedSizeFilter &&
                    !showImageOnly
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
                  <span className="text-xs mt-1">
                    ({countReviewsWithImage})
                  </span>
                </button>

                {/* Filter by Rating Dropdown */}
                <div
                  className="relative w-full sm:w-auto"
                  ref={ratingDropdownRef}
                >
                  <button
                    onClick={() =>
                      setIsRatingDropdownOpen(!isRatingDropdownOpen)
                    }
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
                                starCount !== 1
                                  ? "border-b border-gray-300"
                                  : ""
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

          {/* Menampilkan review yang difilter */}
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center w-full">
              <ClipboardList
                className="h-24 w-24 text-gray-600 mb-4"
                strokeWidth={1}
              />
              <p className="text-xl text-gray-600">
                No reviews matching the selected filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6 mt-8">
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="border p-6 rounded-2xl shadow-lg bg-white flex flex-col justify-between items-start transition-all duration-300 hover:shadow-xl relative"
                >
                  <div className="flex flex-col space-y-2 w-full">
                    <p className="font-semibold text-gray-800">
                      {review.username}
                    </p>

                    <div className="flex items-center">
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

                    <p className="text-sm text-gray-500">
                      <strong>Size:</strong> {review.size}
                    </p>

                    <div
                      className="text-gray-800"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        wordBreak: "break-all",
                      }}
                    >
                      {review.reviewImages &&
                        review.reviewImages.length > 0 && (
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

                      {review.reviewText.split("\n").map((paragraph, index) => (
                        <p key={index} className="mb-2">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {review.adminReply && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl shadow-inner">
                        <p className="text-gray-800 font-semibold">
                          admin response
                        </p>
                        <p className="text-gray-700">{review.adminReply}</p>
                      </div>
                    )}

                    <p className="text-gray-400 text-xs">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(review.createdAt))}
                    </p>

                    {currentReplyId === review._id ? (
                      <div
                        className="mt-4 flex flex-col space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tulis balasan admin..."
                          className="border p-2 rounded-xl shadow-sm focus:outline-gray-800 transition duration-300 resize-none h-32 
                           placeholder:text-gray-400"
                        />

                        <button
                          onClick={() => handleReplySubmit(review._id)}
                          disabled={!replyText.trim()}
                          className={`w-full flex items-center justify-center shadow-md hover:shadow-lg space-x-2 py-3 rounded-full ${
                            replyText.trim()
                              ? "bg-gray-900 text-white transition-all duration-300"
                              : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          send reply
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-end items-center space-x-2 mt-4 w-full">
                    <button
                      className="p-2 rounded-full group bg-gray-100 border border-gray-200 hover:bg-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out"
                      onClick={() =>
                        currentReplyId === review._id
                          ? setCurrentReplyId(null)
                          : setCurrentReplyId(review._id)
                      }
                    >
                      <IoChatbubbleEllipsesOutline
                        alt="Chat"
                        className="w-7 h-7 text-gray-600 group-hover:text-gray-800"
                      />
                    </button>

                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 rounded-full group bg-red-50 border border-red-200 hover:bg-red-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out"
                    >
                      <Trash2
                        className="w-6 h-6 text-red-300 group-hover:text-red-500"
                        alt="Delete"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </>
      )}
      {isReply ||
        (isDelete && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-[100] transition-opacity duration-300 ease-in-out">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
          </div>
        ))}

      {isOverlay && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"></div>
      )}
    </div>
  );
};

export default ReviewItem;
