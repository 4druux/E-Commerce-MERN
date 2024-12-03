import React, { useState } from "react";
import Cropper from "react-easy-crop";
import PropTypes from "prop-types";
import { getCroppedImg } from "../utils/cropImage";
import { FaTimes } from "react-icons/fa";

const ModalCrop = ({ imageSrc, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage); // Send cropped result to parent
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] backdrop-blur-sm p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl min-h-[80vh] max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-100 hover:scale-[1.01]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Elegant Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Crop Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900 focus:outline-none transition-all duration-300 hover:rotate-90"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Crop Area with Enhanced Styling */}
        <div className="relative flex-grow p-6 bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 -z-10"></div>
          <div className="w-full h-full  rounded-2xl overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={500 / 550}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              classes={{
                containerClassName: "w-full h-full",
                mediaClassName: "rounded-xl",
              }}
            />
          </div>
        </div>

        {/* Zoom Controls with Modern Styling */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="flex-grow appearance-none bg-gray-200 h-2 rounded-full   
                cursor-pointer   
                [&::-webkit-slider-thumb]:appearance-none   
                [&::-webkit-slider-thumb]:h-4   
                [&::-webkit-slider-thumb]:w-4   
                [&::-webkit-slider-thumb]:bg-gray-900   
                [&::-webkit-slider-thumb]:rounded-full   
                [&::-webkit-slider-thumb]:shadow-lg  
                hover:[&::-webkit-slider-thumb]:bg-gray-800"
            />
          </div>
        </div>

        {/* Footer Buttons with Enhanced Interaction */}
        <div className="bg-white px-6 py-4 border-t border-gray-300 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-50 text-gray-900 rounded-md border hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gray-900 text-white rounded-md transition-all duration-300 transform hover:-translate-y-1"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );
};

ModalCrop.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalCrop;
