import React from "react";

const SkeletonProduct = () => {
  return (
    <div className="animate-pulse border-t-2 pt-10">
      <div className="flex flex-col lg:flex-row gap-12">
        
        <div className="flex-1 flex flex-col-reverse lg:flex-row gap-3">
          {/* Thumbnail images skeleton */}
          <div className="flex lg:flex-col gap-1 lg:w-[18.7%] w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 w-[24%] lg:w-full h-20 lg:mb-3 rounded-sm"></div>
            ))}
          </div>
          
          {/* Main image skeleton */}
          <div className="w-full lg:w-[80%]">
            <div className="bg-gray-100 w-full h-96 rounded-sm"></div>
          </div>
        </div>

        {/* Skeleton Text and Options Section */}
        <div className="flex-1">
          {/* Product name skeleton */}
          <div className="bg-gray-100 h-8 w-3/4 mb-4 rounded"></div>
          
          {/* Rating skeleton */}
          <div className="bg-gray-100 h-6 w-1/4 mb-4 rounded"></div>
          
          {/* Price skeleton */}
          <div className="bg-gray-100 h-10 w-1/2 mb-8 rounded"></div>

          {/* Size Options skeleton */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-100 w-16 h-10 rounded"></div>
            ))}
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-4 lg:w-full lg:max-w-[400px]">
            <div className="bg-gray-100 h-12 w-1/2 rounded"></div>
            <div className="bg-gray-100 h-12 w-1/2 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProduct;
