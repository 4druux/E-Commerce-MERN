import React, { useState, useContext, useEffect, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import SkeletonCard from "./SkeletonCard";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);

  const latestProducts = useMemo(() => {
    // Urutkan produk berdasarkan tanggal terbaru
    const sortedByDate = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Urutkan produk berdasarkan soldCount untuk menentukan rank
    const sortedBySales = [...products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3);

    // Map produk terbaru dengan rank berdasarkan soldCount
    return sortedByDate.map((product) => {
      // Cari rank berdasarkan soldCount
      const rank = sortedBySales.findIndex((p) => p._id === product._id) + 1;

      return {
        ...product,
        rank: rank > 0 ? rank : null, // Hanya beri rank jika masuk top 3 penjualan
      };
    });
  }, [products]);

  useEffect(() => {
    setLoading(!latestProducts.length);
  }, [latestProducts]);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"LATEST"} text2={"COLLECTIONS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet atque
          mollitia consequuntur.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-6">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : latestProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
                reviews={item.reviews}
                soldCount={item.soldCount}
                rank={item.rank}
              />
            ))}
      </div>
    </div>
  );
};

export default LatestCollection;
