import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { useNavigate, Link } from "react-router-dom";
import SkeletonListItem from "../components/SkeletonListItem";
import ReactPaginate from "react-paginate";
import { formatPrice } from "../utils/formatPrice";
import SweetAlert from "../components/SweetAlert";
import {
  SquarePen,
  Star,
  Trash2,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  Search,
  X,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ListItems = () => {
  const { products, deleteProduct } = useContext(ShopContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  const [search, setSearch] = useState("");
  const showSearch = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("terbaru");
  const [showFilter, setShowFilter] = useState(false);

  const navigate = useNavigate();

  const dropdownSortRef = useRef(null);
  const [isDropdownSortOpen, setIsDropdownSortOpen] = useState(false);

  const openDeleteModal = (productId) => {
    setIsOverlay(true);
    SweetAlert({
      title: "Delete Confirmation",
      message: "Are you sure you want to delete this product?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeOnClickOutside: true,
    }).then(async (willDelete) => {
      setIsOverlay(false);
      if (willDelete) {
        setIsDeleting(true);
        await deleteProduct(productId);
        setIsDeleting(false);

        setIsOverlay(true);
        SweetAlert({
          title: "Product Deleted",
          message: "The product has been successfully deleted.",
          icon: "success",
          buttons: true,
          closeOnClickOutside: true,
        });
        setIsOverlay(false);
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownSortRef.current &&
        !dropdownSortRef.current.contains(event.target)
      ) {
        setIsDropdownSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDeleting || isOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDeleting, isOverlay]);

  const handleSortChange = (value) => {
    setSortType(value);
    setIsDropdownSortOpen(false);
  };

  useEffect(() => {
    if (products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category.length > 0) {
      filtered = filtered.filter((product) =>
        category.includes(product.category)
      );
    }

    // Apply subcategory filter
    if (subCategory.length > 0) {
      filtered = filtered.filter((product) =>
        subCategory.includes(product.subCategory)
      );
    }

    // Apply sorting
    if (sortType === "terbaru") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortType === "terlama") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filtered;
  }, [products, search, category, subCategory, sortType]);

  const currentProducts = useMemo(() => {
    const indexOfLastProduct = (currentPage + 1) * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);

  const handleEdit = (productId) => {
    navigate(`/admin/edit/${productId}`);
  };

  // Toggle Category Filter
  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Toggle SubCategory Filter
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const sizeOrder = ["S", "M", "L", "XL", "XXL"];

  const handlePageClick = (data) => {
    const newPage = data.selected;
    setCurrentPage(newPage);
    setTimeout(() => {
      window.scrollTo({
        top: 50,
        behavior: "smooth",
      });
    }, 0);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const inputVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const sortOptions = [
    { value: "terbaru", label: "Newest" },
    { value: "terlama", label: "Oldest" },
  ];

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

  const subCategoriesList = [
    "Jackets",
    "Hoodies",
    "Sweaters",
    "Long Sleeve Shirts",
    "T-Shirts",
    "Pants",
    "Skirts",
    "Dresses",
  ];

  return (
    <div>
      <div className="sm:mb-12 mb-4 flex flex-col sm:flex-row justify-between sm:gap-0 gap-3 text-2xl">
        <Title text1={"PRODUCT"} text2={"MANAGEMENT"} />

        {/* Search Input */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="w-full sm:w-auto border border-gray-400 px-3 py-2 rounded-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex items-center w-full sm:w-[300px] h-5">
                <motion.div
                  className="flex items-center flex-grow h-full"
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full outline-none bg-inherit text-sm"
                    type="text"
                    placeholder="Search orders..."
                  />

                  {search && (
                    <button
                      onClick={handleClearSearch}
                      className="hover:bg-slate-100 rounded-full p-1 mr-1"
                    >
                      <X
                        className="w-5 cursor-pointer text-gray-700 hover:text-gray-900"
                        alt="Clear search"
                      />
                    </button>
                  )}
                </motion.div>

                <div className="border-l-2 pl-2">
                  <Search
                    className="w-5 text-gray-700 cursor-pointer"
                    alt="Search"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter and Sort */}
      <div className="flex justify-end items-center mb-6 space-x-4">
        {/* Filter Button */}
        <div
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center rounded-full space-x-2 px-6 py-2 transition-all border cursor-pointer ${
            showFilter ? "font-semibold border-black" : " border "
          }`}
        >
          <span>Filters</span>
        </div>

        {/* Sort Dropdown */}

        <div className="relative" ref={dropdownSortRef}>
          <motion.div
            onClick={() => setIsDropdownSortOpen(!isDropdownSortOpen)}
            whileTap={{ scale: 0.95 }}
            className="border rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer flex items-center justify-between transition-all duration-300 ease-in-out"
          >
            {sortOptions.find((option) => option.value === sortType).label}
            <motion.svg
              animate={{ rotate: isDropdownSortOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-3 h-3 ml-2"
              viewBox="0 0 20 20"
            >
              <ChevronDown />
            </motion.svg>
          </motion.div>

          <AnimatePresence>
            {isDropdownSortOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute z-20 w-24 bg-white border rounded-xl border-gray-300 mt-1 shadow-lg overflow-hidden"
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

      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { duration: 0.5 },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: { duration: 0.5 },
            }}
            className="mb-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories Filter */}
              <motion.div
                initial={{ x: -70, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="border rounded-2xl p-6"
              >
                <h3 className="text-lg  mb-4 text-gray-800">Categories</h3>
                <div className="space-y-3">
                  {["Men", "Women", "Kids"].map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={cat}
                        onChange={toggleCategory}
                        checked={category.includes(cat)}
                        className="w-4 h-4 accent-gray-800 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Subcategories Filter */}
              <motion.div
                initial={{ x: 70, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="border rounded-2xl p-6"
              >
                <h3 className="text-lg  mb-4 text-gray-800">Subcategories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {subCategoriesList.map((subCat) => (
                    <label
                      key={subCat}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={subCat}
                        onChange={toggleSubCategory}
                        checked={subCategory.includes(subCat)}
                        className="w-4 h-4 accent-gray-800 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{subCat}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 gap-y-6">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <SkeletonListItem key={index} />
          ))
        ) : currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div
              key={product._id}
              className="relative group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:border hover:border-gray-300"
            >
              {/* Gambar dan Kategori */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image && product.image[0]}
                  alt={product.name}
                  className="object-cover w-full transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/80 rounded-full px-3 py-1 text-xs font-medium shadow-md">
                  {product.category}
                </div>
              </div>

              {/* Informasi Produk */}
              <div className="p-2 md:p-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-base font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm md:line-clamp-2 line-clamp-1 mt-1 flex-grow">
                    {product.description}
                  </p>

                  {/* Subcategory dan Detail Produk */}
                  <div className="mt-2">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between items-center">
                        <h3 className="text-gray-900 text-xs sm:text-sm font-medium">
                          Sub Category:
                        </h3>
                        <span className="text-xs sm:text-sm">
                          {product.subCategory}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-gray-900 text-xs sm:text-sm font-medium">
                          Price:
                        </h3>
                        <span className="text-xs sm:text-sm">
                          Rp{formatPrice(product.price || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-gray-900 text-xs sm:text-sm font-medium">
                          Sizes:
                        </h3>
                        <span className="text-xs sm:text-sm">
                          {product.sizes
                            .sort(
                              (a, b) =>
                                sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
                            )
                            .join(", ")}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Stock: {product.stock || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center border-t pt-1 md:pt-3 mt-1 md:mt-3">
                  <div className="flex md:space-x-2">
                    <button
                      onClick={() => handleEdit(product._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <SquarePen className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>

                    <Link
                      to={`/admin/reviews/${product._id}`}
                      className="p-2 rounded-full hover:bg-orange-50 transition-colors"
                    >
                      <Star className="w-5 h-5 text-orange-400 hover:text-orange-500" />
                    </Link>

                    <button
                      onClick={() => openDeleteModal(product._id)}
                      className="p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-600" />
            <p className="mt-4 text-gray-500">No products found.</p>
          </div>
        )}
      </div>

      {isDeleting && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}

      {isOverlay && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"></div>
      )}

      {!search && currentProducts.length > 0 && (
        <div className="flex justify-center my-8">
          <ReactPaginate
            previousLabel={
              <div className="flex items-center space-x-2">
                <ChevronsLeft className="w-6 h-6 text-gray-700" />
              </div>
            }
            nextLabel={
              <div className="flex items-center space-x-2">
                <ChevronsRight className="w-6 h-6 text-gray-700" />
              </div>
            }
            breakLabel={"..."}
            pageCount={Math.ceil(filteredProducts.length / productsPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={1}
            onPageChange={handlePageClick}
            containerClassName={
              "flex items-center space-x-1 md:space-x-4 border p-2 rounded-full shadow-md"
            }
            pageClassName={` relative w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-medium 
            transition-all duration-300 hover:-translate-y-1 `}
            previousClassName={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300"
            }`}
            nextClassName={` flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentPage ===
              Math.ceil(filteredProducts.length / productsPerPage) - 1
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300"
            } `}
            breakClassName={"px-3 py-2 text-gray-500 select-none"}
            activeClassName={"bg-gray-800 text-white shadow-md scale-105"}
            pageLinkClassName={` absolute inset-0 flex items-center justify-center`}
            disabledClassName={"opacity-50 cursor-not-allowed"}
            renderOnZeroPageCount={null}
          />
        </div>
      )}
    </div>
  );
};

export default ListItems;
