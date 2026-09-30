import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../context/cartcontex";

const AddToCartButton = ({
  product,
  quantity = 1,
  variant = {},
  className = "",
  disabled = false,
  label = "Add to Cart",
  disabledLabel = "Out of Stock",
  icon = null,
  showLabel = true,
  onClick,
}) => {
  const {
    addToCart,
  } = useCart();

  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (event) => {
    onClick?.(event);

    try {
      setAdding(true);

      await addToCart({
        product,
        quantity,
        variant,
      });

      toast.success("Product added to cart.");
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(event) => handleAddToCart(event)}
      disabled={adding || disabled}
      aria-label={showLabel ? undefined : disabled ? disabledLabel : label}
      className={`w-full rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
      {showLabel && (adding ? "Adding..." : disabled ? disabledLabel : label)}
    </button>
  );
};

export default AddToCartButton;