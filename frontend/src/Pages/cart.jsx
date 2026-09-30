import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  Lock,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { useCart } from "../context/cartcontex";

export default function Cart() {
  const navigate = useNavigate();

  const {
    items,
    totalItems,
    subtotal,
    updateCartItem,
    removeFromCart,
    clearCart,
    loading,
    error,
  } = useCart();

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [clearing, setClearing] = useState(false);

  /*
   * Product discount
   *
   * This supports both:
   * - product.price
   * - product.oldPrice
   * - product.compareAtPrice
   *
   * If your backend uses another field, add it here.
   */
  const originalTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = item.product || {};

      const price = Number(item.price || product.price || 0);

      const oldPrice = Number(
        item.oldPrice ||
          product.oldPrice ||
          product.compareAtPrice ||
          price
      );

      return total + oldPrice * Number(item.quantity || 0);
    }, 0);
  }, [items]);

  const productDiscount = Math.max(0, originalTotal - subtotal);

  /*
   * Temporary frontend coupon.
   *
   * IMPORTANT:
   * This should eventually be replaced by your backend
   * coupon API so that the final price is calculated securely
   * on the server.
   */
  const couponDiscount = couponApplied
    ? Math.round(subtotal * 0.1)
    : 0;

  const shipping = 0;

  const total = Math.max(
    0,
    subtotal - couponDiscount + shipping
  );

  const getProductId = (item) => {
    return (
      item.product?._id ||
      item.product?.id ||
      item.productId ||
      item.product
    );
  };

  const getProductSlug = (item) => {
    const product = item.product || {};

    return (
      product.slug ||
      product._id ||
      item.productId ||
      item.product
    );
  };

  const getProductName = (item) => {
    return (
      item.product?.name ||
      item.name ||
      "Product"
    );
  };

  const getProductImage = (item) => {
    const product = item.product || {};

    if (product.images?.length) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      return (
        firstImage?.url ||
        firstImage?.secure_url ||
        ""
      );
    }

    return (
      product.image ||
      item.image ||
      ""
    );
  };

  const getCategory = (item) => {
    const product = item.product || {};

    if (typeof product.category === "string") {
      return product.category;
    }

    return (
      product.category?.name ||
      item.category ||
      "Product"
    );
  };

  const getPrice = (item) => {
    return Number(
      item.price ||
        item.product?.price ||
        0
    );
  };

  const getOldPrice = (item) => {
    return Number(
      item.oldPrice ||
        item.product?.oldPrice ||
        item.product?.compareAtPrice ||
        0
    );
  };

  const getVariantText = (item) => {
    const variant = item.variant || {};

    return {
      size:
        variant.size ||
        item.size ||
        null,

      color:
        variant.color ||
        item.color ||
        null,
    };
  };

  const getItemKey = (item) => {
    const productId = getProductId(item);

    const variant = item.variant || {};

    return [
      productId,
      variant.size || "",
      variant.color || "",
      variant.sku || "",
    ].join("-");
  };

  const updateQuantity = async (item, amount) => {
    const currentQuantity = Number(item.quantity || 1);
    const newQuantity = currentQuantity + amount;

    if (newQuantity < 1) {
      await handleRemove(item);
      return;
    }

    try {
      setUpdatingItem(getItemKey(item));

      await updateCartItem({
        item,
        quantity: newQuantity,
      });
    } catch (err) {
      console.error("Quantity update failed:", err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (item) => {
    try {
      setUpdatingItem(getItemKey(item));

      await removeFromCart(item);
    } catch (err) {
      console.error("Remove cart item failed:", err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);

      await clearCart();
    } catch (err) {
      console.error("Clear cart failed:", err);
    } finally {
      setClearing(false);
    }
  };

  const applyCoupon = () => {
    setCouponError("");

    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (code === "PRINT10") {
      setCoupon(code);
      setCouponApplied(true);
      return;
    }

    setCouponApplied(false);
    setCouponError("Invalid coupon code.");
  };

  const removeCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setCouponError("");
  };

  const goToCheckout = () => {
    if (!items.length) {
      return;
    }

    navigate("/checkout");
  };

  /*
   * Loading state
   */
  if (loading && items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-950">
              <Loader2
                size={28}
                className="animate-spin text-white"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-950">
              Loading your cart
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please wait a moment...
            </p>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-gray-500 transition hover:text-gray-950"
            >
              Home
            </Link>

            <ChevronRight
              size={15}
              className="text-gray-400"
            />

            <span className="font-medium text-gray-950">
              Cart
            </span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
              <ShoppingCart size={14} />
              Your Cart
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-gray-500">
              {items.length > 0
                ? `${totalItems} ${
                    totalItems === 1
                      ? "item"
                      : "items"
                  } in your cart`
                : "Your cart is currently empty"}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              disabled={clearing}
              className="group flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearing ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={16} />
              )}

              {clearing
                ? "Clearing..."
                : "Clear Cart"}
            </button>
          )}
        </div>

        {/* API Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Unable to update cart
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}
            <section>
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                {/* Header */}
                <div className="hidden border-b border-gray-100 px-6 py-4 sm:flex sm:items-center sm:justify-between">
                  <h2 className="font-bold text-gray-950">
                    Cart Items
                  </h2>

                  <span className="text-sm text-gray-500">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const itemKey = getItemKey(item);

                    const productSlug =
                      getProductSlug(item);

                    const productName =
                      getProductName(item);

                    const productImage =
                      getProductImage(item);

                    const category =
                      getCategory(item);

                    const price =
                      getPrice(item);

                    const oldPrice =
                      getOldPrice(item);

                    const variant =
                      getVariantText(item);

                    const isUpdating =
                      updatingItem === itemKey;

                    return (
                      <div
                        key={itemKey}
                        className="p-4 transition hover:bg-gray-50/50 sm:p-6"
                      >
                        <div className="flex gap-4 sm:gap-5">
                          {/* Product Image */}
                          <Link
                            to={`/product/${productSlug}`}
                            className="group h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-36 sm:w-28"
                          >
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={productName}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <ShoppingBag
                                  size={28}
                                />
                              </div>
                            )}
                          </Link>

                          {/* Product Information */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  {category}
                                </p>

                                <Link
                                  to={`/product/${productSlug}`}
                                  className="mt-1 block truncate text-sm font-bold text-gray-950 transition hover:text-gray-500 sm:text-base"
                                >
                                  {productName}
                                </Link>
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemove(item)
                                }
                                disabled={
                                  isUpdating
                                }
                                aria-label={`Remove ${productName}`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={17}
                                  />
                                )}
                              </button>
                            </div>

                            {/* Variants */}
                            {(variant.size ||
                              variant.color) && (
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                {variant.size && (
                                  <span>
                                    Size:{" "}
                                    <strong className="text-gray-700">
                                      {
                                        variant.size
                                      }
                                    </strong>
                                  </span>
                                )}

                                {variant.color && (
                                  <span>
                                    Color:{" "}
                                    <strong className="text-gray-700">
                                      {
                                        variant.color
                                      }
                                    </strong>
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bottom Row */}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                              {/* Quantity */}
                              <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item,
                                      -1
                                    )
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Minus
                                    size={14}
                                  />
                                </button>

                                <span className="flex h-9 min-w-8 items-center justify-center border-x border-gray-200 text-sm font-bold text-gray-950">
                                  {isUpdating ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item,
                                      1
                                    )
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Plus
                                    size={14}
                                  />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="font-bold text-gray-950">
                                  ₹
                                  {(
                                    price *
                                    Number(
                                      item.quantity ||
                                        0
                                    )
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                                {oldPrice >
                                  price && (
                                  <p className="text-xs text-gray-400 line-through">
                                    ₹
                                    {(
                                      oldPrice *
                                      Number(
                                        item.quantity ||
                                          0
                                      )
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Free Shipping Notice */}
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
                <Truck
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="text-sm font-bold text-green-800">
                    Free shipping on every order
                  </p>

                  <p className="mt-1 text-xs text-green-700">
                    Enjoy free delivery across India.
                  </p>
                </div>
              </div>

              {/* Continue Shopping */}
              <Link
                to="/shop"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-gray-700 transition hover:text-gray-950"
              >
                <ArrowRight
                  size={17}
                  className="rotate-180 transition group-hover:-translate-x-1"
                />

                Continue Shopping
              </Link>
            </section>

            {/* Order Summary */}
            <aside className="h-fit lg:sticky lg:top-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-black text-gray-950">
                  Order Summary
                </h2>

                {/* Coupon */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Have a coupon?
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(
                            e.target.value
                          );
                          setCouponError("");
                        }}
                        placeholder="Enter coupon"
                        disabled={
                          couponApplied
                        }
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm uppercase outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white disabled:opacity-60"
                      />
                    </div>

                    {couponApplied ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="rounded-xl bg-gray-950 px-4 text-sm font-bold text-white transition hover:bg-gray-800"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponApplied && (
                    <p className="mt-2 text-xs font-semibold text-green-600">
                      PRINT10 applied — 10%
                      discount added.
                    </p>
                  )}

                  {couponError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-100" />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-gray-900">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  {productDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Product discount
                      </span>

                      <span className="font-semibold text-green-600">
                        -₹
                        {productDiscount.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Coupon discount
                      </span>

                      <span className="font-semibold text-green-600">
                        -₹
                        {couponDiscount.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Shipping
                    </span>

                    <span
                      className={`font-semibold ${
                        shipping === 0
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="my-6 border-t border-gray-100 pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-bold text-gray-950">
                        Total
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Inclusive of applicable
                        taxes
                      </p>
                    </div>

                    <p className="text-2xl font-black text-gray-950">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>

                {/* Checkout */}
                <button
                  type="button"
                  onClick={goToCheckout}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-gray-800 active:scale-[0.98]"
                >
                  Proceed to Checkout

                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </button>

                {/* Payment Security */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <ShieldCheck
                      size={18}
                      className="text-gray-500"
                    />

                    <span className="text-[10px] font-medium text-gray-500">
                      Secure
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 text-center">
                    <Truck
                      size={18}
                      className="text-gray-500"
                    />

                    <span className="text-[10px] font-medium text-gray-500">
                      Fast Delivery
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 text-center">
                    <Lock
                      size={18}
                      className="text-gray-500"
                    />

                    <span className="text-[10px] font-medium text-gray-500">
                      Safe Payment
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Empty Cart */
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <ShoppingBag size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-gray-950">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Looks like you haven't added
              anything to your cart yet. Discover
              something you love from Printzenz.
            </p>

            <Link
              to="/shop"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              <ShoppingBag size={17} />

              Start Shopping

              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}