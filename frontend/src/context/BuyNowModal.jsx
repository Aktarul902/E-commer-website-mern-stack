import { useEffect, useState } from "react";
import {
  X,
  Minus,
  Plus,
  MapPin,
  Phone,
  User,
  Mail,
  ShieldCheck,
  Truck,
  PackageCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { createOrder } from "../lib/orderapi.js";
import { getDefaultAddress } from "../lib/adressapi.js";
import { getCurrentUser } from "../lib/api.js";
import {
  createCashfreeOrder,
  clearCashfreeTrackingToken,
  saveCashfreeTrackingToken,
  verifyCashfreePayment,
} from "../lib/cashfreeapi.js";
import { openCashfreeCheckout } from "../utils/cashfree.jsx";

export default function BuyNowModal({
  open,
  onClose,
  product,
  quantity = 1,
  variant = {},
}) {
  const [qty, setQty] = useState(quantity);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("PREPAID");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setQty(quantity);
      setSuccess(null);
      setError("");
    }
  }, [open, quantity]);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    const loadDefaultAddress = async () => {
      const userResponse = await getCurrentUser();
      const user = userResponse?.user || userResponse;

      if (!user || !active) return;

      let address = null;

      try {
        address = await getDefaultAddress();
      } catch (addressError) {
        console.error("Failed to load default address:", addressError);
      }

      if (!active) return;

      setForm((current) => ({
        ...current,
        firstName: address?.firstName || user.firstName || current.firstName,
        lastName: address?.lastName || user.lastName || current.lastName,
        phone: address?.phone || user.phone || current.phone,
        email: user.email || current.email,
        address: [address?.addressLine1, address?.addressLine2]
          .filter(Boolean)
          .join(", ") || current.address,
        city: address?.city || current.city,
        state: address?.state || current.state,
        pincode: address?.postalCode || current.pincode,
      }));
    };

    loadDefaultAddress();

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const productName =
    product?.name || "Product";

  const productImage =
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    product?.image ||
    "";

  const productPrice = Number(
    product?.price || 0
  );

  const oldPrice = Number(
    product?.oldPrice ||
      product?.compareAtPrice ||
      0
  );

  const subtotal = productPrice * qty;

  const shipping = 0;

  const prepaidDiscount =
    paymentMethod === "PREPAID"
      ? subtotal * 0.1
      : 0;

  const total =
    Math.max(0, subtotal - prepaidDiscount + shipping);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const increaseQuantity = () => {
    setQty((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQty((current) =>
      Math.max(1, current - 1)
    );
  };

  const validateForm = () => {
    if (!form.firstName.trim()) {
      return "Please enter your first name.";
    }

    if (!form.phone.trim()) {
      return "Please enter your mobile number.";
    }

    const phone = form.phone.replace(/\D/g, "");

    if (phone.length !== 10) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!form.address.trim()) {
      return "Please enter your delivery address.";
    }

    if (!form.city.trim()) {
      return "Please enter your city.";
    }

    if (!form.state.trim()) {
      return "Please enter your state.";
    }

    if (!form.pincode.trim()) {
      return "Please enter your pincode.";
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      return "Please enter a valid 6-digit pincode.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await createOrder({
        customer: {
          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim(),

          phone:
            form.phone.trim(),

          email:
            form.email.trim(),
            
        },

        shippingAddress: {
          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim(),

          address1:
            form.address.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),

          pincode:
            form.pincode.trim(),

          country: "India",

          countryCode: "IN",

          phone:
            form.phone.trim(),
        },

        paymentMethod,

        items: [
          {
            productId:
              product?._id ||
              product?.id,

            quantity: qty,

            variant: {
              size:
                variant?.size || "",

              color:
                variant?.color || "",

              sku:
                variant?.sku || "",

              qikinkSku:
                variant?.qikinkSku || "",
            },
          },
        ],
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to place order."
        );
      }

      const order = response.order || response.data;

      if (paymentMethod === "PREPAID") {
        saveCashfreeTrackingToken(order.orderId, order.trackingToken);
        const payment = await createCashfreeOrder({
          orderId: order.orderId,
          trackingToken: order.trackingToken,
        });
        await openCashfreeCheckout(
          payment.paymentSessionId,
          payment.environment,
          payment.checkoutMode
        );

        if (payment.checkoutMode === "modal") {
          const verification = await verifyCashfreePayment(
            order.orderId,
            order.trackingToken
          );

          if (verification.paymentStatus === "PAID") {
            clearCashfreeTrackingToken(order.orderId);
            setSuccess(verification.order);
          } else {
            setError("Cashfree has not confirmed the payment yet. Please try again.");
          }
        }
        return;
      }

      setSuccess(order);
    } catch (err) {
      console.error(
        "Buy Now order error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Success screen
   */
  if (success) {
    const orderId =
      success?.orderId ||
      success?.order?.orderId ||
      success?.id;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
        <div
          className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"
          style={{
            animation:
              "buyNowModalIn 0.35s ease-out",
          }}
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black px-6 py-10 text-center text-white">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
              <CheckCircle2
                size={42}
                className="text-green-500"
              />
            </div>

            <h2 className="relative mt-5 text-2xl font-black">
              Order Confirmed!
            </h2>

            <p className="relative mt-2 text-sm text-gray-300">
              {paymentMethod === "PREPAID"
                ? "Your prepaid payment is confirmed for this order."
                : "Your COD order has been placed successfully."}
            </p>
          </div>

          <div className="p-6">
            {orderId && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Order ID
                </p>

                <p className="mt-1 text-lg font-black text-gray-950">
                  {orderId}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <PackageCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="text-sm font-bold text-green-800">
                    {paymentMethod === "PREPAID"
                      ? "Payment confirmed"
                      : "Cash on Delivery"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-700">
                    {paymentMethod === "PREPAID"
                      ? "Your Cashfree payment was verified. We will prepare your order shortly."
                      : "Our team will contact you shortly to confirm your delivery details."}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-gray-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <style>{`
          @keyframes buyNowModalIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 px-3 py-4 backdrop-blur-md sm:px-6 sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        style={{
          animation:
            "buyNowModalIn 0.35s ease-out",
        }}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 px-5 py-5 text-white sm:px-7">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-950">
                  <PackageCheck
                    size={19}
                  />
                </div>

                <span className="text-sm font-black tracking-wide">
                  PRINTZENZ
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black sm:text-2xl">
                Complete Your Order
              </h2>

              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                Fast & secure checkout
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-300 transition hover:bg-white/20 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_360px]">
            {/* Left */}
            <div className="p-5 sm:p-7">
              {/* Product */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <PackageCheck
                          size={25}
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Your Product
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-gray-950 sm:text-base">
                      {productName}
                    </h3>

                    {(variant?.size ||
                      variant?.color) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {variant?.size && (
                          <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                            Size:{" "}
                            {variant.size}
                          </span>
                        )}

                        {variant?.color && (
                          <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                            Color:{" "}
                            {variant.color}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-black text-gray-950">
                        ₹
                        {productPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {oldPrice >
                        productPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹
                          {oldPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Quantity
                  </span>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="flex h-9 min-w-9 text-black  items-center justify-center border-x border-gray-200 text-sm font-black">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="mt-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-white">
                      <MapPin size={16} />
                    </div>

                    <div>
                      <h3 className="font-black text-gray-950">
                        Delivery Details
                      </h3>

                      <p className="text-xs text-gray-500">
                        Where should we deliver
                        your order?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    icon={User}
                    label="First Name"
                    value={form.firstName}
                    onChange={(value) =>
                      updateField(
                        "firstName",
                        value
                      )
                    }
                    placeholder="Rahul"
                    required
                  />

                  <Input
                    label="Last Name"
                    value={form.lastName}
                    onChange={(value) =>
                      updateField(
                        "lastName",
                        value
                      )
                    }
                    placeholder="Sharma"
                  />

                  <Input
                    icon={Phone}
                    label="Mobile Number"
                    value={form.phone}
                    onChange={(value) =>
                      updateField(
                        "phone",
                        value
                      )
                    }
                    placeholder="9876543210"
                    type="tel"
                    required
                  />

                  <Input
                    icon={Mail}
                    label="Email"
                    value={form.email}
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                    placeholder="you@example.com"
                    type="email"
                    required
                  />

                  <div className="sm:col-span-2">
                    <Input
                      icon={MapPin}
                      label="Full Address"
                      value={form.address}
                      onChange={(value) =>
                        updateField(
                          "address",
                          value
                        )
                      }
                      placeholder="House no, street, area, landmark"
                      required
                    />
                  </div>

                  <Input
                    label="City"
                    value={form.city}
                    onChange={(value) =>
                      updateField(
                        "city",
                        value
                      )
                    }
                    placeholder="Kolkata"
                    required
                  />

                  <Input
                    label="State"
                    value={form.state}
                    onChange={(value) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                    placeholder="West Bengal"
                    required
                  />

                  <Input
                    label="Pincode"
                    value={form.pincode}
                    onChange={(value) =>
                      updateField(
                        "pincode",
                        value
                      )
                    }
                    placeholder="700001"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm font-semibold">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Right Summary */}
            <div className="border-t border-gray-100 bg-gray-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="lg:sticky lg:top-5">
                <h3 className="text-lg font-black text-gray-950">
                  Order Summary
                </h3>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Product
                    </span>

                    <span className="font-semibold text-gray-900">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Shipping
                    </span>

                    <span className="font-semibold text-green-600">
                      FREE
                    </span>
                  </div>

                  {prepaidDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Prepaid discount
                      </span>

                      <span className="font-semibold text-green-600">
                        -₹
                        {prepaidDiscount.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-5 border-t border-gray-200" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-bold text-gray-950">
                      Total
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      {paymentMethod === "PREPAID"
                        ? "Prepaid discount applied"
                        : "Pay when delivered"}
                    </p>
                  </div>

                  <p className="text-2xl font-black text-gray-950">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Payment method
                  </p>

                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                        paymentMethod === "COD"
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span>Cash on Delivery</span>
                      <span className="text-[11px] opacity-80">
                        COD
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PREPAID")}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                        paymentMethod === "PREPAID"
                          ? "border-green-600 bg-green-50 text-green-800"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span>Prepaid</span>
                      <span className="text-[11px] opacity-80">
                        10% off
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                      {paymentMethod === "PREPAID" ? (
                        <ShieldCheck
                          size={19}
                          className="text-green-600"
                        />
                      ) : (
                        <PackageCheck
                          size={19}
                          className="text-green-600"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-black text-green-900">
                        {paymentMethod === "PREPAID"
                          ? "Prepaid Order"
                          : "Cash on Delivery"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-green-700">
                        {paymentMethod === "PREPAID"
                          ? "Pay now and save 10% instantly on your order."
                          : "Pay safely when your order arrives at your doorstep."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-700">
                  <Truck size={15} />
                  Free shipping on every order
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      {paymentMethod === "PREPAID"
                        ? "Opening Cashfree..."
                        : "Placing Order..."}
                    </>
                  ) : (
                    <>
                      {paymentMethod === "PREPAID"
                        ? "Pay with Cashfree"
                        : "Place COD Order"}
                      <ArrowRight
                        size={18}
                        className="transition group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                {/* Trust */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-200 pt-5">
                  <TrustItem
                    icon={ShieldCheck}
                    text="Secure"
                  />

                  <TrustItem
                    icon={Truck}
                    text="Fast Delivery"
                  />

                  <TrustItem
                    icon={PackageCheck}
                    text="COD Available"
                  />
                </div>

                <p className="mt-5 text-center text-[10px] leading-4 text-gray-400">
                  By placing this order, you agree
                  to our terms and delivery policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes buyNowModalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/* --------------------------------
   Input
-------------------------------- */

function Input({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
  maxLength,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`h-12 w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-950 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-950 focus:ring-2 focus:ring-gray-950/5 ${
            Icon
              ? "pl-10 pr-3"
              : "px-3"
          }`}
        />
      </div>
    </div>
  );
}

/* --------------------------------
   Trust Item
-------------------------------- */

function TrustItem({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon
        size={17}
        className="text-gray-500"
      />

      <span className="text-[10px] font-semibold text-gray-500">
        {text}
      </span>
    </div>
  );
}