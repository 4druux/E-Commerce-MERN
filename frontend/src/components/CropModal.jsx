import React, { useState } from "react";
import Cropper from "react-easy-crop";
import PropTypes from "prop-types";
import { getCroppedImg } from "../utils/cropImage";

const CropModal = ({ imageSrc, onCropComplete, onClose }) => {
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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl min-h-[70vh] p-4 sm:p-6 flex flex-col animate-fade-in mx-4 sm:mx-0"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Crop Image</h2>
          <button
            onClick={onClose}
            className="text-3xl text-gray-500 hover:text-gray-800 focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative flex-grow mt-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={500 / 550}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Zoom Controls */}
        <div className="mt-4">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-3">
              Zoom:
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg shadow-sm hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

CropModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CropModal;
