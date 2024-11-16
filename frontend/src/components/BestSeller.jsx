import React, { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import SkeletonCard from "./SkeletonCard";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);

  const bestSeller = useMemo(() => {
    return products.filter((item) => item.bestseller).slice(0, 5);
  }, [products]);

  useEffect(() => {
    setLoading(true);
    if (bestSeller.length) setLoading(false);
  }, [bestSeller]);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"BEST"} text2={"SELLER"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Similique
          deserunt aliquam voluptate.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : bestSeller.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))}
      </div>
    </div>
  );
};

export default BestSeller;
