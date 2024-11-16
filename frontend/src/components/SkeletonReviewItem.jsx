import React from "react";

const SkeletonReviewItem = () => {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-0 max-w-6xl mx-auto animate-pulse">
      <div className="border p-6 rounded-lg shadow-md bg-white mb-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0">
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
          <div className="bg-gray-100 w-full h-64 rounded-lg"></div>
        </div>

        <div className="flex flex-col space-y-4 w-full">
          <div className="bg-gray-100 h-6 rounded-md w-3/4"></div>
          <div className="bg-gray-100 h-4 rounded-md w-1/2"></div>
          <div className="bg-gray-100 h-4 rounded-md w-1/4"></div>
          <div className="space-y-4">
            <div className="bg-gray-100 h-4 rounded-md w-1/2"></div>
            <div className="bg-gray-100 h-4 rounded-md w-1/3"></div>
            <div className="bg-gray-100 h-4 rounded-md w-1/4"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end w-full mb-4">
        <div className="bg-gray-100 h-8 w-24 rounded-md"></div>
      </div>

      <div className="space-y-6">
        {Array(2)
          .fill()
          .map((_, index) => (
            <div
              key={index}
              className="border p-6 rounded-md shadow-lg bg-white flex flex-col justify-between items-start transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-col space-y-2 w-full">
                <div className="bg-gray-100 h-5 w-1/4 rounded-md"></div>
                <div className="bg-gray-100 h-4 w-1/3 rounded-md"></div>
                <div className="bg-gray-100 h-4 w-1/2 rounded-md"></div>
                <div className="bg-gray-100 h-3 w-1/4 rounded-md"></div>

                <div className="flex gap-2 mt-2">
                  {Array(2)
                    .fill()
                    .map((_, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="w-24 h-24 bg-gray-100 rounded-md"
                      ></div>
                    ))}
                </div>

                <div className="bg-gray-100 h-3 w-1/6 rounded-md mt-2"></div>
              </div>

              <div className="flex justify-end items-center space-x-2 mt-4 w-full">
                <div className="bg-gray-100 h-8 w-12 rounded"></div>
                <div className="bg-gray-100 h-8 w-12 rounded"></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SkeletonReviewItem;
