import { useState, useMemo } from "react";

export const useReviewFilter = (initialReviews = []) => {
  // State untuk filter
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(0);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("");
  const [showImageOnly, setShowImageOnly] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Constants
  const allSizes = ["S", "M", "L", "XL", "XXL"];

  // Filtering logic for dynamic counting
  const filteredReviews = useMemo(() => {
    return initialReviews.filter((review) => {
      const ratingMatches =
        selectedRatingFilter === 0 || review.rating === selectedRatingFilter;
      const sizeMatches =
        selectedSizeFilter === "" || review.size === selectedSizeFilter;
      const imageMatches = showImageOnly
        ? review.reviewImages.length > 0
        : true;

      return ratingMatches && sizeMatches && imageMatches;
    });
  }, [initialReviews, selectedRatingFilter, selectedSizeFilter, showImageOnly]);

  // Sorting logic for date filter
  const sortedFilteredReviews = useMemo(() => {
    if (selectedDateFilter === "" || selectedDateFilter === "latest") {
      return [...filteredReviews].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (selectedDateFilter === "oldest") {
      return [...filteredReviews].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return filteredReviews;
  }, [filteredReviews, selectedDateFilter]);

  // Dynamic counting functions
  const countAllReviews = initialReviews.length;
  const countReviewsWithImage = initialReviews.filter(
    (review) => review.reviewImages.length > 0
  ).length;

  const countReviewsByRating = (rating) => {
    return initialReviews.filter(
      (review) =>
        review.rating === rating &&
        (selectedSizeFilter === "" || review.size === selectedSizeFilter) &&
        (!showImageOnly || review.reviewImages.length > 0)
    ).length;
  };

  // Handler untuk mengubah filter
  const handleRatingFilterChange = (rating) => {
    setSelectedRatingFilter(selectedRatingFilter === rating ? 0 : rating);
    setIsRatingDropdownOpen(false);
  };

  const handleSizeFilterChange = (size) => {
    setSelectedSizeFilter(selectedSizeFilter === size ? "" : size);
    setIsSizeDropdownOpen(false);
  };

  const handleDateFilterChange = (order) => {
    setSelectedDateFilter(selectedDateFilter === order ? "" : order);
    setIsDateDropdownOpen(false);
  };

  // Reset semua filter
  const resetFilters = () => {
    setSelectedRatingFilter(0);
    setSelectedSizeFilter("");
    setShowImageOnly(false);
    setSelectedDateFilter("");
  };

  // Return semua state dan fungsi yang diperlukan
  return {
    // State
    selectedRatingFilter,
    selectedSizeFilter,
    showImageOnly,
    selectedDateFilter,
    allSizes,

    // Fungsi filter
    setSelectedRatingFilter,
    setSelectedSizeFilter,
    setShowImageOnly,
    setSelectedDateFilter,

    // Fungsi hitung
    countAllReviews,
    countReviewsWithImage,
    countReviewsByRating,

    // Fungsi handler
    handleRatingFilterChange,
    handleSizeFilterChange,
    handleDateFilterChange,
    resetFilters,

    // Fungi Dropdown
    isRatingDropdownOpen,
    isSizeDropdownOpen,
    isDateDropdownOpen,
    setIsRatingDropdownOpen,
    setIsSizeDropdownOpen,
    setIsDateDropdownOpen,

    // Hasil filter
    filteredReviews: sortedFilteredReviews,
  };
};
