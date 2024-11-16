import React from "react";

const SkeletonUserOrders = () => {
  return (
    <div className="py-4 my-5 border-t border-b text-gray-700 animate-pulse flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-4">
        {/* Product Image Skeleton */}
        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded"></div>

        {/* Product Details Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-100 rounded w-32"></div>{" "}
          {/* Product Name */}
          <div className="flex gap-3 items-center">
            <div className="h-4 bg-gray-100 rounded w-12"></div> 
            <div className="h-4 bg-gray-100 rounded w-8"></div> 
            <div className="h-4 bg-gray-100 rounded w-12"></div> 
          </div>
          <div className="h-4 bg-gray-100 rounded w-24 mt-1"></div> 
        </div>
      </div>

      {/* Order Status and View Details Button Skeleton */}
      <div className="flex gap-4 md:w-1/2 justify-between items-center">
        <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
        <div className="h-8 w-24 bg-gray-100 rounded"></div>{" "}
      </div>
    </div>
  );
};

export default SkeletonUserOrders;
