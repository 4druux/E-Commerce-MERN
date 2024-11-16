import React from "react";

const SkeletonListItem = () => {
  return (
    <div className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg p-4 animate-pulse">
      <div className="w-full sm:w-1/3 flex items-start justify-center">
        <div className="bg-gray-100 rounded-md w-40 h-40 sm:w-48 sm:h-48"></div>
      </div>
      <div className="flex flex-col justify-between mt-4 sm:mt-0 sm:ml-6 w-full">
        <div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <div className="w-8 h-8 bg-gray-100 rounded"></div>
          <div className="w-8 h-8 bg-gray-100 rounded"></div>
          <div className="w-8 h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonListItem;
