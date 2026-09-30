import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import {
  getMyOrder,
  cancelOrder,
  requestOrderReturn,
} from "../../lib/orderapi.js";

const statusStyles = {
  pending: {
    label: "Order Placed",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  shipped: {
    label: "Shipped",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatShortDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getImage = (item) => {
  if (item?.image) return item.image;

  if (item?.product?.images?.length) {
    const firstImage = item.product.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.url || firstImage?.secure_url || "";
  }

  if (item?.product?.image) {
    return item.product.image;
  }

  return "";
};

const getVariantDetails = (item) => {
  const rawVariant = item?.variant || item?.selectedVariant || {};
  const productVariant = item?.product?.selectedVariant || {};

  const size =
    rawVariant?.size ??
    rawVariant?.Size ??
    item?.size ??
    item?.selectedSize ??
    productVariant?.size ??
    "";

  const color =
    rawVariant?.color ??
    rawVariant?.Color ??
    item?.color ??
    item?.selectedColor ??
    productVariant?.color ??
    "";

  const sku =
    rawVariant?.sku ??
    rawVariant?.SKU ??
    item?.sku ??
    item?.variantSku ??
    productVariant?.sku ??
    "";

  return {
    size: size ? String(size) : "",
    color: color ? String(color) : "",
    sku: sku ? String(sku) : "",
  };
};

const getStatusConfig = (status) => {
  const normalized = String(status || "pending").toLowerCase();

  return (
    statusStyles[normalized] || {
      label: status || "Processing",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      dot: "bg-gray-500",
    }
  );
};

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.dot} ${
          status === "processing" || status === "shipped"
            ? "animate-pulse"
            : ""
        }`}
      />

      {config.label}
    </span>
  );
}

function IconBox({ children, className = "" }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <IconBox>{icon}</IconBox>

      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>

        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function OrderTimeline({ order }) {
  const status = String(order?.orderStatus || "pending").toLowerCase();

  const steps = [
    {
      key: "pending",
      title: "Order Placed",
      description: "We've received your order.",
    },
    {
      key: "confirmed",
      title: "Confirmed",
      description: "Your order has been confirmed.",
    },
    {
      key: "processing",
      title: "Processing",
      description: "Your items are being prepared.",
    },
    {
      key: "shipped",
      title: "Shipped",
      description: "Your order is on its way.",
    },
    {
      key: "delivered",
      title: "Delivered",
      description: "Your order has been delivered.",
    },
  ];

  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <div>
            <h3 className="font-bold text-red-800">Order Cancelled</h3>

            <p className="mt-1 text-sm text-red-700">
              This order has been cancelled and will not be processed.
            </p>

            {order.cancelledAt && (
              <p className="mt-2 text-xs text-red-600">
                Cancelled on {formatDate(order.cancelledAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const statusIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === status)
  );

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const completed = index <= statusIndex;
        const current = index === statusIndex;

        return (
          <div key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
            {index !== steps.length - 1 && (
              <div
                className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                  index < statusIndex ? "bg-violet-500" : "bg-gray-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                completed
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-white text-gray-300"
              } ${current ? "ring-4 ring-violet-100" : ""}`}
            >
              {completed ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-300" />
              )}
            </div>

            <div className="pt-0.5">
              <h3
                className={`text-sm font-semibold ${
                  completed ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.title}

              </h3>

              <p
                className={`mt-1 text-xs ${
                  completed ? "text-black" : "text-gray-400"
                }`}
              >
                {step.description}
              </p>

              {current && (
                <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  Current status
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnError, setReturnError] = useState("");
  const [requestingReturn, setRequestingReturn] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyOrder(orderId);

        if (!mounted) return;

        const data =
          response?.order ||
          response?.data?.order ||
          response?.data ||
          response;

        setOrder(data);
      } catch (err) {
        if (!mounted) return;

        const message = err?.message || "Unable to load order.";

        if (
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("login") ||
          message.toLowerCase().includes("authentication")
        ) {
          navigate(`/login?redirect=/account/orders/${orderId}`, {
            replace: true,
          });

          return;
        }

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      loadOrder();
    }

    return () => {
      mounted = false;
    };
  }, [orderId, navigate]);

  const items = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const subtotal = useMemo(() => {
    if (order?.subtotal !== undefined) {
      return Number(order.subtotal || 0);
    }

    return items.reduce((sum, item) => {
      return (
        sum +
        Number(item?.subtotal ?? item?.price ?? 0) *
          Number(item?.quantity || 1)
      );
    }, 0);
  }, [order, items]);

  const shippingCharge = Number(order?.shippingCharge || 0);
  const discount = Number(order?.discount || 0);

  const totalAmount =
    order?.totalAmount !== undefined
      ? Number(order.totalAmount || 0)
      : subtotal + shippingCharge - discount;

  const paymentMethod = String(
    order?.paymentMethod || "COD"
  ).toUpperCase();

  const paymentStatus = String(
    order?.paymentStatus || "pending"
  ).toLowerCase();

  const orderStatus = String(order?.orderStatus || "").toLowerCase();

  const canCancel = ["pending", "processing"].includes(orderStatus);
  const canRequestReturn =
    orderStatus === "delivered" && !order?.returnRequest?.status;

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);

      const response = await cancelOrder(orderId);

      const updatedOrder =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        response;

      if (updatedOrder && updatedOrder.orderId) {
        setOrder(updatedOrder);
      } else {
        setOrder((previous) => ({
          ...previous,
          orderStatus: "cancelled",
          cancelledAt: new Date().toISOString(),
        }));
      }

      setShowCancelModal(false);
    } catch (err) {
      alert(err?.message || "Unable to cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async (event) => {
    event.preventDefault();

    try {
      setRequestingReturn(true);
      setReturnError("");

      const response = await requestOrderReturn(orderId, returnReason);
      const updatedOrder = response?.order || response?.data?.order;

      if (!updatedOrder) {
        throw new Error("The return request could not be confirmed.");
      }

      setOrder(updatedOrder);
      setShowReturnModal(false);
      setReturnReason("");
    } catch (err) {
      setReturnError(err?.message || "Unable to request a return.");
    } finally {
      setRequestingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="h-20 animate-pulse bg-white shadow-sm" />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />

          <div className="mt-6 h-40 animate-pulse rounded-3xl bg-white shadow-sm" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-[500px] animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-[420px] animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-tight text-gray-900"
            >
              Print<span className="text-violet-600">zenz</span>
            </Link>

            <Link
              to="/account/orders"
              className="text-sm font-semibold text-gray-600 hover:text-violet-600"
            >
              ← My Orders
            </Link>
          </div>
        </header>

        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-gray-200/40">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.5M12 16h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20.36h15.6a2 2 0 001.73-3l-7.82-13.5a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Order Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error ||
                "We couldn't find the order you're looking for."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/account/orders"
                className="flex-1 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                My Orders
              </Link>

              <Link
                to="/track-order"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-600"
              >
                Track Order
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-2xl font-black tracking-tight sm:text-3xl"
          >
            Print<span className="text-violet-600">zenz</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 sm:block"
            >
              Continue Shopping
            </Link>

            <Link
              to="/account/orders"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-600"
            >
              My Orders
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            to="/account/orders"
            className="font-medium transition hover:text-violet-600"
          >
            My Orders
          </Link>

          <span>›</span>

          <span className="font-medium text-gray-900">
            {order.orderId}
          </span>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 p-6 text-white shadow-xl shadow-gray-300/20 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/60">
                <span>Order Details</span>
                <span>•</span>
                <span>{formatShortDate(order.createdAt)}</span>
              </div>

              <h1 className="break-all text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                #{order.orderId}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                Thank you for shopping with Printzenz. Here is everything
                you need to know about your order.
              </p>

              <div className="mt-5">
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/track-order?orderId=${encodeURIComponent(
                  order.orderId
                )}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
                Track Order
              </Link>

              {canRequestReturn && (
                <button
                  type="button"
                  onClick={() => {
                    setReturnReason("");
                    setReturnError("");
                    setShowReturnModal(true);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500/25"
                >
                  Request Return
                </button>
              )}

              {orderStatus === "delivered" && order.returnRequest?.status && (
                <span className="inline-flex items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-white">
                  Return {order.returnRequest.status.toLowerCase()}
                </span>
              )}

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Order meta */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Order Date
            </p>

            <p className="mt-2 text-sm font-bold text-gray-900">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Payment
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">
                {paymentMethod === "RAZORPAY"
                  ? "Razorpay"
                  : "Cash on Delivery"}
              </p>

              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                  paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {paymentStatus === "paid" ? "PAID" : "PENDING"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Items
            </p>

            <p className="mt-2 text-sm font-bold text-gray-900">
              {items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
              )}{" "}
              item
              {items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
              ) !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Total
            </p>

            <p className="mt-2 text-lg font-black text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Products */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                title="Items in your order"
                subtitle={`${items.length} product${
                  items.length !== 1 ? "s" : ""
                }`}
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                }
              />

              <div className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const image = getImage(item);

                  const quantity = Number(item.quantity || 1);
                  const price = Number(item.price || 0);
                  const itemSubtotal =
                    item.subtotal !== undefined
                      ? Number(item.subtotal || 0)
                      : price * quantity;

                  const variant = getVariantDetails(item);

                  return (
                    <div
                      key={`${item.product?._id || item.product || index}-${index}`}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 sm:h-28 sm:w-28">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <svg
                              className="h-8 w-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <h3 className="font-bold leading-6 text-gray-900">
                              {item.name ||
                                item.product?.name ||
                                "Product"}
                            </h3>

                            {(variant.size ||
                              variant.color ||
                              variant.sku) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {variant.size && (
                                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                    Size: {variant.size}
                                  </span>
                                )}

                                {variant.color && (
                                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                    Color: {variant.color}
                                  </span>
                                )}

                                {variant.sku && (
                                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                    SKU: {variant.sku}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.sku && (
                              <p className="mt-2 text-xs text-gray-400">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-bold text-gray-900">
                              {formatCurrency(itemSubtotal)}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {formatCurrency(price)} × {quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Shipping */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                title="Delivery address"
                subtitle="Your order will be delivered here"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />

              <div className="rounded-2xl bg-gray-50 p-5">
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <p className="font-bold text-gray-900">
                    {order.customer?.firstName || ""}{" "}
                    {order.customer?.lastName || ""}
                  </p>

                  {order.shippingAddress?.address && (
                    <p>{order.shippingAddress.address}</p>
                  )}

                  <p>
                    {order.shippingAddress?.city || ""}
                    {order.shippingAddress?.state
                      ? `, ${order.shippingAddress.state}`
                      : ""}
                  </p>

                  <p className="font-medium text-gray-900">
                    {order.shippingAddress?.pincode || ""}
                  </p>

                  {order.customer?.phone && (
                    <p className="mt-3">
                      Phone:{" "}
                      <span className="font-semibold text-gray-900">
                        {order.customer.phone}
                      </span>
                    </p>
                  )}

                  {order.customer?.email && (
                    <p>
                      Email:{" "}
                      <span className="font-semibold text-gray-900">
                        {order.customer.email}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Shipment */}
            {(order.trackingNumber || order.trackingUrl) && (
              <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  title="Shipment tracking"
                  subtitle="Track your package"
                  icon={
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M3 16h18M16 16V9a1 1 0 00-1-1h-2"
                      />
                    </svg>
                  }
                />

                <div className="flex flex-col gap-4 rounded-2xl bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                      Tracking Number
                    </p>

                    <p className="mt-1 break-all font-bold text-violet-900">
                      {order.trackingNumber || "Available soon"}
                    </p>
                  </div>

                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      Track Shipment
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right */}
          <aside className="space-y-6">
            {/* Summary */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                title="Order summary"
                subtitle="Payment breakdown"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 14l2 2 4-4m-6.5 6.5h9A2.5 2.5 0 0020 16V8a2.5 2.5 0 00-2.5-2.5h-11A2.5 2.5 0 004 8v8a2.5 2.5 0 002.5 2.5z"
                    />
                  </svg>
                }
              />

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Shipping</span>

                  <span
                    className={`font-semibold ${
                      shippingCharge === 0
                        ? "text-emerald-600"
                        : "text-gray-900"
                    }`}
                  >
                    {shippingCharge === 0
                      ? "FREE"
                      : formatCurrency(shippingCharge)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-semibold text-emerald-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Total amount
                      </p>
                      <p className="mt-1 text-2xl font-black text-gray-900">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-500">
                      INR
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                title="Payment method"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m3 0h2m5-8H6a3 3 0 00-3 3v8a3 3 0 003 3h12a3 3 0 003-3v-8a3 3 0 00-3-3z"
                    />
                  </svg>
                }
              />

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  {paymentMethod === "RAZORPAY" ? (
                    <span className="text-xs font-black text-blue-600">
                      ₹
                    </span>
                  ) : (
                    <svg
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m3 0h2m5-8H6a3 3 0 00-3 3v8a3 3 0 003 3h12a3 3 0 003-3v-8a3 3 0 00-3-3z"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {paymentMethod === "RAZORPAY"
                      ? "Razorpay"
                      : "Cash on Delivery"}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {paymentStatus === "paid"
                      ? "Payment received"
                      : "Payment pending"}
                  </p>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                title="Order progress"
                subtitle="Live order status"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <OrderTimeline order={order} />
            </section>

            {/* Help */}
            <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 text-white shadow-lg shadow-violet-200/50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9.247a4.75 4.75 0 017.544 0M12 13v.01M12 17h.01M5.5 20h13A2.5 2.5 0 0021 17.5v-11A2.5 2.5 0 0018.5 4h-13A2.5 2.5 0 003 6.5v11A2.5 2.5 0 005.5 20z"
                  />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-black">
                Need help with your order?
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/75">
                If you have any questions about your order, delivery, or
                payment, our support team is here to help.
              </p>

              <Link
                to="/contact"
                className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-gray-100"
              >
                Contact Support
              </Link>
            </section>
          </aside>
        </div>
      </main>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-center text-xl font-black text-gray-900">
              Cancel this order?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to cancel order{" "}
              <span className="font-semibold text-gray-900">
                #{order.orderId}
              </span>
              ? This action may not be reversible.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm">
          <form
            onSubmit={handleRequestReturn}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <h2 className="text-xl font-black text-gray-900">
              Request a return
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Submit a return request for order #{order.orderId}.
            </p>
            <label className="mt-5 block text-sm font-semibold text-gray-700">
              Reason (optional)
              <textarea
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                maxLength={500}
                rows={3}
                className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Tell us why you are returning this order"
              />
            </label>
            {returnError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {returnError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                disabled={requestingReturn}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={requestingReturn}
                className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {requestingReturn ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}