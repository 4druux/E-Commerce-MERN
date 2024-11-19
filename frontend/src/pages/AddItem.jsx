import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice, unformatPrice } from "../utils/formatPrice";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import CropModal from "../components/CropModal";

const AddItem = () => {
  const [images, setImages] = useState([null]);
  const [imageURLs, setImageURLs] = useState([null]);
  const [availableSizes, setAvailableSizes] = useState({
    S: false,
    M: false,
    L: false,
    XL: false,
    XXL: false,
  });

  const navigate = useNavigate();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [cropIndex, setCropIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Men",
    subCategory: "Jackets",
    sizes: [],
    bestseller: false,
  });

  useEffect(() => {
    if (isCropModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCropModalOpen]);

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
  };

  const handleAddImage = () => {
    if (images.length < 5) {
      setImages([...images, null]);
      setImageURLs([...imageURLs, null]);
    }
  };

  const handleSizeToggle = (size) => {
    setAvailableSizes((prevSizes) => ({
      ...prevSizes,
      [size]: !prevSizes[size],
    }));

    setFormData((prevState) => ({
      ...prevState,
      sizes: prevState.sizes.includes(size)
        ? prevState.sizes.filter((s) => s !== size)
        : [...prevState.sizes, size],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "description" &&
      e.nativeEvent.inputType === "insertLineBreak"
    ) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: `${prevState[name]}\n`,
      }));
    } else {
      let formattedValue = value;

      if (name === "price") {
        if (value === "") {
          formattedValue = "";
        } else {
          formattedValue = formatPrice(value.replace(/^0+/, ""));
        }
      }

      setFormData((prevState) => ({
        ...prevState,
        [name]: formattedValue,
      }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const imagePromises = images
        .filter(Boolean)
        .map((image) => convertToBase64(image));
      const imageUrls = await Promise.all(imagePromises);

      await axios.post("https://ecommerce-backend-ebon-six.vercel.app/api/products/add", {
        ...formData,
        price: unformatPrice(formData.price),
        image: imageUrls,
      });

      toast.success("Product added successfully!", {
        position: "top-right",
        autoClose: 3000,
        className: "custom-toast",
      });

      setTimeout(() => {
        setIsLoading(false);
        navigate("/admin/list");
      }, 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product", {
        position: "top-right",
        className: "custom-toast",
      });
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const checkFormValidity = () => {
      const { name, description, price, category, subCategory, sizes } =
        formData;
      const numericPrice = unformatPrice(price);

      return (
        name.trim() !== "" &&
        description.trim() !== "" &&
        numericPrice > 0 &&
        category.trim() !== "" &&
        subCategory.trim() !== "" &&
        sizes.length > 0 &&
        images.some((image) => image !== null)
      );
    };

    setIsFormValid(checkFormValidity());
  }, [formData, images]);

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

  return (
    <div>
      <div className="mb-6 text-2xl ">
        <Title text1={"ADD"} text2={"ITEM"} />
      </div>
      <form
        className="space-y-4 bg-white p-6 shadow-md rounded-md"
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
                      <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-200">
                        {url ? (
                          <>
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="w-8 h-8"
                              >
                                <img
                                  src={assets.recycle_bin}
                                  alt="Remove"
                                  className="w-full h-full"
                                />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex items-center justify-center bg-gray-200 cursor-pointer">
                            <img
                              src={assets.upload_area}
                              alt="Upload area"
                              className="w-24 h-24 bg-gray-300 rounded-full object-cover"
                            />
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
                      <div className="relative w-full h-[400px] flex items-center justify-center border border-gray-300 bg-gray-100 cursor-pointer">
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="flex items-center justify-center w-full h-full"
                        >
                          <span className="text-5xl">+</span>
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
                    className="relative w-32 h-32 md:w-40 md:h-40  lg:w-48 lg:h-48 sm:w-48 sm:h-48"
                  >
                    <div className="w-full h-full border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer relative">
                      {url ? (
                        <>
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="w-8 h-8"
                            >
                              <img
                                src={assets.recycle_bin}
                                alt="Remove"
                                className="filter invert"
                              />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex items-center justify-center cursor-pointer">
                          <img src={assets.upload_area} alt="Upload area" />
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
                  <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 sm:w-48 sm:h-48 border border-gray-300 bg-gray-100 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <span>+</span>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  const { selectionStart, selectionEnd } = e.target;
                  const value = formData.description;

                  const newValue =
                    value.substring(0, selectionStart) +
                    "\n" +
                    value.substring(selectionEnd);

                  setFormData((prevState) => ({
                    ...prevState,
                    description: newValue,
                  }));

                  setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd =
                      selectionStart + 1;
                  }, 0);
                }

                if (e.key === "Tab") {
                  e.preventDefault();

                  const { selectionStart, selectionEnd } = e.target;
                  const value = formData.description;
                  const newValue =
                    value.substring(0, selectionStart) +
                    "\t" +
                    value.substring(selectionEnd);

                  setFormData((prevState) => ({
                    ...prevState,
                    description: newValue,
                  }));

                  setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd =
                      selectionStart + 1;
                  }, 0);
                }
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              style={{
                overflow: "hidden",
                resize: "none",
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Write content here"
              rows="2"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="25"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Sizes
            </label>
            <div className="flex space-x-2">
              {Object.keys(availableSizes).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`border py-2 px-4 bg-gray-100 rounded-md ${
                    availableSizes[size] ? "bg-gray-950 text-white" : ""
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2 flex items-center">
            <input
              id="bestseller"
              name="bestseller"
              type="checkbox"
              checked={formData.bestseller}
              onChange={(e) =>
                setFormData({ ...formData, bestseller: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="bestseller"
              className="ml-2 block text-sm text-gray-700"
            >
              Add to bestseller
            </label>
          </div>
        </div>
        <div className="col-span-2 flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            type="button"
            onClick={() => navigate(-1)} // Cancel button
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 rounded-md text-white ${
              isFormValid ? "bg-black" : "bg-gray-300 cursor-not-allowed"
            }`}
            type="submit"
            disabled={!isFormValid}
          >
            ADD
          </button>
        </div>
      </form>
      <ToastContainer />
      {isLoading && (
        <div className="fixed inset-0 bg-black opacity-50   flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
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

export default AddItem;
