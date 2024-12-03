import React, { useState, useEffect, useRef, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../components/Title";
// import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import SkeletonReviewItem from "../components/SkeletonReviewItem";
import SweetAlert from "../components/SweetAlert";
import { ClipboardList, MessageCircleReply, Star, Trash2 } from "lucide-react";
import { useReviewFilter } from "../utils/useReviewFilter";

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

  const navigate = useNavigate();

  const [isloading, setIsLoading] = useState(true);
  const [isReply, setIsReply] = useState();
  const [isDelete, setIsDelete] = useState();

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
    SweetAlert({
      title: "Delete Confirmation",
      message: "Are you sure you want to delete this review?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeOnClickOutside: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        setIsDelete(true);
        await deleteReview(productId, reviewId);
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== reviewId)
        );
        setIsDelete(false);

        SweetAlert({
          title: "Review Deleted",
          message: "The review has been successfully deleted.",
          icon: "success",
          buttons: true,
          closeOnClickOutside: true,
        });
      }
    });
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
            <div
              className="border p-6 rounded-lg shadow-md bg-white mb-8 transition-all duration-300 hover:shadow-2xl hover:border-gray-300 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <div className="flex flex-col md:flex-row items-start">
                {product.image && product.image.length > 0 && (
                  <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="w-full h-auto max-h-64 object-contain rounded-lg"
                    />
                  </div>
                )}
                <div className="flex flex-col space-y-4 w-full">
                  <h1 className="font-medium text-2xl mt-2 line-clamp-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex items-center text-orange-500">
                      <Star fill="currentColor" className="w-4 h-4" />
                      <span className="ml-1 text-gray-700 text-base">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      ({reviews.length})
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-col space-y-2 mt-2 text-sm md:text-base">
                    <p className="text-gray-700">
                      <strong>Category:</strong> {product.category}
                    </p>
                    <p className="text-gray-700">
                      <strong>Sub Category:</strong> {product.subCategory}
                    </p>
                    <p className="text-gray-700">
                      <strong>Price:</strong> Rp
                      {formatPrice(product.price || 0)}
                    </p>
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
                  className="border p-6 rounded-md shadow-lg bg-white flex flex-col justify-between items-start transition-all duration-300 hover:shadow-xl relative"
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

                    <p className="text-sm text-gray-600">{review.reviewText}</p>

                    {review.reviewImages && review.reviewImages.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.reviewImages.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`Review Image ${imgIndex + 1}`}
                            className="w-24 h-24 object-cover rounded-md shadow-md"
                          />
                        ))}
                      </div>
                    )}

                    {review.adminReply && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-inner">
                        <p className="text-gray-800 font-semibold">
                          Balasan Admin:
                        </p>
                        <p className="text-gray-700">{review.adminReply}</p>
                      </div>
                    )}

                    <p className="text-gray-400 text-xs mt-2">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(review.createdAt))}
                    </p>

                    {currentReplyId === review._id ? (
                      <div className="mt-4 flex flex-col space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tulis balasan admin..."
                          className="border p-2 rounded-md shadow-sm"
                        />
                        <button
                          onClick={() => handleReplySubmit(review._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
                        >
                          Kirim Balasan
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-end items-center space-x-2 mt-4 w-full">
                    <button
                      className="border border-black px-4 py-2 rounded-md hover:bg-black transition-all duration-500 group"
                      onClick={() =>
                        currentReplyId === review._id
                          ? setCurrentReplyId(null)
                          : setCurrentReplyId(review._id)
                      }
                    >
                      <MessageCircleReply
                        alt="Chat"
                        className="w-6 h-6 filter group-hover:invert"
                      />
                    </button>

                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="bg-black px-4 py-2 rounded-md active:bg-gray-800 transition-all duration-300"
                    >
                      <Trash2
                        className="w-6 h-6 filter invert contrast-200 brightness-200"
                        alt="Delete"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isReply ||
        (isDelete && (
          <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
          </div>
        ))}
    </div>
  );
};

export default ReviewItem;
