import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "../utils/formatPrice";
import SkeletonProduct from "../components/SkeletonProduct";

// Import Swiper components
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Product = () => {
  // Fetch Data Product
  const { productId } = useParams();
  const { currency, addToCart, isLoggedIn, fetchProductsById } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [size, setSize] = useState("");

  // Image Data Product
  const [image, setImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected decription dan review
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);

  // Filter Review Product
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(0);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("");
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [showImageOnly, setShowImageOnly] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const ratingDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);
  const navigate = useNavigate();
  const allSizes = ["S", "M", "L", "XL", "XXL"];
  const [quantity, setQuantity] = useState(1);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);
  const cachedProductRef = useRef({});

  // Fungsi Rata-Rata Rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  useEffect(() => {
    const getProductData = async () => {
      if (cachedProductRef.current[productId]) {
        setProductData(cachedProductRef.current[productId]);
        setImage(cachedProductRef.current[productId].image[0]);
        setAverageRating(
          calculateAverageRating(
            cachedProductRef.current[productId].reviews || []
          )
        );
        setLoadingProduct(false);
        return;
      }

      setLoadingProduct(true);

      const product = await fetchProductsById(productId);
      if (product) {
        setProductData(product);
        setImage(product.image[0]);
        setReviews(product.reviews || []);
        setAverageRating(calculateAverageRating(product.reviews || []));
        cachedProductRef.current[productId] = product;
      }
      setLoadingProduct(false);
      window.scrollTo(0, 0);
    };

    getProductData();
  }, [productId, fetchProductsById]);

  // Handle Relate Products
  const handleRelatedProductClick = (newProductId) => {
    if (newProductId !== productId) {
      setLoadingProduct(true);
      navigate(`/product/${newProductId}`);
    }
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
  }, []);

  useEffect(() => {
    if (isModalOpen || isReviewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, isReviewModalOpen]);

  // Fungsi untuk membuka modal img
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal img
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openReviewModal = (image) => {
    setSelectedReviewImage(image);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  // Fungsi Input Size
  const handleSizeClick = (selectedSize) => {
    if (productData.sizes.includes(selectedSize)) {
      setSize(size === selectedSize ? "" : selectedSize);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!size) {
      toast.error("Please select a size", {
        autoClose: 2000,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    }
    setLoadingCart(true);
    await addToCart(
      productData._id,
      size,
      productData.price,
      productData.name,
      quantity
    );
    setLoadingCart(false);
    setSize("");
    setQuantity(1);
    toast.success("Product added to cart", {
      autoClose: 2000,
      position: "top-right",
      className: "custom-toast",
    });
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!size) {
      toast.error("Please select a size", {
        autoClose: 1500,
        position: "top-right",
        className: "custom-toast",
      });
      return;
    }

    const selectedItem = {
      _id: productData._id,
      size,
      quantity: 1,
      price: productData.price,
    };
    await addToCart(productData._id, size, productData.price, productData.name);
    navigate("/cart", { state: { selectedItems: [selectedItem] } });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
            <span className="mr-1">(</span>
            <img
              src={assets.star_icon}
              alt="Star"
              className="w-4 h-4 text-yellow-500"
            />
            <span className="ml-1">{rating})</span>{" "}
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
            <span className="mr-1">(</span>
            <span>{selectedSize}</span>
            <span className="ml-1">)</span>
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
          const starCount = 5 - rowIndex;
          const reviewCount = countReviewsByRating(starCount);

          return (
            <button
              key={rowIndex}
              onClick={() => handleRatingFilterChange(starCount)}
              className="border border-gray-300 p-2 rounded-md hover:bg-gray-100 transition focus:outline-none w-full flex items-center justify-between"
            >
              {/* Render bintang */}
              <div className="flex">
                {[...Array(starCount)].map((_, starIndex) => (
                  <img
                    key={starIndex}
                    src={
                      starCount === rating
                        ? assets.star_icon
                        : assets.star_dull_icon
                    }
                    alt={`${starCount} Star`}
                    className="w-5 h-5 mx-1"
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

    if (selectedDateFilter === "" || selectedDateFilter === "latest") {
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

  if (loadingProduct) return <SkeletonProduct />;

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex flex-col lg:flex-row md:flex-row gap-12">
        <div className="flex-1 flex flex-col-reverse lg:flex-row md:flex-row gap-3">
          <div className="flex lg:flex-col md:flex-col overflow-x-auto lg:overflow-y-scroll md:overflow-y-scroll justify-start lg:justify-normal md:justify-normal lg:w-[18.7%] md:w-[18.7%] w-full gap-1">
            {productData.image.map((item, index) => (
              <img
                onMouseEnter={() => {
                  setImage(item);
                  setSelectedImageIndex(index);
                }}
                src={item}
                key={index}
                className={`w-[24%] lg:w-full md:w-full lg:mb-3 md:mb-3 flex-shrink-0 cursor-pointer rounded-sm
              ${
                selectedImageIndex === index
                  ? "border rounded-md border-black"
                  : ""
              }`}
                alt="Product Thumbnail"
              />
            ))}
          </div>

          {/* Gambar Utama */}
          <div className="w-full lg:w-[80%] md:w-[80%] ">
            {/* Untuk layar mobile (sm): Slider Swiper */}
            <div className="sm:block lg:hidden md:hidden">
              <Swiper
                slidesPerView={1}
                spaceBetween={10}
                pagination={{
                  clickable: true,
                  bulletClass: "swiper-pagination-bullet bg-black",
                  bulletActiveClass: "swiper-pagination-bullet-active bg-black",
                }}
                modules={[Pagination]}
                onSlideChange={(swiper) => {
                  setImage(productData.image[swiper.activeIndex]);
                  setSelectedImageIndex(swiper.activeIndex);
                }}
                className="w-full cursor-pointer"
              >
                {productData.image.map((item, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={item}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-auto rounded-sm"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Untuk layar desktop dan tablet */}
            <div className="hidden sm:hidden lg:block md:block">
              <img
                src={image}
                className="w-full h-full rounded-sm cursor-pointer object-cover"
                alt="Selected Product"
                onClick={openModal}
              />
            </div>
          </div>

          {/* Modal for full-screen view */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={closeModal}
            >
              <img
                src={image}
                alt="Full View"
                className="w-auto h-auto max-h-[90%] max-w-[90%] rounded"
              />
              <button
                className="absolute top-5 right-5 text-white text-3xl"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {renderSingleStarWithRating(averageRating, reviews.length)}
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {formatPrice(productData.price)}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {allSizes.map((item, index) => {
                const isAvailable = productData.sizes.includes(item);
                return (
                  <button
                    key={index}
                    onClick={() => handleSizeClick(item)}
                    className={`border py-2 px-4  ${
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
            <div className="flex flex-col gap-4 ">
              <p>Quantity</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="bg-gray-50 border border-gray-300 hover:bg-gray-200 flex items-center justify-center "
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                  className="border text-center px-1  border-gray-300 "
                  style={{
                    width: "60px",
                    height: "40px",
                  }}
                  min="1"
                />
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="bg-gray-50 border border-gray-300 hover:bg-gray-200 flex items-center justify-center "
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 lg:gap-4 md:gap-4 lg:w-full md:w-full lg:max-w-[400px] md:max-w-[400px] lg:min-w-[300px] md:min-w-[300px]">
            <button
              className="flex-1 border border-black px-4 py-3 text-sm active:bg-gray-700 hover:bg-black hover:text-white transition-all duration-500"
              onClick={handleAddToCart}
              disabled={loadingCart}
            >
              {loadingCart ? "ADDING TO CART..." : "ADD TO CART"}
            </button>
            <button
              className="flex-1 bg-black text-white px-4 py-3 text-sm active:bg-gray-700"
              onClick={handleCheckout}
            >
              CHECKOUT
            </button>
          </div>

          <hr className="mt-8 lg:w-4/5 md:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex justify-between my-5">
          <div>
            <button
              className={`border px-5 py-3 text-sm ${
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
              <div
                className="relative w-full sm:w-auto"
                ref={ratingDropdownRef}
              >
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
                    style={{ minWidth: "200px" }}
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

        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          {activeTab === "description" ? (
            <div className="whitespace-pre-line">{productData.description}</div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{review.username}</p>{" "}
                  {renderStars(review.rating, "text-red-500")}
                </div>
                <p>Size: {review.size}</p>
                <p>{review.reviewText}</p>
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
                <p className="text-gray-400 text-xs mt-2">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(review.createdAt))}
                </p>

                {review.adminReply && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-inner">
                    <p className="text-gray-800 font-semibold">
                      Response Admin
                    </p>
                    <p className="text-gray-700">{review.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No reviews matching the selected filters.</p>
          )}
        </div>
      </div>

      {isReviewModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeReviewModal}
        >
          <img
            src={selectedReviewImage}
            alt="Full Review View"
            className="w-auto h-auto max-h-[90%] max-w-[90%] rounded"
          />
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={closeReviewModal}
          >
            &times;
          </button>
        </div>
      )}

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        onProductClick={handleRelatedProductClick}
      />
    </div>
  ) : null;
};

export default Product;
