import React from "react";
import PropTypes from "prop-types";
import { useSwipeable } from "react-swipeable";
import { assets } from "../assets/assets";

const CartItem = ({
  item,
  productData,
  selectedItems,
  handleCheckboxChange,
  handleDecrement,
  handleQuantityChange,
  handleIncrement,
  handleRemoveItem,
  currency,
  formatPrice,
  showDelete,
  setShowDelete,
  isMobile,
}) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => isMobile && setShowDelete(item.productId),
    onSwipedRight: () => isMobile && setShowDelete(null),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="relative py-4 border-t border-b text-gray-700">
      <div
        {...handlers}
        className={`relative grid grid-cols-[0.5fr_4fr_auto_0.5fr] sm:grid-cols-[0.5fr_4fr_2fr_0.5fr] items-center gap-4 transition-transform ${
          showDelete === item.productId && isMobile
            ? "transform -translate-x-10"
            : ""
        }`}
      >
        <input
          type="checkbox"
          checked={selectedItems.some(
            (selectedItem) =>
              selectedItem._id === item.productId &&
              selectedItem.size === item.size
          )}
          onChange={() => handleCheckboxChange(item, productData)}
          className="w-4 h-4 cursor-pointer"
        />
        <div className="flex items-start gap-6">
          <img
            src={productData.image[0]}
            className="w-16 sm:w-20"
            alt={productData.name}
          />
          <div className="flex flex-col justify-center">
            <p
              className={`font-medium ${
                isMobile ? "text-base" : "text-lg"
              } whitespace-nowrap overflow-hidden text-ellipsis`}
              style={{ maxWidth: "200px" }}
            >
              {productData.name}
            </p>
            <div className="flex flex-col items-start gap-1 mt-2">
              <p className={`${isMobile ? "text-sm" : "text-base"}`}>
                {currency}
                {formatPrice(productData.price)}
              </p>
              <p
                className={`px-2 py-1 border bg-slate-50 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                {item.size}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center ${isMobile ? "justify-end" : ""}`}
          style={{ width: isMobile ? "100%" : "auto" }}
        >
          <button
            onClick={() =>
              handleDecrement(item.productId, item.size, item.quantity)
            }
            className={`bg-gray-50 border ${
              isMobile ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-sm"
            }`}
            style={{ minWidth: isMobile ? "15px" : "32px" }}
          >
            -
          </button>
          <input
            onChange={(e) =>
              handleQuantityChange(
                item.productId,
                item.size,
                Number(e.target.value)
              )
            }
            className="border text-center w-10 sm:w-16 px-1 sm:px-2 py-1 mx-1"
            type="number"
            min={1}
            value={item.quantity}
            style={{
              fontSize: isMobile ? "12px" : "inherit",
              height: isMobile ? "23px" : "32px",
            }}
          />
          <button
            onClick={() =>
              handleIncrement(item.productId, item.size, item.quantity)
            }
            className={`bg-gray-50 border ${
              isMobile ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-sm"
            }`}
            style={{ minWidth: isMobile ? "15px" : "32px" }}
          >
            +
          </button>
        </div>
      </div>
      {(showDelete === item.productId && isMobile) || !isMobile ? (
        <div
          className={`absolute right-0 top-0 h-full w-14 flex items-center justify-center cursor-pointer ${
            isMobile ? "bg-black" : ""
          }`}
          onClick={() => handleRemoveItem(item.productId, item.size)}
        >
          <img
            src={assets.recycle_bin}
            alt="Remove item"
            className={`w-5  ${isMobile ? "invert" : ""}`}
          />
        </div>
      ) : null}
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
  productData: PropTypes.shape({
    image: PropTypes.arrayOf(PropTypes.string).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
  handleDecrement: PropTypes.func.isRequired,
  handleQuantityChange: PropTypes.func.isRequired,
  handleIncrement: PropTypes.func.isRequired,
  handleRemoveItem: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  formatPrice: PropTypes.func.isRequired,
  showDelete: PropTypes.string,
  setShowDelete: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default CartItem;
