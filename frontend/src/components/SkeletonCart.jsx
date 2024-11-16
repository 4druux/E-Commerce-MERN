import React from "react";

const SkeletonCart = () => {
  return (
    <div className="relative py-4 border-t border-b text-gray-700 animate-pulse">
      <div className="grid grid-cols-[0.5fr_4fr_auto_0.5fr] sm:grid-cols-[0.5fr_4fr_2fr_0.5fr] items-center gap-4">
        <div className="w-4 h-4 bg-gray-100 rounded"></div>
        <div className="flex items-start gap-6">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded"></div>
          <div className="flex flex-col justify-center w-full">
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="mt-2 px-2 py-1 border bg-gray-100 rounded w-12"></div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <div className="w-8 h-8 bg-gray-100 rounded"></div>
          <div className="w-10 h-8 bg-gray-100 rounded"></div>
          <div className="w-8 h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-14 flex items-center justify-center">
        <div className="w-5 h-5 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCart;
