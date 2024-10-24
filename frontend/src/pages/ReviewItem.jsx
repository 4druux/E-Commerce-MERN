import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const ReviewItem = () => {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null); // Data product tetap digunakan
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(0);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [showImageOnly, setShowImageOnly] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentReplyId, setCurrentReplyId] = useState(null);
  const ratingDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  const navigate = useNavigate();
  const allSizes = ["S", "M", "L", "XL", "XXL"];

  // Fetching product and reviews
  useEffect(() => {
    const fetchProductAndReviews = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token tidak ditemukan. Harap login kembali.");
        return;
      }

      try {
        const productResponse = await axios.get(
          `https://ecommerce-backend-ebon-six.vercel.app/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const reviewResponse = await axios.get(
          `https://ecommerce-backend-ebon-six.vercel.app/api/products/admin/${productId}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const reviewsData = reviewResponse.data.reviews || [];
        const avgRating = calculateAverageRating(reviewsData);
        setAverageRating(avgRating);

        setProduct(productResponse.data); // Set the product data
        setReviews(reviewsData); // Set the reviews data
        setLoading(false);
      } catch (error) {
        console.error("Gagal mendapatkan data produk atau review", error);
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [productId]); // No need to include product.reviews in the dependency array

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
  }, []);

  // Handler untuk balasan admin
  const handleReplySubmit = async (reviewId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `https://ecommerce-backend-ebon-six.vercel.app/api/products/admin/${productId}/reviews/${reviewId}/reply`,
        { adminReply: replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? { ...review, adminReply: replyText }
            : review
        )
      );
      setReplyText("");
      setCurrentReplyId(null);
    } catch (error) {
      console.error("Gagal mengirim balasan", error);
    }
  };

  // Handler untuk menghapus review
  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(
        `https://ecommerce-backend-ebon-six.vercel.app/api/products/admin/${productId}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewId)
      );
    } catch (error) {
      console.error("Gagal menghapus review", error);
    }
  };

  // Fungsi Rata-Rata Rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  // Fungsi 1 star dan rating (0.0- 5.0)
  const renderSingleStarWithRating = (rating, reviewCount) => {
    return (
      <div className="flex items-center">
        <img src={assets.star_icon} alt="Star" className="w-4 text-red-500" />
        <span className="ml-1 text-gray-800">{rating.toFixed(1)}</span>
        <span className="ml-2 text-gray-800">({reviewCount})</span>
      </div>
    );
  };

  // Fungsi filter by rating tanpa gaya
  const renderStarRatingLabel = (rating) => {
    return (
      <div className="flex items-center">
        <span>Filter by Rating</span>
        {rating > 0 && (
          <span className="ml-2 flex items-center">
            <span className="mr-1">(</span> {/* Tambahkan margin ke kanan */}
            <img
              src={assets.star_icon}
              alt="Star"
              className="w-4 h-4 text-yellow-500"
            />
            <span className="ml-1">{rating})</span>{" "}
            {/* Tambahkan rating dan tutup kurung */}
          </span>
        )}
      </div>
    );
  };

  // Fungsi filter by size tanpa gaya
  const renderSizeLabel = (selectedSize) => {
    return (
      <div className="flex items-center">
        <span>Filter by Size</span>
        {selectedSize && (
          <span className="ml-2 flex items-center">
            <span className="mr-1">(</span> {/* Tambahkan margin ke kanan */}
            <span>{selectedSize}</span>
            <span className="ml-1">)</span> {/* Tambahkan tanda tutup kurung */}
          </span>
        )}
      </div>
    );
  };

  // Fungsi render star dropdown select tanpa gaya
  const renderModernStars = (rating, handleRatingFilterChange) => {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, rowIndex) => {
          const starCount = 5 - rowIndex; // Menentukan jumlah bintang per baris
          const reviewCount = countReviewsByRating(starCount); // Hitung jumlah ulasan per rating

          return (
            <button
              key={rowIndex}
              onClick={() => handleRatingFilterChange(starCount)} // Klik seluruh baris untuk filter
              className="border border-gray-300 p-2 rounded-md hover:bg-gray-100 transition focus:outline-none w-full flex items-center justify-between"
            >
              {/* Render bintang */}
              <div className="flex">
                {[...Array(starCount)].map((_, starIndex) => (
                  <img
                    key={starIndex}
                    src={
                      starCount === rating
                        ? assets.star_icon // Filled star
                        : assets.star_dull_icon // Unfilled star
                    }
                    alt={`${starCount} Star`}
                    className="w-5 h-5 mx-1" // Ukuran bintang dan spasi antar bintang
                  />
                ))}
              </div>

              {/* Tampilkan jumlah ulasan di samping baris bintang */}
              <span className="ml-2 text-sm text-gray-600">
                ({reviewCount})
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Fungsi render size dropdown select tanpa gaya
  const renderModernSizes = (selectedSizeFilter, handleSizeFilterChange) => {
    const availableSizesFromReviews = reviews.reduce((acc, review) => {
      if (review.size && !acc.includes(review.size)) {
        acc.push(review.size);
      }
      return acc;
    }, []);

    return (
      <div>
        {allSizes.map((size, i) => {
          const isAvailable = availableSizesFromReviews.includes(size);
          return (
            <button
              key={i}
              onClick={() => handleSizeFilterChange(size)}
              disabled={!isAvailable}
            >
              {size}
            </button>
          );
        })}
      </div>
    );
  };

  // Fungsi render star review user
  const renderStars = (rating, color = "text-red-500") => {
    return (
      <div className={`flex ${color}`}>
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src={i < rating ? assets.star_icon : assets.star_dull_icon}
            alt="Star"
            className="w-4"
          />
        ))}
      </div>
    );
  };

  // Fungsi perubahan star filter
  const handleRatingFilterChange = (rating) => {
    setSelectedRatingFilter(selectedRatingFilter === rating ? 0 : rating);
    setIsRatingDropdownOpen(false);
  };

  // Fungsi perubahan size filter
  const handleSizeFilterChange = (size) => {
    setSelectedSizeFilter(selectedSizeFilter === size ? "" : size);
    setIsSizeDropdownOpen(false);
  };

  // Fungsi perubahan date filter
  const handleDateFilterChange = (order) => {
    setSelectedDateFilter(selectedDateFilter === order ? "" : order);
    setIsDateDropdownOpen(false);
  };

  // Fungsi dynamis filter menu
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  // Filter review img,star,size,date
  const filteredReviews = useMemo(() => {
    const filtered = reviews.filter((review) => {
      const ratingMatches =
        selectedRatingFilter === 0 || review.rating === selectedRatingFilter;
      const sizeMatches =
        selectedSizeFilter === "" || review.size === selectedSizeFilter;
      const imageMatches = showImageOnly
        ? review.reviewImages.length > 0
        : true;

      return ratingMatches && sizeMatches && imageMatches;
    });

    if (selectedDateFilter === "latest") {
      return filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (selectedDateFilter === "oldest") {
      return filtered.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    return filtered;
  }, [
    reviews,
    selectedRatingFilter,
    selectedSizeFilter,
    showImageOnly,
    selectedDateFilter,
  ]);

  // Hitung total semua review (All)
  const countAllReviews = reviews.length;

  // Hitung review dengan gambar (With Image) yang sesuai dengan filter rating
  const countReviewsWithImage = reviews.filter(
    (review) =>
      review.reviewImages.length > 0 &&
      (selectedRatingFilter === 0 || review.rating === selectedRatingFilter)
  ).length;

  // Hitung review berdasarkan rating tertentu (Rating)
  const countReviewsByRating = (rating) =>
    reviews.filter((review) => review.rating === rating).length;

  // Renders
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-0 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 shadow-lg transition-all duration-300"
        >
          <img
            src={assets.left_icon}
            alt="Back"
            className="w-5 h-5 transform transition-transform duration-300 hover:scale-110"
          />
        </button>
        <div className="ml-4 text-2xl ">
          <Title text1={"PRODUCT"} text2={"REVIEW"} />
        </div>
      </div>

      {/* Tampilkan data produk */}
      {product && (
        <div className="border p-6 rounded-lg shadow-md bg-white mb-8 transition-all duration-300 hover:shadow-2xl hover:border-gray-300">
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
              <h1 className="font-medium text-2xl mt-2">{product.name}</h1>
              <div className="flex items-center gap-1 mt-2">
                {renderSingleStarWithRating(averageRating, reviews.length)}
              </div>
              <p className="text-gray-600 text-sm md:text-base">
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
                  <strong>Price:</strong> Rp{product.price.toLocaleString()}
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
        <div className="my-4 border p-4">
          <div className="flex flex-wrap gap-4 justify-start">
            {/* All Button */}
            <button
              className={`border px-5 py-3 text-sm flex flex-col items-center justify-center w-full sm:w-auto ${
                !selectedRatingFilter && !selectedSizeFilter && !showImageOnly
                  ? "font-bold border-black"
                  : ""
              }`}
              onClick={() => {
                setSelectedRatingFilter(0);
                setSelectedSizeFilter("");
                setShowImageOnly(false);
              }}
            >
              All
              <span className="text-xs mt-1">({countAllReviews})</span>
            </button>

            {/* With Image Button */}
            <button
              className={`border px-5 py-3 text-sm flex flex-col items-center justify-center w-full sm:w-auto ${
                showImageOnly ? "font-bold border-black" : ""
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
                className={`border px-4 py-3 text-sm flex flex-col items-center justify-center w-full sm:w-auto ${
                  selectedRatingFilter ? "font-bold border-black" : ""
                }`}
              >
                {renderStarRatingLabel(selectedRatingFilter)}
                <span className="text-xs mt-1">
                  ({countReviewsByRating(selectedRatingFilter)})
                </span>
              </button>

              {isRatingDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 p-2"
                  style={{ minWidth: "200px" }} // Menjaga ukuran konsisten
                >
                  <div className="flex flex-col items-start gap-2">
                    {renderModernStars(
                      selectedRatingFilter,
                      handleRatingFilterChange
                    )}
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
                className={`border px-5 py-3 text-sm flex flex-col items-center justify-center w-full sm:w-auto ${
                  selectedSizeFilter ? "font-bold border-black" : ""
                }`}
              >
                {renderSizeLabel(selectedSizeFilter)}
              </button>

              {isSizeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 sm:w-auto">
                  <div className="flex sm:justify-between justify-center gap-2 p-2">
                    {renderModernSizes(
                      selectedSizeFilter,
                      handleSizeFilterChange
                    ).props.children.map((button, i) => (
                      <button
                        key={i}
                        onClick={button.props.onClick}
                        className={`w-12 h-10 flex items-center justify-center border rounded-md text-sm transition-transform transform ${
                          selectedSizeFilter === button.props.children
                            ? "bg-gray-950 text-white"
                            : reviews
                                .map((review) => review.size)
                                .includes(button.props.children)
                            ? "bg-gray-100 hover:bg-gray-200"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        } ${
                          reviews
                            .map((review) => review.size)
                            .includes(button.props.children)
                            ? "hover:scale-105"
                            : ""
                        } focus:outline-none`}
                        disabled={button.props.disabled}
                      >
                        {button.props.children}
                      </button>
                    ))}
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
                className={`border px-5 py-3 text-sm flex flex-col items-center justify-center w-full sm:w-auto ${
                  selectedDateFilter ? "font-bold border-black" : ""
                }`}
              >
                {selectedDateFilter
                  ? `Filter by Date: ${
                      selectedDateFilter === "latest" ? "Newest" : "Oldest"
                    }`
                  : "Filter by Date"}
              </button>

              {isDateDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 sm:w-auto">
                  <div className="flex sm:justify-between justify-center gap-2 p-2">
                    <button
                      onClick={() => handleDateFilterChange("latest")}
                      className={`w-full sm:w-auto px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
                        selectedDateFilter === "latest"
                          ? "bg-black text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => handleDateFilterChange("oldest")}
                      className={`w-full sm:w-auto px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
                        selectedDateFilter === "oldest"
                          ? "bg-black text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
        <p className="text-center mt-8 text-gray-600">
          Tidak ada review untuk produk ini.
        </p>
      ) : (
        <div className="space-y-6 mt-8">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="border p-6 rounded-md shadow-lg bg-white flex flex-col justify-between items-start transition-all duration-300 hover:shadow-xl relative"
            >
              <div className="flex flex-col space-y-2 w-full">
                <p className="font-semibold text-gray-800">{review.username}</p>

                <div className="flex items-center">
                  {renderStars(review.rating)}
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
                  <img
                    src={assets.chat_icon}
                    alt="Chat"
                    className="w-6 h-6 filter group-hover:invert"
                  />
                </button>

                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="bg-black px-4 py-2 rounded-md active:bg-gray-800 transition-all duration-300"
                >
                  <img
                    src={assets.recycle_bin}
                    alt="Delete"
                    className="w-6 h-6 filter invert contrast-200 brightness-200"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
