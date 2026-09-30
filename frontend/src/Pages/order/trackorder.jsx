import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router";
import { trackOrder } from "../../lib/orderapi.js";

const STATUS_STEPS = [
  {
    key: "PLACED",
    label: "Order Placed",
    description: "We've received your order",
    icon: "✓",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your order has been confirmed",
    icon: "✓",
  },
  {
    key: "PROCESSING",
    label: "Processing",
    description: "Your order is being prepared",
    icon: "⚙",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Your package is on the way",
    icon: "➜",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Arriving at your doorstep",
    icon: "⌂",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Package delivered successfully",
    icon: "✓",
  },
];

const STATUS_ALIASES = {
  pending: "PLACED",
  placed: "PLACED",
  confirmed: "CONFIRMED",
  processing: "PROCESSING",
  packed: "PROCESSING",
  shipped: "SHIPPED",
  "out-for-delivery": "OUT_FOR_DELIVERY",
  out_for_delivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
};

function normalizeStatus(status) {
  if (!status) return "PLACED";

  const normalized = String(status)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return STATUS_ALIASES[normalized] || String(status).toUpperCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getProductImage(item) {
  if (!item) return "";

  if (item.image) {
    return typeof item.image === "string"
      ? item.image
      : item.image.url || "";
  }

  if (item.product?.images?.length) {
    const firstImage = item.product.images[0];

    return typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || "";
  }

  if (item.product?.image) {
    return typeof item.product.image === "string"
      ? item.product.image
      : item.product.image?.url || "";
  }

  return "";
}

function getStatusIndex(status) {
  const normalized = normalizeStatus(status);

  const index = STATUS_STEPS.findIndex(
    (step) => step.key === normalized
  );

  return index === -1 ? 0 : index;
}

function StatusIcon({ icon, active, completed }) {
  return (
    <div
      className={`
        relative z-10
        flex h-11 w-11 shrink-0 items-center justify-center
        rounded-full border-4
        transition-all duration-500
        ${
          completed
            ? "border-violet-100 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-400 text-white shadow-lg shadow-violet-200"
            : active
            ? "border-violet-100 bg-white text-violet-600 shadow-lg shadow-violet-100"
            : "border-gray-100 bg-gray-50 text-gray-400"
        }
      `}
    >
      {completed ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M5 12.5l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-sm font-bold">{icon}</span>
      )}

      {active && !completed && (
        <span className="absolute inset-0 animate-ping rounded-full bg-violet-400 opacity-20" />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-[0_20px_70px_rgba(79,70,229,0.10)] sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 via-fuchsia-100 to-orange-100">
          <svg
            className="h-10 w-10 text-violet-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
            <path d="M3 7.5L12 12l9-4.5" />
            <path d="M12 12v9" />
          </svg>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-gray-900">
          Track your Printzenz order
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
          Enter your order ID below to see the latest status and delivery
          information.
        </p>

        <TrackSearch />
      </div>
    </div>
  );
}

function TrackSearch({ initialValue = "" }) {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(
    initialValue || searchParams.get("orderId") || ""
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const trimmed = orderId.trim();

        if (!trimmed) return;

        window.location.href = `/track-order?orderId=${encodeURIComponent(
          trimmed
        )}`;
      }}
      className="mt-8"
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
        </div>

        <input
          type="text"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          placeholder="Enter your order ID"
          className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-32 text-sm font-medium text-gray-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />

        <button
          type="submit"
          className="absolute right-1.5 top-1.5 h-11 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Track
        </button>
      </div>

      <p className="mt-3 text-left text-xs text-gray-400">
        Example: <span className="font-semibold">PZ-20260927-ABC123</span>
      </p>
    </form>
  );
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();

  const initialOrderId =
    searchParams.get("orderId") ||
    searchParams.get("orderID") ||
    searchParams.get("id") ||
    "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [inputValue, setInputValue] = useState(initialOrderId);
  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(Boolean(initialOrderId));
  const [error, setError] = useState("");

  const loadOrder = useCallback(async (id = orderId) => {
    const trimmed = String(id || "").trim();

    if (!trimmed) {
      setError("Please enter your order ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await trackOrder({
        orderId: trimmed,
      });

      const data =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        response;

      if (!data) {
        throw new Error("Order not found.");
      }

      setOrder(data);
      setOrderId(trimmed);

      const nextUrl = `/track-order?orderId=${encodeURIComponent(trimmed)}`;

      window.history.replaceState({}, "", nextUrl);
    } catch (err) {
      console.error("Track order error:", err);

      setOrder(null);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "We couldn't find this order. Please check your order ID and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (initialOrderId) {
      loadOrder(initialOrderId);
    }
  }, [initialOrderId, loadOrder]);

  const normalizedStatus = useMemo(
    () => normalizeStatus(order?.orderStatus || order?.status),
    [order]
  );

  const activeStep = useMemo(
    () => getStatusIndex(normalizedStatus),
    [normalizedStatus]
  );

  const items = order?.items || [];

  const subtotal = Number(order?.subtotal || 0);
  const shippingCharge = Number(order?.shippingCharge || 0);
  const discount = Number(order?.discount || 0);
  const totalAmount = Number(
    order?.totalAmount ??
      subtotal + shippingCharge - discount
  );

  const trackingNumber =
    order?.trackingNumber ||
    order?.qikink?.trackingNumber ||
    "";

  const trackingUrl =
    order?.trackingUrl ||
    order?.qikink?.trackingUrl ||
    "";

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute right-[-100px] top-[25%] h-96 w-96 rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[25%] h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 text-white shadow-lg shadow-violet-200 transition group-hover:scale-105">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
                <path d="M4 7.5L12 12l8-4.5" />
                <path d="M12 12v9" />
              </svg>
            </div>

            <span className="text-xl font-black tracking-tight">
              Print<span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">zenz</span>
            </span>
          </Link>

          <Link
            to="/shop"
            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-gray-950 via-violet-950 to-fuchsia-950 p-7 text-white shadow-2xl shadow-violet-200 sm:p-10 lg:p-12">
          <div className="relative">
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_420px]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  LIVE ORDER TRACKING
                </div>

                <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                  Your order is on its way.
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                  Follow your Printzenz order from our studio to your doorstep.
                  We'll keep you updated every step of the way.
                </p>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  loadOrder(inputValue);
                }}
                className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
                  Track another order
                </p>

                <div className="flex gap-2">
                  <input
                    value={inputValue}
                    onChange={(event) =>
                      setInputValue(event.target.value)
                    }
                    placeholder="Order ID"
                    className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-medium text-white outline-none placeholder:text-white/35 focus:border-white/30 focus:bg-white/15"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-xl bg-white px-5 text-sm font-black text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "..." : "Track"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* No order */}
        {!order && !loading && !error && <EmptyState />}

        {/* Error */}
        {error && !loading && (
          <div className="mb-8 rounded-3xl border border-red-100 bg-red-50 p-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-red-900">
                  We couldn't find your order
                </h3>
                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-[500px] animate-pulse rounded-[32px] bg-gray-100" />
            <div className="h-[400px] animate-pulse rounded-[32px] bg-gray-100" />
          </div>
        )}

        {/* Order */}
        {order && !loading && (
          <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
            {/* Main */}
            <div className="space-y-6">
              {/* Current status */}
              <section className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.07)]">
                <div className="border-b border-gray-100 p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                        Order Status
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-tight">
                        {STATUS_STEPS[activeStep]?.label ||
                          order?.orderStatus ||
                          "Order Placed"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {STATUS_STEPS[activeStep]?.description ||
                          "We're processing your order."}
                      </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {String(normalizedStatus).replaceAll("_", " ")}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="relative">
                    <div className="absolute left-[21px] top-5 bottom-5 w-[3px] rounded-full bg-gray-100" />

                    <div
                      className="absolute left-[21px] top-5 w-[3px] rounded-full bg-gradient-to-b from-violet-600 via-fuchsia-600 to-orange-400 transition-all duration-700"
                      style={{
                        height:
                          activeStep === 0
                            ? "0%"
                            : `${(activeStep / (STATUS_STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    <div className="relative space-y-7">
                      {STATUS_STEPS.map((step, index) => {
                        const completed = index < activeStep;
                        const active = index === activeStep;

                        return (
                          <div
                            key={step.key}
                            className="flex gap-4"
                          >
                            <StatusIcon
                              icon={step.icon}
                              active={active}
                              completed={completed}
                            />

                            <div className="min-w-0 pt-1">
                              <p
                                className={`text-sm font-black ${
                                  active || completed
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>

                              <p
                                className={`mt-1 text-xs ${
                                  active || completed
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.description}
                              </p>
                            </div>

                            {active && (
                              <div className="ml-auto hidden rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet-600 sm:block">
                                Current
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Tracking information */}
              {trackingNumber && (
                <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-[1px] shadow-xl shadow-violet-100">
                  <div className="rounded-[31px] bg-white p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                          Shipment Tracking
                        </p>

                        <h3 className="mt-2 text-xl font-black">
                          {trackingNumber}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Your shipment tracking number
                        </p>
                      </div>

                      {trackingUrl && (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
                        >
                          Track Shipment
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M7 17L17 7" />
                            <path d="M8 7h9v9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Products */}
              <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                      Your Items
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      Order items
                    </h3>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                    {items.length}{" "}
                    {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const image = getProductImage(item);
                    const quantity = Number(item.quantity || 1);
                    const price = Number(item.price || 0);
                    const itemTotal = Number(
                      item.subtotal ?? price * quantity
                    );
                    return (
                      <div
                        key={
                          item._id ||
                          item.product?._id ||
                          item.productId ||
                          index
                        }
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
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
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <path d="M8 14l2.5-3 2 2 2.5-3 3 4" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-sm font-bold text-gray-900">
                            {item.name || "Product"}
                          </h4>

                          {(item.variant?.size ||
                            item.variant?.color ||
                            item.variant?.sku) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.variant?.size && (
                                <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                                  Size: {item.variant.size}
                                </span>
                              )}

                              {item.variant?.color && (
                                <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                                  Color: {item.variant.color}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-gray-500">
                              Qty:{" "}
                              <span className="font-bold text-gray-800">
                                {quantity}
                              </span>
                            </span>

                            <span className="text-sm font-black text-gray-900">
                              {formatCurrency(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Delivery address */}
              {order.shippingAddress && (
                <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-8">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                        Delivery Address
                      </p>

                      <h3 className="mt-2 text-lg font-black">
                        {order.customer?.firstName
                          ? `${order.customer.firstName} ${
                              order.customer.lastName || ""
                            }`
                          : "Delivery Address"}
                      </h3>

                      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                        {order.shippingAddress.address}
                        {order.shippingAddress.address2
                          ? `, ${order.shippingAddress.address2}`
                          : ""}
                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.pincode}
                        <br />
                        {order.shippingAddress.country || "India"}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Order details */}
              <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                      Order Details
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      {order.orderId || order._id || orderId}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M6 3h12v18l-6-3-6 3V3Z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Order date
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatDate(
                        order.createdAt || order.orderDate
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Payment
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {order.paymentMethod === "RAZORPAY"
                        ? "Paid Online"
                        : "Cash on Delivery"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Payment status
                    </span>
                    <span className="text-sm font-bold capitalize text-gray-900">
                      {String(
                        order.paymentStatus || "Pending"
                      ).replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Subtotal
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Shipping
                      </span>
                      <span className="text-sm font-semibold">
                        {shippingCharge === 0
                          ? "FREE"
                          : formatCurrency(shippingCharge)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-emerald-600">
                          Discount
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}

                    <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-5">
                      <span className="text-sm font-bold text-gray-700">
                        Total
                      </span>

                      <span className="text-2xl font-black tracking-tight text-gray-900">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                  Need Help?
                </p>

                <h3 className="mt-2 text-lg font-black">
                  We're here for you.
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Have a question about your order? Our support team is
                  ready to help.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <a
                    href="mailto:support@printzenz.com"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-3 text-xs font-bold text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    Email Us
                  </a>

                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-3 text-xs font-bold text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3h2l2.5 12h10L20 7H6" />
                      <circle cx="10" cy="19" r="1" />
                      <circle cx="18" cy="19" r="1" />
                    </svg>
                    Shop
                  </Link>
                </div>
              </section>

              {/* Trust */}
              <section className="rounded-[32px] bg-gray-950 p-6 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <svg
                      className="h-5 w-5 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
                      <path d="M8.5 12l2.2 2.2 4.8-5" />
                    </svg>
                  </div>

                  <div>
                    <p className="font-bold">Secure & Reliable</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      Your order information is protected.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-lg font-black">✓</p>
                    <p className="mt-1 text-[10px] text-white/50">
                      Secure
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-lg font-black">⚡</p>
                    <p className="mt-1 text-[10px] text-white/50">
                      Fast
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-lg font-black">♥</p>
                    <p className="mt-1 text-[10px] text-white/50">
                      Trusted
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}

        {/* Footer CTA */}
        <section className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Thank you for shopping with{" "}
            <span className="font-bold text-gray-700">Printzenz</span>.
          </p>

          <Link
            to="/shop"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-800"
          >
            Explore more products
            <span>→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}