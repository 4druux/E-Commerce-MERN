import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
// import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import Reviews from "../components/Reviews";
import { toast } from "react-toastify";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
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
  const [reviews, setReviews] = useState([]);

  // Filter Review Product
  const [averageRating, setAverageRating] = useState(0);
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
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // Fungsi untuk membuka modal img
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal img
  const closeModal = () => {
    setIsModalOpen(false);
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
                className={`w-[24%] lg:w-full md:w-full lg:mb-3 md:mb-3 flex-shrink-0 cursor-pointer rounded-md
              ${selectedImageIndex === index ? "border  border-gray-600" : ""}`}
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
                className="w-full h-full rounded-xl cursor-pointer object-cover"
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
                className="w-auto h-auto max-h-[90%] max-w-[90%] rounded-xl"
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
          <div className="flex items-center space-x-1 mt-2">
            <div className="flex items-center text-orange-500">
              <Star fill="currentColor" className="w-4 h-4" />
              <span className="ml-1 text-gray-700 text-base">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500 text-sm">({reviews.length})</span>
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
                    className={`py-2 px-4 border text-sm transition-all duration-300 transform hover:-translate-y-1  ${
                      isAvailable
                        ? item === size
                          ? "bg-gray-900 hover:bg-gray-800 text-white border-gray-100"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
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
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
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
              <ShoppingCart span CHECKOUT />
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

      <Reviews
        reviews={reviews}
        productData={{
          description: productData.description,
        }}
      />
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        onProductClick={handleRelatedProductClick}
      />
    </div>
  ) : null;
};

export default Product;
