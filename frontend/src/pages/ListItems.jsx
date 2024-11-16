import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { useNavigate, Link } from "react-router-dom";
import SkeletonListItem from "../components/SkeletonListItem";
import ReactPaginate from "react-paginate";
import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";
import SweetAlert from "../components/SweetAlert";

const ListItems = () => {
  const { products, deleteProduct } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("terbaru");
  const [showFilter, setShowFilter] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    if (products.length > 0) {
      let filtered = [...products];

      if (category.length > 0) {
        filtered = filtered.filter((product) =>
          category.includes(product.category)
        );
      }

      if (subCategory.length > 0) {
        filtered = filtered.filter((product) =>
          subCategory.includes(product.subCategory)
        );
      }

      if (sortType === "terbaru") {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortType === "terlama") {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      setFilteredProducts(filtered);
    }

    setIsLoading(false);
  }, [products, category, subCategory, sortType]);

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

  const indexOfLastProduct = (currentPage + 1) * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

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

  const openDeleteModal = (productId) => {
    SweetAlert({
      title: "Delete Confirmation",
      message: "Are you sure you want to delete this product?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeOnClickOutside: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        setIsDeleting(true);
        await deleteProduct(productId);
        setIsDeleting(false);

        SweetAlert({
          title: "Product Deleted",
          message: "The product has been successfully deleted.",
          icon: "success",
          buttons: true,
          closeOnClickOutside: true,
        });
      }
    });
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
      <div className="mb-6 text-2xl">
        <Title text1={"LIST"} text2={"ITEMS"} />
      </div>

      {/* Filter and Sort */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`border px-5 py-3 text-sm ${
              showFilter ? "font-bold border-black" : ""
            }`}
          >
            Filters
          </button>
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border px-5 py-3 text-sm cursor-pointer focus:outline-none"
          >
            <option value="terbaru">Sort by: Terbaru</option>
            <option value="terlama">Sort by: Terlama</option>
          </select>
        </div>
      </div>

      {showFilter && (
        <div className=" mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div className="border border-gray-300 rounded-lg shadow-sm p-6 bg-white">
              <p className="text-base font-semibold mb-4 text-gray-800">
                CATEGORIES
              </p>
              <div className="grid grid-cols-1 gap-3 text-sm font-light text-gray-700">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Men"
                    onChange={toggleCategory}
                    checked={category.includes("Men")}
                    className="mr-2 accent-gray-800"
                  />
                  Men
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Women"
                    onChange={toggleCategory}
                    checked={category.includes("Women")}
                    className="mr-2 accent-gray-800"
                  />
                  Women
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Kids"
                    onChange={toggleCategory}
                    checked={category.includes("Kids")}
                    className="mr-2 accent-gray-800"
                  />
                  Kids
                </label>
              </div>
            </div>

            {/* Type */}
            <div className="border border-gray-300 rounded-lg shadow-sm p-6 bg-white">
              <p className="text-base font-semibold mb-4 text-gray-800">TYPE</p>
              <div className="grid grid-cols-1 gap-3 text-sm font-light text-gray-700">
                {subCategoriesList.map((subCategoryItem) => (
                  <label key={subCategoryItem} className="flex items-center">
                    <input
                      type="checkbox"
                      value={subCategoryItem}
                      onChange={toggleSubCategory}
                      checked={subCategory.includes(subCategoryItem)}
                      className="mr-2 accent-gray-800"
                    />
                    {subCategoryItem}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <SkeletonListItem key={index} />
            ))
          : currentProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg p-4 lg:hover:shadow-2xl transition-transform duration-300 transform items-start"
              >
                <div className="w-full sm:w-1/3 flex items-start justify-center">
                  <img
                    src={product.image && product.image[0]}
                    alt={product.name}
                    className="object-cover rounded-md w-40 h-auto md:w-40 md:h-40 lg:w-48 lg:h-48 sm:w-48 sm:h-48"
                    style={{ objectFit: "contain", objectPosition: "center" }}
                  />
                </div>

                <div className="flex flex-col justify-between mt-4 sm:mt-0 sm:ml-6 w-full">
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600 mt-2">{product.description}</p>
                    <p className="text-gray-600 mt-2">
                      <strong>Category:</strong> {product.category}
                    </p>
                    <p className="text-gray-600 mt-2">
                      <strong>Sub Category:</strong> {product.subCategory}
                    </p>
                    <p className="text-gray-600 mt-2">
                      <strong>Price:</strong> Rp
                      {formatPrice(product.price || 0)}
                    </p>
                    <p className="text-gray-600 mt-2">
                      <strong>Sizes:</strong>{" "}
                      {product.sizes
                        .sort(
                          (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
                        )
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <Link
                      to={`/admin/reviews/${product._id}`}
                      className="border border-black px-4 py-2 rounded-md hover:bg-black transition-all duration-500 group"
                    >
                      <img
                        src={assets.review_icon}
                        alt="Reviews"
                        className="w-6 h-6 filter group-hover:invert contrast-200 brightness-200"
                      />
                    </Link>
                    <button
                      onClick={() => handleEdit(product._id)}
                      className="border border-black px-4 py-2 rounded-md hover:bg-black transition-all duration-500 group"
                    >
                      <img
                        src={assets.edit_icon}
                        alt="Edit"
                        className="w-6 h-6 filter group-hover:invert"
                      />
                    </button>
                    <button
                      onClick={() => openDeleteModal(product._id)}
                      className="bg-black px-4 py-2 rounded-md active:bg-gray-800"
                    >
                      <img
                        src={assets.recycle_bin}
                        alt="Delete"
                        className="w-6 h-6 filter invert contrast-200 brightness-200"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {isDeleting && (
        <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
        </div>
      )}

      <div className="flex justify-center my-8">
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={Math.ceil(filteredProducts.length / productsPerPage)}
          marginPagesDisplayed={1}
          pageRangeDisplayed={1}
          onPageChange={handlePageClick}
          containerClassName={"flex space-x-2 md:space-x-4"}
          pageClassName={
            "relative px-2 py-1 md:px-4 md:py-2 border rounded-md cursor-pointer text-sm md:text-base"
          }
          previousClassName={`relative px-2 py-1 md:px-4 md:py-2 border rounded-md ${
            currentPage === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
              : "bg-white text-sm md:text-base hover:bg-gray-200 transition-all duration-300 cursor-pointer"
          }`}
          nextClassName={`relative px-2 py-1 md:px-4 md:py-2 border rounded-md ${
            currentPage ===
            Math.ceil(filteredProducts.length / productsPerPage) - 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
              : "bg-white text-sm md:text-base hover:bg-gray-200 transition-all duration-300 cursor-pointer"
          }`}
          breakClassName={
            "relative px-2 py-1 md:px-4 md:py-2 border rounded-md bg-white hover:bg-gray-200 cursor-pointer text-sm md:text-base"
          }
          activeClassName={" bg-black text-white"}
          disabledClassName={
            "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
          }
        />
      </div>
    </div>
  );
};

export default ListItems;
