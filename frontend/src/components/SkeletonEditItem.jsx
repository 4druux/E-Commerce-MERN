import React from "react";

const SkeletonEditItem = () => {
  return (
    <div className="space-y-4 bg-white p-6 shadow-md rounded-md animate-pulse">
      {/* Image Upload Section */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Upload Image
        </label>
        <div className="flex flex-wrap gap-4">
          <div className="w-32 h-32 bg-gray-100 rounded"></div>
          <div className="w-32 h-32 bg-gray-100 rounded"></div>
          <div className="w-32 h-32 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Product Name */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
      </div>

      {/* Product Description */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Description
        </label>
        <div className="h-20 bg-gray-100 rounded w-full"></div>
      </div>

      {/* Product Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Category
          </label>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>

        {/* Sub Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sub Category
          </label>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>
      </div>

      {/* Product Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Price
        </label>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
      </div>

      {/* Product Sizes */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Sizes
        </label>
        <div className="flex space-x-2">
          <div className="w-10 h-10 bg-gray-100 rounded"></div>
          <div className="w-10 h-10 bg-gray-100 rounded"></div>
          <div className="w-10 h-10 bg-gray-100 rounded"></div>
          <div className="w-10 h-10 bg-gray-100 rounded"></div>
          <div className="w-10 h-10 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Bestseller Checkbox */}
      <div className="col-span-2 flex items-center">
        <div className="h-4 w-4 bg-gray-100 rounded mr-2"></div>
        <label className="text-sm text-gray-700">Add to bestseller</label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <div className="h-10 bg-gray-100 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-24"></div>
      </div>
    </div>
  );
};

export default SkeletonEditItem;
