import React from "react";

const SkeletonOrders = () => {
  return (
    <div className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg p-4 animate-pulse mb-4">
      <div className="w-full flex-1">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3"></div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:text-right">
            <div className="h-8 w-24 bg-gray-100 rounded mt-2"></div>
          </div>
          <div className="absolute top-0 right-0  mr-2">
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 py-2">
            <div className="w-16 h-16 bg-gray-100 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center border-t pt-4 space-y-4 md:space-y-0">
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          <div className="h-6 bg-gray-100 rounded-full w-24"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonOrders;
