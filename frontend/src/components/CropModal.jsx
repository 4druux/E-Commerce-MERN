import React, { useState } from "react";
import Cropper from "react-easy-crop";
import PropTypes from "prop-types";
import { getCroppedImg } from "../utils/cropImage";
import { FaTimes } from "react-icons/fa";

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
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border shadow-lg w-full max-w-2xl min-h-[70vh] p-4 sm:p-6 flex flex-col animate-fade-in mx-4 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Crop Image</h2>
          <button onClick={onClose} className="focus:outline-none">
            <FaTimes className="w-6 h-6 text-gray-700 hover:rotate-90 transtion-all duration-300 ease-in-out" />
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
            className="px-6 py-2 rounded-lg border shadow-md hover:shadow-lg text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-200 
            hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gray-900 hover:bg-gray-800 text-white transform hover:-translate-y-1 px-8 py-2 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
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
