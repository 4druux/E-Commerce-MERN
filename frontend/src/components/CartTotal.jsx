import React, { useContext } from "react";
import PropTypes from "prop-types";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { formatPrice } from "../utils/formatPrice"; // Impor formatPrice

const CartTotal = ({ selectedItems = [] }) => {
  const { currency, delivery_fee } = useContext(ShopContext);

  const subtotal = selectedItems.reduce((acc, item) => {
    const itemPrice = item.price || 0;
    return acc + item.quantity * itemPrice;
  }, 0);

  const total = subtotal + (subtotal > 0 ? delivery_fee : 0);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency}{formatPrice(subtotal)}</p> {/* Ganti dengan formatPrice */}
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping fee</p>
          <p>
            {subtotal > 0 ? `${currency}${formatPrice(delivery_fee)}` : `${currency}${formatPrice(0)}`}
          </p> {/* Ganti dengan formatPrice */}
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>{currency}{formatPrice(total)}</b> {/* Ganti dengan formatPrice */}
        </div>
      </div>
    </div>
  );
};

CartTotal.propTypes = {
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default CartTotal;
