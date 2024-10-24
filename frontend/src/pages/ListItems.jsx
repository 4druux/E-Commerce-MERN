import React, { useState, useEffect } from "react";
import axios from "axios";
import Title from "../components/Title";
import { useNavigate, Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { assets } from "../assets/assets";
import { formatPrice } from "../utils/formatPrice";

const ListItems = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(20);

  // Pertahankan fungsi yang diminta
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("terbaru");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://ecommerce-backend-ebon-six.vercel.app/api/products/all"
        );
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Gagal mendapatkan produk", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
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
  }, [products, category, subCategory, sortType]);

  const openDeleteModal = (productId) => {
    setProductToDelete(productId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setProductToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://ecommerce-backend-ebon-six.vercel.app/api/products/${productToDelete}`
      );
      setProducts(
        products.filter((product) => product._id !== productToDelete)
      );
      closeModal();
    } catch (error) {
      console.error(
        "Gagal menghapus produk",
        error.response?.data || error.message
      );
    }
  };

  const handleEdit = (productId) => {
    navigate(`/admin/edit/${productId}`);
  };

  // Toggle Category Filter
  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory(
      (prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value) // Uncheck jika sudah ada
          : [...prev, value] // Tambahkan jika belum ada
    );
  };

  // Toggle SubCategory Filter
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory(
      (prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value) // Uncheck jika sudah ada
          : [...prev, value] // Tambahkan jika belum ada
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
            className="border border-gray-500 text-sm px-4 py-2 rounded-md focus:outline-none focus:border-gray-500 hover:bg-black hover:text-white transition-all duration-300"
          >
            Filters
          </button>
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border border-gray-500 text-sm px-2 py-2 rounded-md cursor-pointer focus:outline-none focus:border-gray-500"
          >
            <option value="terbaru">Sort by: Terbaru</option>
            <option value="terlama">Sort by: Terlama</option>
          </select>
        </div>
      </div>

      {showFilter && (
        <div className="p-4 mb-6">
          <div className="flex gap-6">
            <div className="border border-gray-300 p-4 flex-1">
              <p className="text-sm font-medium">CATEGORIES</p>
              <div className="flex flex-col gap-2 mt-2 text-sm font-light text-gray-700">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Men"
                    onChange={toggleCategory}
                    checked={category.includes("Men")}
                    className="mr-2"
                  />
                  Men
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Women"
                    onChange={toggleCategory}
                    checked={category.includes("Women")}
                    className="mr-2"
                  />
                  Women
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Kids"
                    onChange={toggleCategory}
                    checked={category.includes("Kids")}
                    className="mr-2"
                  />
                  Kids
                </label>
              </div>
            </div>
            <div className="border border-gray-300 p-4 flex-1">
              <p className="text-sm font-medium">TYPE</p>
              <div className="flex flex-col gap-2 mt-2 text-sm font-light text-gray-700">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Topwear"
                    onChange={toggleSubCategory}
                    checked={subCategory.includes("Topwear")}
                    className="mr-2"
                  />
                  Topwear
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Bottomwear"
                    onChange={toggleSubCategory}
                    checked={subCategory.includes("Bottomwear")}
                    className="mr-2"
                  />
                  Bottomwear
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Winterwear"
                    onChange={toggleSubCategory}
                    checked={subCategory.includes("Winterwear")}
                    className="mr-2"
                  />
                  Winterwear
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg p-4 lg:hover:shadow-2xl transition-transform duration-300 transform  items-start"
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
                  <strong>Price:</strong> Rp{formatPrice(product.price || 0)}
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Sizes:</strong>{" "}
                  {product.sizes
                    .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b))
                    .join(", ")}
                </p>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => handleEdit(product._id)}
                  className="border border-black px-4 py-2 rounded-md hover:bg-black transition-all duration-500 group"
                >
                  <img
                    src={assets.exchange_icon}
                    alt=""
                    className="w-6 h-6 filter group-hover:invert"
                  />
                </button>
                <Link
                  to={`/admin/reviews/${product._id}`}
                  className="border border-black px-4 py-2 rounded-md hover:bg-black transition-all duration-500 group"
                >
                  <img
                    src={assets.review_icon}
                    alt=""
                    className="w-6 h-6 filter group-hover:invert contrast-200 brightness-200"
                  />
                </Link>
                <button
                  onClick={() => openDeleteModal(product._id)}
                  className="bg-black px-4 py-2 rounded-md active:bg-gray-800"
                >
                  <img
                    src={assets.recycle_bin}
                    alt=""
                    className="w-6 h-6 filter invert contrast-200 brightness-200"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Modal untuk menghapus produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">
              Konfirmasi Penghapusan
            </h2>
            <p>Apakah Anda yakin ingin menghapus produk ini?</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Hapus
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListItems;
