import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { FaTimes } from "react-icons/fa";
import { ChevronLeft, ChevronRight, Star, Plus, Trash2 } from "lucide-react";
const ModalReview = ({
  isReviewModalOpen,
  isLoading,
  isAlertActive,
  isReviewModalVisible,
  reviewData,
  setReviewData,
  closeReviewModalWithAnimation,
  handleReviewSubmit,
}) => {
  if (!isReviewModalOpen) return null;

  const MAX_WORDS = 300;

  // Fungsi utilitas untuk menghitung karakter sebagai kata
  const countWords = (text) => {
    // Hapus spasi di awal dan akhir
    const trimmedText = text.trim();

    // Jika text kosong, kembalikan 0
    if (trimmedText.length === 0) return 0;

    // Hitung setiap karakter termasuk spasi
    return trimmedText.length;
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 flex items-center justify-center z-[60] backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
        isReviewModalVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }  ${isLoading && isAlertActive ? "bg-transparent" : "bg-black/30"} 
       `}
      onClick={(e) => {
        if (e.target.id === "modal-overlay") {
          closeReviewModalWithAnimation();
        }
      }}
    >
      <div
        className={`bg-white ${
          isReviewModalVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full"
        }
        p-8 rounded-2xl shadow-xl max-w-xl 2xl:max-w-3xl w-full relative transform transition-all duration-700 ease-in-out`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Leave a Review</h3>
          <button
            onClick={closeReviewModalWithAnimation}
            className="text-gray-600 hover:text-gray-700 hover:rotate-90 transition-all duration-300"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Rating Stars */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Rating
          </label>
          <div className="flex justify-center items-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setReviewData({
                    ...reviewData,
                    rating: reviewData.rating === star ? 0 : star,
                  });
                }}
                className={`relative group transition-all duration-300 ease-in-out ${
                  reviewData.rating >= star ? "" : "hover:scale-110"
                }`}
              >
                <Star
                  fill={reviewData.rating ? "currentColor" : "currentColor"}
                  className={`w-7 h-7 ${
                    reviewData.rating >= star
                      ? "text-orange-500"
                      : "text-orange-300 opacity-60 hover:text-orange-500"
                  } transition-all duration-300`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Textarea */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition duration-300 resize-none h-40   
    placeholder:text-xs placeholder:text-gray-400 ${
      countWords(reviewData.review) >= MAX_WORDS
        ? "border-red-300 focus:border-red-500"
        : "border-gray-200 focus:border-blue-300"
    }`}
            placeholder={`Share your experience (Max ${MAX_WORDS} characters)`}
            value={reviewData.review}
            onChange={(e) => {
              const inputValue = e.target.value;
              const charCount = countWords(inputValue);

              // Jika jumlah karakter tidak melebihi batas, update
              if (charCount <= MAX_WORDS) {
                setReviewData({ ...reviewData, review: inputValue });
              } else {
                // Potong input jika melebihi batas
                const truncatedValue = inputValue.slice(0, MAX_WORDS);

                setReviewData({ ...reviewData, review: truncatedValue });
              }
            }}
          />

          {/* Character Counter */}
          <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
            {/* Error Message */}
            <div className="flex-grow">
              {countWords(reviewData.review) >= MAX_WORDS && (
                <p className="text-xs text-red-500">
                  Maximum {MAX_WORDS} characters reached. Cannot add more text.
                </p>
              )}
            </div>

            <span className="text-right">
              {countWords(reviewData.review)} / {MAX_WORDS}
            </span>
          </div>
        </div>

        {/* Image Upload and Preview */}
        <div className="relative group/slider w-full">
          {/* Navigation Left - Hanya tampil di desktop */}
          {reviewData.images.length > 3 && (
            <button
              onClick={() => {
                const container = document.getElementById("image-slider");
                container.scrollBy({
                  left: -container.clientWidth / 2,
                  behavior: "smooth",
                });
              }}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-full w-10 h-10   
        items-center justify-center shadow-md border border-gray-100 hover:bg-white/90 hover:scale-105 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Navigation Right - Hanya tampil di desktop */}
          {reviewData.images.length > 3 && (
            <button
              onClick={() => {
                const container = document.getElementById("image-slider");
                container.scrollBy({
                  left: container.clientWidth / 2,
                  behavior: "smooth",
                });
              }}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-full w-10 h-10   
        items-center justify-center shadow-md border border-gray-100 hover:bg-white/90 hover:scale-105 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Slider Container */}
          <div
            id="image-slider"
            className="flex overflow-x-auto space-x-4 pb-4 scroll-smooth no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {reviewData.images.map((image, index) => (
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
                        setReviewData((prev) => ({
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
            {reviewData.images.length < 5 && (
              <div
                className="flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center   
          justify-center hover:border-blue-300 transition-all duration-300"
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
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...Array.from(e.target.files)],
                      }))
                    }
                  />
                  <Plus className="w-10 h-10 text-gray-400 hover:text-blue-500" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={closeReviewModalWithAnimation}
            className="py-3 px-7 rounded-lg border text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleReviewSubmit}
            className="py-3 px-7 rounded-lg transform active:scale-95 bg-green-50 text-green-600 hover:bg-green-100 
              transition-all duration-300 border border-green-200 hover:border-green-300"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

// Validasi props dengan PropTypes
ModalReview.propTypes = {
  isReviewModalOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isAlertActive: PropTypes.bool.isRequired,
  isReviewModalVisible: PropTypes.bool.isRequired,
  reviewData: PropTypes.shape({
    rating: PropTypes.number,
    review: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)),
  }).isRequired,
  setReviewData: PropTypes.func.isRequired,
  closeReviewModalWithAnimation: PropTypes.func.isRequired,
  handleReviewSubmit: PropTypes.func.isRequired,
};

export default ModalReview;
