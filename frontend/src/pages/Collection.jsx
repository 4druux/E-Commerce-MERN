import React, { useContext, useEffect, useState, useMemo, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import SkeletonCard from "../components/SkeletonCard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Filter, Search } from "lucide-react";

const Collection = () => {
  const { search, showSearch, products } = useContext(ShopContext);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortOptions = [
    { value: "relavent", label: "Relevant" },
    { value: "best-seller", label: "Best Seller" },
    { value: "low-high", label: "Low to High" },
    { value: "high-low", label: "High to Low" },
  ];

  const handleSortChange = (value) => {
    setSortType(value);
    setIsDropdownOpen(false);
  };

  const toggleCategory = (e) => {
    setCategory((prev) =>
      prev.includes(e.target.value)
        ? prev.filter((item) => item !== e.target.value)
        : [...prev, e.target.value]
    );
  };

  const toggleSubCategory = (e) => {
    setSubCategory((prev) =>
      prev.includes(e.target.value)
        ? prev.filter((item) => item !== e.target.value)
        : [...prev, e.target.value]
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filteredProducts = products.slice();

    // Filter by search term
    if (showSearch && search) {
      filteredProducts = filteredProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category.length > 0) {
      filteredProducts = filteredProducts.filter((item) =>
        category.includes(item.category)
      );
    }

    // Filter by sub-category
    if (subCategory.length > 0) {
      filteredProducts = filteredProducts.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // Sorting the filtered products
    let sortedProducts;
    switch (sortType) {
      case "low-high":
        sortedProducts = filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        sortedProducts = filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "best-seller":
        // Urutkan berdasarkan soldCount
        sortedProducts = filteredProducts.sort(
          (a, b) => b.soldCount - a.soldCount
        );
        break;
      default:
        sortedProducts = filteredProducts;
    }

    // Tentukan produk top selling untuk ranking
    const topSellingProducts = [...products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3);

    // Add rank to products
    return sortedProducts.map((product) => {
      const rank =
        topSellingProducts.findIndex((p) => p._id === product._id) + 1;
      return {
        ...product,
        rank: rank > 0 ? rank : null,
      };
    });
  }, [products, search, showSearch, category, subCategory, sortType]);

  useEffect(() => {
    setLoading(true);

    if (filteredAndSortedProducts.length > 0) {
      setLoading(false);
    }
  }, [filteredAndSortedProducts]);

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

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileFilterOpen]);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-1 sm:gap-10 lg:pt-10 pt-2 border-t relative">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-8 left-0 bg-slate-800 px-2 py-2 rounded-r-full shadow-lg z-50"
      >
        <Filter className="w-5 h-5 text-white" />
      </button>

      {/* Filter Options Mobile*/}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setIsMobileFilterOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="fixed top-0 right-0 bottom-0 w-3/5 bg-white shadow-2xl rounded-l-3xl z-50 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex items-center gap-4 p-6 border-b border-gray-100 cursor-pointer group"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                  <p className="font-medium text-xl text-gray-700 group-hover:text-gray-900 transition-colors">
                    Filters
                  </p>
                </motion.div>

                {/* Filter Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex-grow p-6 space-y-6 overflow-y-auto"
                >
                  {/* Category Filter */}
                  <div className="border-b pb-4">
                    <p className="mb-3 text-sm font-medium uppercase text-gray-600">
                      CATEGORIES
                    </p>
                    <div className="space-y-3">
                      {["Men", "Women", "Kids"].map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-gray-700">{cat}</span>
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-black rounded accent-gray-800"
                            value={cat}
                            checked={category.includes(cat)}
                            onChange={() => {
                              setCategory((prev) =>
                                prev.includes(cat)
                                  ? prev.filter((item) => item !== cat)
                                  : [...prev, cat]
                              );
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subcategory Filter */}
                  <div className="border-b pb-4">
                    <p className="mb-3 text-sm font-medium uppercase text-gray-600">
                      TYPE
                    </p>
                    <div className="space-y-3">
                      {subCategoriesList.map((subCat) => (
                        <label
                          key={subCat}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-gray-700">{subCat}</span>
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-black rounded accent-gray-800"
                            value={subCat}
                            checked={subCategory.includes(subCat)}
                            onChange={() => {
                              setSubCategory((prev) =>
                                prev.includes(subCat)
                                  ? prev.filter((item) => item !== subCat)
                                  : [...prev, subCat]
                              );
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Footer / Apply Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 border-t border-gray-100"
                >
                  {(category.length > 0 || subCategory.length > 0) && (
                    <button
                      onClick={() => {
                        setCategory([]);
                        setSubCategory([]);
                      }}
                      className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl bg-gray-50 transition-colors"
                    >
                      Reset All
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Options Dekstop*/}
      <div className="min-w-60 hidden lg:block">
        <div className="lg:sticky top-24 space-y-5">
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="my-2 text-xl flex items-center"
          >
            FILTERS
            <ChevronDown
              className={`h-5 ml-1 text-gray-900 transition-all duration-300 ease-in-out lg:hidden ${
                showFilter ? "rotate-180" : ""
              }`}
              alt=""
            />
          </p>

          {/* Category Filter */}
          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden"
            } lg:block`}
          >
            <p className="mb-3 text-sm font-medium">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              <p className="flex gap-2">
                <input
                  className="w-3 accent-gray-800"
                  type="checkbox"
                  value={"Men"}
                  onChange={toggleCategory}
                />
                Men
              </p>
              <p className="flex gap-2">
                <input
                  className="w-3 accent-gray-800"
                  type="checkbox"
                  value={"Women"}
                  onChange={toggleCategory}
                />
                Women
              </p>
              <p className="flex gap-2">
                <input
                  className="w-3 accent-gray-800"
                  type="checkbox"
                  value={"Kids"}
                  onChange={toggleCategory}
                />
                Kids
              </p>
            </div>
          </div>
          {/* SubCategory Filter */}
          <div
            className={`border border-gray-300 pl-5 py-3 my-5 ${
              showFilter ? "" : "hidden"
            } lg:block`}
          >
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {subCategoriesList.map((subCategory) => (
                <p className="flex gap-2" key={subCategory}>
                  <input
                    className="w-3 accent-gray-800"
                    type="checkbox"
                    value={subCategory}
                    onChange={toggleSubCategory}
                  />
                  {subCategory}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between items-center text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          {/* Product Sort */}
          <div className="relative" ref={dropdownRef}>
            <motion.div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileTap={{ scale: 0.95 }}
              className="border rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer flex items-center justify-between transition-all duration-300 ease-in-out"
            >
              {sortOptions.find((option) => option.value === sortType).label}
              <motion.svg
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-3 h-3 ml-2"
                viewBox="0 0 20 20"
              >
                <ChevronDown />
              </motion.svg>
            </motion.div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute z-20 bg-white border rounded-xl border-gray-300 mt-1 shadow-lg overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <motion.div
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSortChange(option.value)}
                      className={`  
                        px-4 py-2 cursor-pointer text-sm hover:bg-slate-100
                        ${sortType === option.value ? option.activeClass : ""}  
                      `}
                    >
                      {option.label}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {showSearch && search && filteredAndSortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 h-96">
            <div className="flex items-center">
              <Search
                alt="Search Icon"
                className="w-8 h-8 text-gray-600 mr-2"
              />
              <p className="text-lg text-gray-600">No results found</p>
            </div>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 h-96">
            <p className="text-lg text-gray-600">
              No products found for this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  gap-2 gap-y-6">
            {loading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : filteredAndSortedProducts.map((item, index) => (
                  <ProductItem
                    key={index}
                    id={item._id}
                    image={item.image[0]}
                    name={item.name}
                    price={item.price}
                    reviews={item.reviews}
                    soldCount={item.soldCount}
                    rank={item.rank}
                  />
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
