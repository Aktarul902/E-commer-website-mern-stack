import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    description: "Order has been received and is waiting for confirmation.",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    description: "Order has been confirmed and accepted.",
  },
  {
    value: "processing",
    label: "Processing",
    description: "Order is currently being prepared.",
  },
  {
    value: "shipped",
    label: "Shipped",
    description: "Order has been dispatched to the customer.",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Order has been successfully delivered.",
  },
  {
    value: "returned",
    label: "Returned",
    description: "The delivered order has been returned.",
  },
  {
    value: "not returned",
    label: "Not Returned",
    description: "The return was not accepted or completed.",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "Order has been cancelled.",
  },
];

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  returned: {
    label: "Returned",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  "not returned": {
    label: "Not Returned",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
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

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getStatusStyle = (status) => {
  return (
    STATUS_STYLES[String(status || "").toLowerCase()] || {
      label: status || "Unknown",
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-500",
    }
  );
};

const getProductImage = (item) => {
  if (item?.image) return item.image;

  if (item?.product?.image) {
    return item.product.image;
  }

  if (item?.product?.images?.length) {
    const image = item.product.images[0];

    if (typeof image === "string") {
      return image;
    }

    return image?.url || image?.secure_url || "";
  }

  return "";
};

function StatusBadge({ status }) {
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function SectionHeader({ icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>

        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}

function AdminOrderTimeline({ status, returnDecisionReason }) {
  const currentStatus = String(status || "pending").toLowerCase();

  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
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
            <p className="font-bold text-red-800">Order Cancelled</p>

            <p className="mt-1 text-sm text-red-700">
              This order is no longer being processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === "not returned") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="font-bold text-gray-800">Return Not Accepted</p>
        {returnDecisionReason && (
          <p className="mt-1 text-sm text-gray-600">
            {returnDecisionReason}
          </p>
        )}
      </div>
    );
  }

  const steps = [
    {
      key: "pending",
      title: "Order Placed",
    },
    {
      key: "confirmed",
      title: "Confirmed",
    },
    {
      key: "processing",
      title: "Processing",
    },
    {
      key: "shipped",
      title: "Shipped",
    },
    {
      key: "delivered",
      title: "Delivered",
    },
    {
      key: "returned",
      title: "Returned",
    },
  ];

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === currentStatus)
  );

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const completed = index <= currentIndex;

        return (
          <div
            key={step.key}
            className="relative flex items-start gap-4 pb-7 last:pb-0"
          >
            {index !== steps.length - 1 && (
              <div
                className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                  index < currentIndex
                    ? "bg-violet-500"
                    : "bg-gray-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                completed
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-white text-gray-300"
              }`}
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

            <div>
              <p
                className={`pt-1 text-sm font-semibold ${
                  completed ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.title}
              </p>

              {step.key === currentStatus && (
                <span className="mt-1 inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
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

export default function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [reasonStatus, setReasonStatus] = useState("");

  const openStatusReasonDialog = (status) => {
    setReasonStatus(status);
    setSelectedStatus(status);
    setStatusReason("");
    setShowCancelConfirm(true);
  };

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/admin/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load order."
        );
      }

      const orderData =
        data?.order ||
        data?.data?.order ||
        data?.data ||
        data;

      setOrder(orderData);

      setSelectedStatus(
        String(orderData?.orderStatus || "pending").toLowerCase()
      );

      setTrackingNumber(orderData?.trackingNumber || "");
      setTrackingUrl(orderData?.trackingUrl || "");
    } catch (err) {
      setError(err?.message || "Unable to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId, loadOrder]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const items = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item?.quantity || 0),
      0
    );
  }, [items]);

  const subtotal = Number(order?.subtotal || 0);
  const shippingCharge = Number(order?.shippingCharge || 0);
  const discount = Number(order?.discount || 0);
  const totalAmount = Number(order?.totalAmount || 0);

  const saveStatus = async () => {
    if (["cancelled", "not returned"].includes(selectedStatus)) {
      openStatusReasonDialog(selectedStatus);
      return;
    }

    try {
      setSavingStatus(true);
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/orders/admin/${encodeURIComponent(
          orderId
        )}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: selectedStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update order status."
        );
      }

      const updatedOrder =
        data?.order ||
        data?.data?.order ||
        data?.data ||
        data;

      if (updatedOrder?.orderId) {
        setOrder(updatedOrder);

        setSelectedStatus(
          String(
            updatedOrder.orderStatus || selectedStatus
          ).toLowerCase()
        );
      } else {
        setOrder((previous) => ({
          ...previous,
          orderStatus: selectedStatus,
        }));
      }

      setSuccessMessage("Order status updated successfully.");
    } catch (err) {
      alert(err?.message || "Unable to update order status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const saveTracking = async () => {
    try {
      setSavingTracking(true);
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/orders/admin/${encodeURIComponent(
          orderId
        )}/tracking`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            trackingUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update tracking."
        );
      }

      const updatedOrder =
        data?.order ||
        data?.data?.order ||
        data?.data ||
        data;

      if (updatedOrder?.orderId) {
        setOrder(updatedOrder);
        setTrackingNumber(updatedOrder.trackingNumber || "");
        setTrackingUrl(updatedOrder.trackingUrl || "");
      } else {
        setOrder((previous) => ({
          ...previous,
          trackingNumber,
          trackingUrl,
        }));
      }

      setSuccessMessage("Tracking information updated.");
    } catch (err) {
      alert(err?.message || "Unable to update tracking.");
    } finally {
      setSavingTracking(false);
    }
  };

  const submitStatusWithReason = async () => {
    const reason = statusReason.trim();
    if (!reason || !reasonStatus) return;

    const reasonField = reasonStatus === "cancelled"
      ? { cancellationReason: reason }
      : { returnDecisionReason: reason };

    try {
      setSavingStatus(true);

      const response = await fetch(
        `${API_URL}/orders/admin/${encodeURIComponent(
          orderId
        )}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: reasonStatus,
            ...reasonField,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update order status."
        );
      }

      const updatedOrder =
        data?.order ||
        data?.data?.order ||
        data?.data ||
        data;

      setOrder((previous) => ({
        ...previous,
        ...(updatedOrder || {}),
        orderStatus: reasonStatus === "cancelled" ? "Cancelled" : "Not Returned",
      }));

      setSelectedStatus(reasonStatus);
      setShowCancelConfirm(false);
      setStatusReason("");
      setReasonStatus("");
      setSuccessMessage(
        reasonStatus === "cancelled"
          ? "Order cancelled successfully."
          : "Order marked as not returned."
      );
    } catch (err) {
      alert(err?.message || "Unable to update order status.");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7fa]">
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-44 animate-pulse rounded-3xl bg-white" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-[650px] animate-pulse rounded-3xl bg-white" />
            <div className="h-[650px] animate-pulse rounded-3xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7fa] px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
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
                d="M12 9v3m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20.36h15.6a2 2 0 001.73-3l-7.82-13.5a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-xl font-black text-gray-900">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Unable to find this order."}
          </p>

          <Link
            to="/admin/orders"
            className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusStyle = getStatusStyle(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#f7f7fa] text-gray-900">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/admin/orders"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>

            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400">
                Admin / Orders
              </p>

              <h1 className="truncate text-lg font-black text-gray-900 sm:text-xl">
                #{order.orderId}
              </h1>
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="hidden rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-violet-300 hover:text-violet-600 sm:block"
          >
            All Orders
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Success notification */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
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
            </div>

            {successMessage}
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 p-6 text-white shadow-xl shadow-gray-200 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-white/60">
                  Order
                </span>

                <span className="font-mono text-sm font-bold text-white">
                  #{order.orderId}
                </span>

                <StatusBadge status={order.orderStatus} />
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                Order management
              </h2>

              <p className="mt-2 text-sm text-white/60">
                Created on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Items
                </p>

                <p className="mt-1 text-xl font-black">
                  {totalItems}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Total
                </p>

                <p className="mt-1 text-xl font-black">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Products */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeader
                title="Order items"
                description={`${items.length} product${
                  items.length !== 1 ? "s" : ""
                } in this order`}
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
                  const image = getProductImage(item);
                  const quantity = Number(item.quantity || 1);
                  const price = Number(item.price || 0);
                  const itemTotal =
                    item.subtotal !== undefined
                      ? Number(item.subtotal || 0)
                      : price * quantity;

                  const variant = item.variant || {};

                  return (
                    <div
                      key={`${item.product?._id || item.product || index}-${index}`}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
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
                            <h3 className="font-bold text-gray-900">
                              {item.name ||
                                item.product?.name ||
                                "Product"}
                            </h3>

                            {item.sku && (
                              <p className="mt-1 text-xs text-gray-400">
                                SKU: {item.sku}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
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

                              {variant.qikinkSku && (
                                <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                  Qikink: {variant.qikinkSku}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-black text-gray-900">
                              {formatCurrency(itemTotal)}
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

            {/* Customer */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeader
                title="Customer information"
                description="Contact details for this order"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Name
                  </p>

                  <p className="mt-2 text-sm font-bold text-gray-900">
                    {order.customer?.firstName || ""}{" "}
                    {order.customer?.lastName || ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Phone
                  </p>

                  <p className="mt-2 text-sm font-bold text-gray-900">
                    {order.customer?.phone || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Email
                  </p>

                  <p className="mt-2 break-all text-sm font-bold text-gray-900">
                    {order.customer?.email || "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeader
                title="Shipping address"
                description="Delivery destination"
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

              <div className="rounded-2xl bg-gray-50 p-5 text-sm leading-7 text-gray-600">
                <p className="font-bold text-gray-900">
                  {order.customer?.firstName || ""}{" "}
                  {order.customer?.lastName || ""}
                </p>

                <p>{order.shippingAddress?.address1 || "—"}</p>

                <p>
                  {order.shippingAddress?.city || ""}
                  {order.shippingAddress?.state
                    ? `, ${order.shippingAddress.state}`
                    : ""}
                </p>

                <p className="font-semibold text-gray-900">
                  {order.shippingAddress?.pincode || ""}
                </p>

                <p>{order.shippingAddress?.country || "India"}</p>
              </div>
            </section>

            {/* Tracking */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeader
                title="Shipment tracking"
                description="Add or update courier tracking information"
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

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-600">
                    Tracking Number
                  </label>

                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) =>
                      setTrackingNumber(e.target.value)
                    }
                    placeholder="Enter tracking number"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-600">
                    Tracking URL
                  </label>

                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) =>
                      setTrackingUrl(e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveTracking}
                  disabled={savingTracking}
                  className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingTracking
                    ? "Saving..."
                    : "Save Tracking Information"}
                </button>
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Status manager */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                title="Update order status"
                description="Change the current order status"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <div
                className={`mb-5 rounded-2xl border p-4 ${currentStatusStyle.bg} ${currentStatusStyle.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Current
                  </span>

                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>

              <label className="mb-2 block text-xs font-bold text-gray-600">
                New status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>

              <div className="mt-3 rounded-xl bg-gray-50 p-3">
                <p className="text-xs leading-5 text-gray-500">
                  {
                    STATUS_OPTIONS.find(
                      (status) =>
                        status.value === selectedStatus
                    )?.description
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={saveStatus}
                disabled={
                  savingStatus ||
                  selectedStatus ===
                    String(order.orderStatus || "").toLowerCase()
                }
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {savingStatus
                  ? "Updating..."
                  : "Update Order Status"}
              </button>
            </section>

            {/* Progress */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                title="Order progress"
                description="Current fulfillment journey"
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

              <AdminOrderTimeline
                status={order.orderStatus}
                returnDecisionReason={order.returnDecisionReason}
              />
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                title="Payment details"
                description="Payment information"
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Method
                  </span>

                  <span className="text-sm font-bold text-gray-900">
                    {String(
                      order.paymentMethod || "COD"
                    ).toUpperCase() === "RAZORPAY"
                      ? "Razorpay"
                      : "Cash on Delivery"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      String(
                        order.paymentStatus || "pending"
                      ).toLowerCase() === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {order.paymentStatus || "pending"}
                  </span>
                </div>

                {order.paymentId && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-400">
                      Payment ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs font-semibold text-gray-700">
                      {order.paymentId}
                    </p>
                  </div>
                )}

                {order.razorpayOrderId && (
                  <div>
                    <p className="text-xs text-gray-400">
                      Razorpay Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs font-semibold text-gray-700">
                      {order.razorpayOrderId}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Financial summary */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                title="Order total"
                description="Financial breakdown"
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-semibold">
                    {shippingCharge === 0
                      ? "FREE"
                      : formatCurrency(shippingCharge)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Discount
                    </span>

                    <span className="font-semibold text-emerald-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-black text-gray-900">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-gray-400">
                      INR
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger zone */}
            {String(order.orderStatus).toLowerCase() !==
              "cancelled" && (
              <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
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
                    <h3 className="text-sm font-bold text-gray-900">
                      Danger zone
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Cancelling an order should only be done when
                      necessary.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openStatusReasonDialog("cancelled")}
                  className="mt-5 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  Cancel Order
                </button>
              </section>
            )}
          </aside>
        </div>
      </main>

      {/* Status reason confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
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
              {reasonStatus === "cancelled"
                ? "Cancel this order?"
                : "Mark as not returned?"}
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              This will notify the customer that the order is{" "}
              <span className="font-bold text-red-600">
                {reasonStatus === "cancelled" ? "cancelled" : "not returned"}
              </span>
              .
            </p>

            <label
              htmlFor="status-reason"
              className="mt-6 block text-left text-sm font-semibold text-gray-700"
            >
              {reasonStatus === "cancelled"
                ? "Cancellation reason"
                : "Reason it was not returned"}
            </label>
            <textarea
              id="status-reason"
              value={statusReason}
              onChange={(event) =>
                setStatusReason(event.target.value)
              }
              maxLength={500}
              rows={3}
              required
              placeholder="Enter the reason shared with the customer"
              className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            />

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setReasonStatus("");
                  setSelectedStatus(
                    String(order.orderStatus || "pending").toLowerCase()
                  );
                  setStatusReason("");
                }}
                disabled={savingStatus}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Keep Current Status
              </button>

              <button
                type="button"
                onClick={submitStatusWithReason}
                disabled={savingStatus || !statusReason.trim()}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {savingStatus
                  ? "Updating..."
                  : reasonStatus === "cancelled"
                    ? "Cancel Order"
                    : "Mark Not Returned"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}