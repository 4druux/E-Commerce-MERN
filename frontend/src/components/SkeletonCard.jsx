import React from "react";

const SkeletonCard = () => {
  return (
    <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div
        className="relative overflow-hidden"
        style={{ paddingTop: "120%", maxWidth: "100%" }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100" />
      </div>
      <div className="p-4">
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
