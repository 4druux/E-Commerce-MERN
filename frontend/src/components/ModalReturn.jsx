import React from "react";
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
const ModalReturn = ({
  isReturnModalOpen,
  isLoading,
  isAlertActive,
  isReturnModalVisible,
  returnData,
  setReturnData,
  closeReturnModalWithAnimation,
  handleReturnImageUpload,
  confirmReturnOrder,
}) => {
  if (!isReturnModalOpen) return null;

  const MAX_WORDS = 300;

  const countWords = (text) => {
    const trimmedText = text.trim();
    if (trimmedText.length === 0) return 0;
    return trimmedText.length;
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0  flex items-center justify-center z-[60] backdrop-blur-sm transition-opacity duration-700 ease-in-out ${
        isReturnModalVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }  ${isLoading && isAlertActive ? "bg-transparent" : "bg-black/30"}`}
      onClick={(e) => {
        if (e.target.id === "modal-overlay") {
          closeReturnModalWithAnimation();
        }
      }}
    >
      <div
        className={`bg-white p-8 rounded-2xl shadow-xl max-w-xl 2xl:max-w-3xl w-full relative transform transition-all duration-700 ease-in-out ${
          isReturnModalVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full"
        } `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Return Confirmation
          </h3>
          <button
            onClick={closeReturnModalWithAnimation}
            className="text-gray-600 hover:text-gray-700 hover:rotate-90 transition-all duration-300"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Return Reason Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Reason for Return
          </label>
          <select
            value={returnData.reason}
            onChange={(e) =>
              setReturnData((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 transition duration-300"
          >
            <option value="">Select Return Reason</option>
            <option value="Damaged product">Damaged product</option>
            <option value="Product does not match description">
              Product does not match description
            </option>
            <option value="Dissatisfied with the product">
              Dissatisfied with the product
            </option>
            <option value="Wrong order">Wrong order</option>
          </select>
        </div>

        {/* Additional Description */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            placeholder={`Provide more detailed explanation for the return reason (Max ${MAX_WORDS} characters)`}
            value={returnData.description}
            onChange={(e) => {
              const inputValue = e.target.value;
              const charCount = countWords(inputValue);

              // Jika jumlah karakter tidak melebihi batas, update
              if (charCount <= MAX_WORDS) {
                setReturnData((prev) => ({
                  ...prev,
                  description: inputValue,
                }));
              } else {
                // Potong input jika melebihi batas
                const truncatedValue = inputValue.slice(0, MAX_WORDS);

                setReturnData((prev) => ({
                  ...prev,
                  description: truncatedValue,
                }));
              }
            }}
            className={`w-full p-3 border-2 rounded-xl focus:outline-none transition duration-300 resize-none h-32   
    placeholder:text-sm placeholder:text-gray-400 ${
      countWords(returnData.description) >= MAX_WORDS
        ? "border-red-300 focus:border-red-500"
        : "border-gray-200 focus:border-blue-300"
    }`}
          />

          {/* Character Counter */}
          <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
            {/* Error Message */}
            <div className="flex-grow">
              {countWords(returnData.description) >= MAX_WORDS && (
                <p className="text-xs text-red-500">
                  Maximum {MAX_WORDS} characters reached. Cannot add more text.
                </p>
              )}
            </div>
            <span className="text-right">
              {countWords(returnData.description)} / {MAX_WORDS}
            </span>
          </div>
        </div>

        {/* Image Upload for Return */}
        <div className="relative group/slider w-full mb-6">
          {/* Navigation Left - Hanya tampil di desktop */}
          {returnData.images.length > 3 && (
            <button
              onClick={() => {
                const container = document.getElementById(
                  "return-image-slider"
                );
                container.scrollBy({
                  left: -container.clientWidth / 2,
                  behavior: "smooth",
                });
              }}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-full w-10 h-10 items-center justify-center shadow-md border border-gray-100 hover:bg-white-90 hover:scale-105 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Navigation Right - Hanya tampil di desktop */}
          {returnData.images.length > 3 && (
            <button
              onClick={() => {
                const container = document.getElementById(
                  "return-image-slider"
                );
                container.scrollBy({
                  left: container.clientWidth / 2,
                  behavior: "smooth",
                });
              }}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-full w-10 h-10 items-center justify-center shadow-md border border-gray-100 hover:bg-white-90 hover:scale-105 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Slider Container */}
          <div
            id="return-image-slider"
            className="flex overflow-x-auto space-x-4 pb-4 scroll-smooth no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {returnData.images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 relative scroll-snap-align-center transition-all duration-300 hover:scale-105"
                style={{
                  scrollSnapAlign: "center",
                  width: "8rem",
                  height: "8rem",
                }}
              >
                <div className="w-full h-full border rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black rounded-lg bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-70 transition-opacity duration-300">
                    <button
                      type="button"
                      onClick={() =>
                        setReturnData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                      className="w-8 h-8"
                    >
                      <Trash2 alt="Remove" className="filter invert" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Photo Button */}
            {returnData.images.length < 5 && (
              <div
                className="flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-300 transition-all duration-300"
                style={{
                  scrollSnapAlign: "center",
                  width: "8rem",
                  height: "8rem",
                }}
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReturnImageUpload}
                  />
                  <Plus className="w-10 h-10 text-gray-400 hover:text-blue-500" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={closeReturnModalWithAnimation}
            className="py-3 px-7 rounded-lg border text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={confirmReturnOrder}
            className="py-3 px-7 rounded-lg transform active:scale-95 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-300"
          >
            Submit Return
          </button>
        </div>
      </div>
    </div>
  );
};

ModalReturn.propTypes = {
  isReturnModalOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isAlertActive: PropTypes.bool.isRequired,
  isReturnModalVisible: PropTypes.bool.isRequired,
  returnData: PropTypes.shape({
    reason: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  }).isRequired,
  setReturnData: PropTypes.func.isRequired,
  closeReturnModalWithAnimation: PropTypes.func.isRequired,
  handleReturnImageUpload: PropTypes.func.isRequired,
  confirmReturnOrder: PropTypes.func.isRequired,
};

export default ModalReturn;
