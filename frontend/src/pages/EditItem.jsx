import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import SkeletonEditItem from "../components/SkeletonEditItem";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "../components/Title";
import { formatPrice } from "../utils/formatPrice";

// Import Swiper components
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import CropModal from "../components/ModalCrop";
import { CloudUpload, Plus, Trash2, UploadCloud } from "lucide-react";

const EditItem = () => {
  const { fetchProductsById, updateProduct } = useContext(ShopContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([null]);
  const [imageURLs, setImageURLs] = useState([null]);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [cropIndex, setCropIndex] = useState(null);
  const [availableSizes, setAvailableSizes] = useState({
    S: false,
    M: false,
    L: false,
    XL: false,
    XXL: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Men",
    subCategory: "Topwear",
    sizes: [],
    bestseller: false,
  });

  const [originalData, setOriginalData] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const product = await fetchProductsById(id);

          if (product) {
            setFormData({
              name: product.name,
              description: product.description,
              price: formatPrice(product.price.toString()),
              category: product.category,
              subCategory: product.subCategory,
              sizes: product.sizes,
              bestseller: product.bestseller,
            });
            setImageURLs(product.image || []);
            setOriginalData({
              name: product.name,
              description: product.description,
              price: formatPrice(product.price.toString()),
              category: product.category,
              subCategory: product.subCategory,
              sizes: product.sizes,
              bestseller: product.bestseller,
              image: product.image || [],
            });

            const sizesState = {
              S: false,
              M: false,
              L: false,
              XL: false,
              XXL: false,
            };
            product.sizes.forEach((size) => {
              sizesState[size] = true;
            });
            setAvailableSizes(sizesState);
          } else {
            toast.error("Failed to fetch product.");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Error fetching product.");
        } finally {
          // await new Promise(resolve => setTimeout(resolve, 2000));
          setIsLoading(false);
          setHasFetched(true);
        }
      };

      fetchProduct();
    }
  }, [id, fetchProductsById, hasFetched]);

  useEffect(() => {
    if (isCropModalOpen || isSaving) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCropModalOpen, isSaving]);

  const handleImageChange = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentCropImage(reader.result);
        setCropIndex(index);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    const updatedImages = [...images];
    updatedImages[cropIndex] = croppedImage;
    setImages(updatedImages);

    const updatedImageURLs = [...imageURLs];
    const reader = new FileReader();
    reader.onloadend = () => {
      updatedImageURLs[cropIndex] = reader.result;
      setImageURLs(updatedImageURLs);
    };
    reader.readAsDataURL(croppedImage);

    setIsCropModalOpen(false);
  };

  const handleRemoveImage = (index) => {
    const files = [...images];
    const urls = [...imageURLs];
    files[index] = null;
    urls[index] = null;
    setImages(files);
    setImageURLs(urls);
    setIsChanged(true);
  };

  const handleSizeToggle = (size) => {
    setAvailableSizes((prevSizes) => ({
      ...prevSizes,
      [size]: !prevSizes[size],
    }));

    setFormData((prevState) => {
      const newSizes = prevState.sizes.includes(size)
        ? prevState.sizes.filter((s) => s !== size)
        : [...prevState.sizes, size];

      if (
        !isChanged &&
        newSizes.sort().join() !== originalData.sizes.sort().join()
      ) {
        setIsChanged(true);
      }

      return {
        ...prevState,
        sizes: newSizes,
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "price") {
      if (value === "") {
        formattedValue = "";
      } else {
        formattedValue = formatPrice(value.replace(/^0+/, ""));
      }
    }

    setFormData((prevState) => {
      if (!isChanged && formattedValue !== originalData[name]) {
        setIsChanged(true);
      }

      return {
        ...prevState,
        [name]: formattedValue,
      };
    });
  };

  const handleAddImage = () => {
    if (images.length < 5) {
      setImages([...images, null]);
      setImageURLs([...imageURLs, null]);
      setIsChanged(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const success = await updateProduct(id, formData, imageURLs, navigate);
    setIsSaving(false);
    if (!success) {
      toast.error("Failed to save product changes.");
    }
  };

  const subCategoriesList = [
    "Jackets",
    "Hoodies",
    "Sweaters",
    "Dresses",
    "Long Sleeve Shirts",
    "T-Shirts",
    "Pants",
    "Skirts",
  ];

  if (isLoading) {
    return <SkeletonEditItem />;
  }

  return (
    <div>
      <div className="mb-6 text-2xl ">
        <Title text1={"EDIT"} text2={"ITEM"} />
      </div>
      <form
        className="bg-white border p-6 mb-6 shadow-xl rounded-2xl"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Upload Image
            </label>
            <div className="flex flex-wrap justify-start items-start gap-x-4 gap-y-6">
              {/* Slider di layar mobile */}
              <div className="sm:hidden w-full">
                <Swiper
                  slidesPerView={1}
                  spaceBetween={10}
                  pagination={{
                    clickable: true,
                    bulletClass: "swiper-pagination-bullet bg-black",
                    bulletActiveClass:
                      "swiper-pagination-bullet-active bg-black",
                  }}
                  modules={[Pagination]}
                  className="w-full cursor-pointer"
                >
                  {imageURLs.map((url, index) => (
                    <SwiperSlide key={index} className="cursor-pointer">
                      <div
                        className={`relative rounded-xl w-full h-[300px] flex items-center justify-center bg-gray-50 ${
                          url
                            ? "border-none"
                            : "border-2 border-dashed border-gray-300"
                        } `}
                      >
                        {url ? (
                          <>
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-full rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/50  rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <Trash2 className="w-8 h-8 text-white hover:scale-125 transition-all duration-300 ease-in-out" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="absolute rounded-xl inset-0 flex items-center justify-center bg-gray-50 cursor-pointer">
                            <UploadCloud className="w-12 h-12 text-gray-400" />

                            <input
                              type="file"
                              className="hidden"
                              onChange={(event) =>
                                handleImageChange(index, event)
                              }
                            />
                          </label>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                  {images.length < 5 && (
                    <SwiperSlide>
                      <div className="relative w-full rounded-xl h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer">
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="flex items-center justify-center w-full h-full"
                        >
                          <span>
                            <Plus className="w-10 h-10 text-gray-400" />
                          </span>
                        </button>
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Tampilan gambar biasa di layar lebih besar dari sm */}
              <div className="hidden sm:flex flex-wrap items-start justify-start gap-x-4 gap-y-6">
                {imageURLs.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 sm:w-48 sm:h-48"
                  >
                    <div
                      className={`w-full h-full rounded-xl border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer relative ${
                        url
                          ? "border-none"
                          : "border-2 border-dashed border-gray-300 hover:border-blue-300"
                      } `}
                    >
                      {url ? (
                        <>
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full rounded-xl object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center rounded-xl justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <Trash2 className="w-8 h-8 text-white hover:scale-125 transition-all duration-300 ease-in-out" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className=" flex items-center justify-center cursor-pointer">
                          <CloudUpload className="w-10 h-10 text-gray-400 hover:text-blue-500 hover:scale-125 transition-all duration-300 ease-in-out" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(event) =>
                              handleImageChange(index, event)
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <div
                    className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 sm:w-48 sm:h-48 rounded-xl bg-gray-50 border-2 border-dashed 
                    border-gray-300 hover:border-blue-300 flex items-center justify-center"
                  >
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <span>
                        <Plus className="w-10 h-10 text-gray-400 hover:text-blue-500 hover:scale-125 transition-all duration-300 ease-in-out" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-blue-300"
              placeholder="Type here"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl resize-none h-[200px]
              overflow-y-auto focus:outline-blue-300"
              placeholder="Write content here"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-blue-300"
              required
            >
              <option>Men</option>
              <option>Women</option>
              <option>Kids</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub Category
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-blue-300"
              required
            >
              {subCategoriesList.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Price
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-blue-300"
              placeholder="25"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Sizes
            </label>
            <div className="flex space-x-2 mt-3">
              {Object.keys(availableSizes).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`py-2 px-4 border text-sm transition-all duration-300 transform hover:-translate-y-1 mb-6 ${
                    availableSizes[size]
                      ? "bg-gray-900 hover:bg-gray-800 text-white border-gray-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 flex justify-end space-x-4 mt-6">
          <button
            className="px-6 py-2 rounded-lg border shadow-md hover:shadow-lg text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-200 
            hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className={`px-8 py-2 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ease-in-out ${
              isChanged
                ? "bg-gray-900 hover:bg-gray-800 text-white transform hover:-translate-y-1"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-200 hover:border-gray-300 cursor-not-allowed"
            }`}
            type="submit"
            disabled={!isChanged}
          >
            Save
          </button>
        </div>
      </form>
      <ToastContainer />
      {isSaving && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}

      {isCropModalOpen && currentCropImage && (
        <CropModal
          imageSrc={currentCropImage}
          onCropComplete={handleCropComplete}
          onClose={() => setIsCropModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EditItem;
