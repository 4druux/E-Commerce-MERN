import React from "react";
import PropTypes from "prop-types";
import { useSwipeable } from "react-swipeable";
import { assets } from "../assets/assets";
import { Minus, Plus } from "lucide-react";

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
    onSwipedLeft: () =>
      isMobile && setShowDelete(`${item.productId}_${item.size}`),
    onSwipedRight: () => isMobile && setShowDelete(null),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="relative py-4 border-t border-b text-gray-700">
      <div
        {...handlers}
        className={`relative grid grid-cols-[0.5fr_4fr_auto_0.2fr] sm:grid-cols-[0.5fr_4fr_2fr_0.5fr] items-center gap-4 transition-all duration-300 ease-in-out ${
          showDelete === `${item.productId}_${item.size}` && isMobile
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
          className="w-4 h-4 cursor-pointer accent-gray-800"
        />
        <div className="flex items-start space-x-3">
          <img
            src={productData.image[0]}
            className="w-20 sm:w-24 rounded-xl"
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
            <div className="flex flex-col items-start gap-1 mt-1">
              <p className={`${isMobile ? "text-sm" : "text-base"}`}>
                {currency}
                {formatPrice(productData.price)}
              </p>
              <p
                className={`px-2 py-1 border bg-slate-50 mt-1 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                {item.size}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 ${isMobile ? "justify-end" : ""}`}
          style={{ width: isMobile ? "100%" : "auto" }}
        >
          <button
            onClick={() =>
              handleDecrement(item.productId, item.size, item.quantity)
            }
            className="bg-gray-100 p-1 sm:p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
          </button>
          <input
            onChange={(e) =>
              handleQuantityChange(
                item.productId,
                item.size,
                Number(e.target.value)
              )
            }
            className="w-20 text-center border-2 rounded-lg py-1 bg-gray-50"
            type="number"
            min={1}
            value={item.quantity}
            style={{
              fontSize: isMobile ? "12px" : "inherit",
              width: isMobile ? "50px" : "80px",
            }}
          />
          <button
            onClick={() =>
              handleIncrement(item.productId, item.size, item.quantity)
            }
            className="bg-gray-100 p-1 sm:p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
          </button>
        </div>
      </div>
      {(showDelete === `${item.productId}_${item.size}` && isMobile) ||
      !isMobile ? (
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
