import React, { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import SkeletonCard from "../components/SkeletonCard";

const Collection = () => {
  const { search, showSearch, products } = useContext(ShopContext);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col lg:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center "
        >
          FILTERS
          <img
            src={assets.dropdown_icon}
            className={`h-3 ml-2 lg:hidden ${showFilter ? "rotate-90" : ""}`}
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

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border border-gray-300 text-sm px-2 cursor-pointer focus:outline-none"
          >
            <option value="relavent">Sort by: Relavent</option>
            <option value="best-seller">Sort by: Best Seller</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {showSearch && search && filteredAndSortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 h-96">
            <div className="flex items-center">
              <img
                src={assets.search_icon}
                alt="Search Icon"
                className="w-6 h-6 mr-2"
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
