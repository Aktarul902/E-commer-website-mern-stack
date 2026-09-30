
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import {
  useCart,
} from "../../context/cartcontex";

import {
  createOrder,
} from "../../lib/orderapi.js";

import {
  getCurrentUser,
} from "../../lib/api.js";

const Checkout = () => {
  const navigate = useNavigate();

  const {
    items,
    subtotal,
    loading: cartLoading,
    clearCart,
  } = useCart();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [showGuestWarning, setShowGuestWarning] =
    useState(false);

  const [error, setError] = useState("");

  const [activeStep, setActiveStep] =
    useState(1);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("PREPAID");

  const shipping = 0;

  const discount =
    paymentMethod === "PREPAID"
      ? subtotal * 0.1
      : 0;

  const total = Math.max(
    0,
    subtotal - discount + shipping
  );

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response =
          await getCurrentUser();

        const currentUser =
          response?.user ||
          response;

        if (currentUser) {
          setUser(currentUser);

          setForm((previous) => ({
            ...previous,

            firstName:
              currentUser.firstName ||
              currentUser.name ||
              "",

            lastName:
              currentUser.lastName ||
              "",

            email:
              currentUser.email ||
              "",

            phone:
              currentUser.phone ||
              "",
          }));
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "email",
      "phone",
      "address1",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!form[field]?.trim()) {
        return false;
      }
    }

    return true;
  };

  /* =========================
     SUBMIT
  ========================= */

  const submitOrder = async () => {
    setError("");

    if (!items.length) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    if (!validateForm()) {
      setError(
        "Please complete all required shipping details."
      );

      setActiveStep(1);

      return;
    }

    /*
     * Guest warning.
     */
    if (!user) {
      setShowGuestWarning(true);
      return;
    }

    await placeOrder();
  };

  /* =========================
     PLACE ORDER
  ========================= */

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);
      setError("");
      setShowGuestWarning(false);

      const response =
        await createOrder({
          customer: {
            firstName:
              form.firstName,
            lastName:
              form.lastName,
            email:
              form.email,
            phone:
              form.phone,
          },

          shippingAddress: {
            firstName:
              form.firstName,
            lastName:
              form.lastName,
            email:
              form.email,
            phone:
              form.phone,
            address1:
              form.address1,
            address2:
              form.address2,
            city:
              form.city,
            state:
              form.state,
            pincode:
              form.pincode,
            country: "India",
            countryCode: "IN",
          },

          paymentMethod,

          items: items.map((item) => ({
            productId:
              item.product?._id ||
              item.productId ||
              item.product,

            quantity:
              Number(item.quantity),

            variant:
              item.variant || {},
          })),
        });

      await clearCart();

      const orderId =
        response?.order?.orderId ||
        response?.orderId ||
        response?.data?.orderId;

      if (!orderId) {
        throw new Error(
          "Order created, but order ID was not returned."
        );
      }

      navigate(
        `/order-success/${encodeURIComponent(
          orderId
        )}`,
        {
          replace: true,
          state: {
            order:
              response?.order ||
              response?.data ||
              response,
          },
        }
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (
    cartLoading ||
    loadingUser
  ) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="animate-pulse">
            <div className="h-10 w-56 rounded-lg bg-gray-200" />

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
              <div className="space-y-6">
                <div className="h-72 rounded-3xl bg-gray-200" />
                <div className="h-64 rounded-3xl bg-gray-200" />
              </div>

              <div className="h-[500px] rounded-3xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     EMPTY CART
  ========================= */

  if (!items.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-lg rounded-[32px] border border-gray-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-pink-100 text-3xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add something you love before
            continuing to checkout.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-2xl bg-black px-7 py-3.5 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafafa]">
      {/* =========================
          BACKGROUND DECORATION
      ========================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />

        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-pink-200/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-200/10 blur-3xl" />
      </div>

      {/* =========================
          HEADER
      ========================= */}

      <header className="relative z-10 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="group"
            >
              <div className="text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Printzenz
                </span>
              </div>
            </Link>

            <Link
              to="/cart"
              className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md"
            >
              <svg
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              Back to Cart
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* =========================
            TITLE
        ========================= */}

        <div className="animate-[fadeIn_0.5s_ease-out]">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Complete your order
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Almost there. Enter your delivery
            details and choose your preferred
            payment method.
          </p>
        </div>

        {/* =========================
            PROGRESS
        ========================= */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center">
            <CheckoutStep
              number="01"
              title="Delivery"
              active={activeStep >= 1}
              completed={activeStep > 1}
            />

            <div
              className={`h-px flex-1 transition-colors duration-500 ${
                activeStep > 1
                  ? "bg-violet-500"
                  : "bg-gray-200"
              }`}
            />

            <CheckoutStep
              number="02"
              title="Payment"
              active={activeStep >= 2}
              completed={false}
            />

            <div
              className={`h-px flex-1 transition-colors duration-500 ${
                activeStep > 2
                  ? "bg-violet-500"
                  : "bg-gray-200"
              }`}
            />

            <CheckoutStep
              number="03"
              title="Complete"
              active={activeStep >= 3}
              completed={false}
            />
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </div>

            <div>
              <p className="font-bold">
                Something needs attention
              </p>

              <p className="mt-0.5 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =========================
            MAIN GRID
        ========================= */}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* =========================
              LEFT
          ========================= */}

          <div className="space-y-6">
            {/* ACCOUNT STATUS */}

            <section className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-sm font-black text-white shadow-lg shadow-violet-200">
                      01
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-gray-950">
                        Contact information
                      </h2>

                      <p className="mt-0.5 text-sm text-gray-500">
                        Where should we send your
                        order updates?
                      </p>
                    </div>
                  </div>

                  {user ? (
                    <span className="hidden rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 sm:inline-flex">
                      ✓ Signed in
                    </span>
                  ) : (
                    <Link
                      to="/login"
                      className="hidden rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 sm:inline-flex"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
                <InputField
                  label="First name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />

                <InputField
                  label="Last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />

                <InputField
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  full
                />

                <InputField
                  label="Phone number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  full
                />
              </div>
            </section>

            {/* SHIPPING */}

            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-sm font-black text-white shadow-lg shadow-pink-200">
                    02
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-gray-950">
                      Delivery address
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Where should we deliver your
                      order?
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
                <InputField
                  label="Address"
                  name="address1"
                  value={form.address1}
                  onChange={handleChange}
                  placeholder="House no., street name"
                  required
                  full
                />

                <InputField
                  label="Apartment, floor, etc."
                  name="address2"
                  value={form.address2}
                  onChange={handleChange}
                  placeholder="Optional"
                  full
                />

                <InputField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Kolkata"
                  required
                />

                <InputField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="West Bengal"
                  required
                />

                <InputField
                  label="PIN code"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="700001"
                  required
                />

                <div className="hidden sm:block" />
              </div>
            </section>

            {/* PAYMENT */}

            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-black text-white shadow-lg shadow-orange-200">
                    03
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-gray-950">
                      Payment method
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Choose how you'd like to pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 sm:p-7">
                <PaymentOption
                  value="COD"
                  selected={
                    paymentMethod ===
                    "COD"
                  }
                  onChange={setPaymentMethod}
                  icon="💵"
                  title="Cash on Delivery"
                  description="Pay when your order arrives"
                  badge="Available"
                />

                <PaymentOption
                  value="PREPAID"
                  selected={
                    paymentMethod ===
                    "PREPAID"
                  }
                  onChange={setPaymentMethod}
                  icon="⚡"
                  title="Prepaid"
                  description="Get 10% off instantly"
                  badge="Save 10%"
                />
              </div>
            </section>

            {/* TRUST */}

            <div className="grid gap-3 sm:grid-cols-3">
              <TrustItem
                icon="🔒"
                title="Secure checkout"
                text="Your information is protected"
              />

              <TrustItem
                icon="🚚"
                title="Reliable delivery"
                text="Track your order anytime"
              />

              <TrustItem
                icon="💳"
                title="Safe payments"
                text="Trusted payment options"
              />
            </div>
          </div>

          {/* =========================
              RIGHT - ORDER SUMMARY
          ========================= */}

          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
              {/* SUMMARY HEADER */}

              <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 p-6 text-white sm:p-7">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                      Your order
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Order summary
                    </h2>
                  </div>

                  <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                    {items.length}{" "}
                    {items.length === 1
                      ? "item"
                      : "items"}
                  </div>
                </div>
              </div>

              {/* ITEMS */}

              <div className="max-h-[390px] overflow-y-auto p-5 sm:p-6">
                <div className="space-y-5">
                  {items.map(
                    (item, index) => {
                      const product =
                        item.product;

                      const name =
                        product?.name ||
                        item.name ||
                        "Product";

                      const image =
                        product?.images?.[0] ||
                        product?.image ||
                        item.image ||
                        "/placeholder-product.jpg";

                      const price =
                        Number(
                          product?.price ??
                            item.price ??
                            0
                        );

                      const quantity =
                        Number(
                          item.quantity || 1
                        );

                      return (
                        <div
                          key={`${name}-${index}`}
                          className="flex gap-4"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                            />

                            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white shadow">
                              {quantity}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-bold text-gray-900">
                              {name}
                            </p>

                            {item.variant && (
                              <p className="mt-1 text-xs text-gray-500">
                                {[
                                  item.variant
                                    .size,
                                  item.variant
                                    .color,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    " • "
                                  )}
                              </p>
                            )}

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-xs text-gray-400">
                                Qty{" "}
                                {quantity}
                              </span>

                              <span className="text-sm font-black">
                                ₹
                                {(
                                  price *
                                  quantity
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* TOTALS */}

              <div className="border-t border-gray-100 p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold">
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

                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Prepaid discount
                      </span>

                      <span className="font-semibold text-green-600">
                        -₹
                        {discount.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-5 border-t border-dashed border-gray-200" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-tight text-gray-950">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <span className="mb-1 text-xs font-medium text-gray-400">
                    INR
                  </span>
                </div>

                <button
                  type="button"
                  disabled={placingOrder}
                  onClick={() => {
                    setActiveStep(2);
                    submitOrder();
                  }}
                  className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 px-6 py-4 font-black text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {placingOrder ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                        <svg
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </span>

                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
                </button>

                <p className="mt-4 text-center text-[11px] leading-5 text-gray-400">
                  By placing your order, you agree
                  to our terms and conditions.
                </p>
              </div>
            </div>

            {/* GUEST NOTE */}

            {!user && (
              <div className="mt-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-pink-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    👤
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Shopping as a guest?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your order won't appear in My
                      Orders. Keep your Order ID to
                      track it later.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* =========================
          GUEST WARNING MODAL
      ========================= */}

      {showGuestWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-md">
          <div
            className="w-full max-w-md animate-[modalIn_0.25s_ease-out] overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            {/* MODAL TOP */}

            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 p-7 text-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
                  👤
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Guest checkout
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Continue without login?
                  </h2>
                </div>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="p-6 sm:p-7">
              <p className="leading-7 text-gray-600">
                You can place this order without
                creating an account.
              </p>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <div className="text-lg">
                    ⚠️
                  </div>

                  <div>
                    <p className="font-bold text-amber-900">
                      Important
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      This order will{" "}
                      <strong>
                        not appear in My Orders
                      </strong>
                      . You will need your Order ID
                      to track it later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  disabled={placingOrder}
                  onClick={placeOrder}
                  className="w-full rounded-2xl bg-black px-5 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg disabled:opacity-50"
                >
                  {placingOrder
                    ? "Placing order..."
                    : "Continue as Guest"}
                </button>

                <Link
                  to="/login"
                  onClick={() =>
                    setShowGuestWarning(
                      false
                    )
                  }
                  className="block w-full rounded-2xl border border-gray-200 px-5 py-3.5 text-center font-bold text-gray-900 transition hover:bg-gray-50"
                >
                  Login to My Account
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setShowGuestWarning(
                      false
                    )
                  }
                  className="w-full py-2 text-sm font-semibold text-gray-400 transition hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ANIMATIONS
      ========================= */}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalIn {
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
};

/* =========================
   INPUT COMPONENT
========================= */

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  full = false,
}) => {
  return (
    <div
      className={
        full
          ? "sm:col-span-2"
          : ""
      }
    >
      <label className="mb-2 block text-sm font-bold text-gray-800">
        {label}

        {required && (
          <span className="ml-1 text-pink-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
      />
    </div>
  );
};

/* =========================
   PAYMENT OPTION
========================= */

const PaymentOption = ({
  value,
  selected,
  onChange,
  icon,
  title,
  description,
  badge,
}) => {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(value)
      }
      className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
        selected
          ? "border-violet-500 bg-violet-50/60 shadow-md shadow-violet-100"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition-transform duration-300 group-hover:scale-105 ${
          selected
            ? "bg-white shadow-sm"
            : "bg-gray-100"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-gray-900">
            {title}
          </p>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              selected
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {badge}
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          selected
            ? "border-violet-600"
            : "border-gray-300"
        }`}
      >
        {selected && (
          <div className="h-2.5 w-2.5 rounded-full bg-violet-600" />
        )}
      </div>
    </button>
  );
};

/* =========================
   CHECKOUT STEP
========================= */

const CheckoutStep = ({
  number,
  title,
  active,
  completed,
}) => {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all duration-500 ${
          active
            ? "bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-200"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {completed ? "✓" : number}
      </div>

      <span
        className={`hidden text-xs font-bold sm:block ${
          active
            ? "text-gray-900"
            : "text-gray-400"
        }`}
      >
        {title}
      </span>
    </div>
  );
};

/* =========================
   TRUST ITEM
========================= */

const TrustItem = ({
  icon,
  title,
  text,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-xl">
        {icon}
      </div>

      <p className="mt-2 text-xs font-bold text-gray-900">
        {title}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-gray-400">
        {text}
      </p>
    </div>
  );
};

export default Checkout;



