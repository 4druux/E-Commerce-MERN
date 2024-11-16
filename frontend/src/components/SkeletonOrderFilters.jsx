import React from "react";

const SkeletonOrderFilters = () => {
  return (
    <div className="my-6">
      <div className="block md:hidden mb-6">
        <div className="w-full h-10 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <div className="hidden md:flex gap-2 justify-center whitespace-nowrap">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonOrderFilters;
