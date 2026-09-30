import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getMyOrders, requestOrderReturn } from "../../lib/orderapi.js";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  placed: {
    label: "Order Placed",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  processing: {
    label: "Processing",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
  packed: {
    label: "Packed",
    className: "bg-purple-50 text-purple-700 border-purple-100",
  },
  shipped: {
    label: "Shipped",
    className: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "bg-orange-50 text-orange-700 border-orange-100",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-100",
  },
};

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

function getStatus(order) {
  const rawStatus = String(
    order?.orderStatus || order?.status || "pending"
  )
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");

  return (
    STATUS_STYLES[rawStatus] || {
      label: rawStatus
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      className: "bg-gray-50 text-gray-700 border-gray-100",
    }
  );
}

function getProductImage(item) {
  if (!item) return "";

  if (item.image) {
    return typeof item.image === "string"
      ? item.image
      : item.image?.url || "";
  }

  if (item.product?.images?.length) {
    const image = item.product.images[0];

    return typeof image === "string"
      ? image
      : image?.url || "";
  }

  if (item.product?.image) {
    return typeof item.product.image === "string"
      ? item.product.image
      : item.product.image?.url || "";
  }

  return "";
}

function getOrderItems(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

function getOrderTotal(order) {
  if (order?.totalAmount !== undefined) {
    return Number(order.totalAmount || 0);
  }

  const subtotal = Number(order?.subtotal || 0);
  const shipping = Number(order?.shippingCharge || 0);
  const discount = Number(order?.discount || 0);

  return subtotal + shipping - discount;
}

function OrderSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[28px] border border-gray-100 bg-white p-5 sm:p-6"
        >
          <div className="flex justify-between gap-4">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-48 rounded bg-gray-100" />
            </div>

            <div className="h-7 w-24 rounded-full bg-gray-100" />
          </div>

          <div className="mt-6 flex gap-3">
            <div className="h-20 w-20 rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/2 rounded bg-gray-100" />
              <div className="h-3 w-1/3 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-[32px] border border-gray-100 bg-white px-6 py-16 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-10">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-100 via-fuchsia-100 to-orange-100">
        <svg
          className="h-11 w-11 text-violet-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
          <path d="M4 7.5L12 12l8-4.5" />
          <path d="M12 12v9" />
        </svg>
      </div>

      <h2 className="mt-7 text-2xl font-black tracking-tight text-gray-900">
        No orders yet
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
        Your Printzenz orders will appear here after you place your first
        order.
      </p>

      <Link
        to="/shop"
        className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-6 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        Start Shopping
      </Link>
    </div>
  );
}
import useAuthuser from "../../hooks/authuser.js";
export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnError, setReturnError] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const { authuser } = useAuthuser();

  const handleRequestReturn = async (event) => {
    event.preventDefault();
    if (!returnOrder) return;

    try {
      setReturnSubmitting(true);
      setReturnError("");

      const response = await requestOrderReturn(
        returnOrder.orderId,
        returnReason
      );
      const updatedOrder = response?.order || response?.data?.order;

      if (!updatedOrder) {
        throw new Error("The return request could not be confirmed.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === returnOrder.orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );
      setReturnOrder(null);
      setReturnReason("");
    } catch (err) {
      setReturnError(err?.message || "Unable to request a return.");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders();

      const data =
        response?.orders ||
        response?.data?.orders ||
        response?.data ||
        [];

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Get my orders error:", err);

      if (
        err?.message?.toLowerCase().includes("unauthorized") ||
        err?.message?.toLowerCase().includes("login")
      ) {
        navigate("/login?redirect=/account/orders");
        return;
      }

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="absolute right-[-100px] top-[30%] h-96 w-96 rounded-full bg-fuchsia-200/20 blur-3xl" />

        <div className="absolute bottom-[-120px] left-[30%] h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/myaccount/${authuser._id}`}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-violet-600"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>

            My Account
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-600">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Account
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                View and track all your Printzenz orders in one place.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Continue Shopping

              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && orders.length > 0 && (
          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400">
                Total Orders
              </p>

              <p className="mt-2 text-2xl font-black text-gray-900">
                {orders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400">
                Processing
              </p>

              <p className="mt-2 text-2xl font-black text-violet-600">
                {
                  orders.filter((order) =>
                    ["processing", "confirmed", "packed"].includes(
                      String(
                        order.orderStatus || order.status || ""
                      )
                        .toLowerCase()
                        .replace(/-/g, "_")
                    )
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400">
                Shipped
              </p>

              <p className="mt-2 text-2xl font-black text-cyan-600">
                {
                  orders.filter((order) =>
                    ["shipped", "out_for_delivery"].includes(
                      String(
                        order.orderStatus || order.status || ""
                      )
                        .toLowerCase()
                        .replace(/-/g, "_")
                    )
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400">
                Delivered
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-600">
                {
                  orders.filter(
                    (order) =>
                      String(
                        order.orderStatus || order.status || ""
                      ).toLowerCase() === "delivered"
                  ).length
                }
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
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

              <div className="flex-1">
                <h3 className="font-bold text-red-900">
                  Unable to load orders
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadOrders}
                  className="mt-3 text-sm font-bold text-red-700 underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <OrderSkeleton />}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <EmptyOrders />
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const items = getOrderItems(order);
              const status = getStatus(order);

              const firstItem = items[0];
              const firstImage = getProductImage(firstItem);
              const orderStatus = String(
                order.orderStatus || order.status || ""
              ).toLowerCase();

              const extraItems = Math.max(items.length - 1, 0);

              return (
                <article
                  key={order._id || order.orderId}
                  className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(79,70,229,0.10)]"
                >
                  {/* Order header */}
                  <div className="border-b border-gray-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-gray-900">
                            #{order.orderId || order._id}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-gray-300" />

                          <span className="text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                          {items.reduce(
                            (total, item) =>
                              total + Number(item.quantity || 0),
                            0
                          )}{" "}
                          {items.reduce(
                            (total, item) =>
                              total + Number(item.quantity || 0),
                            0
                          ) === 1
                            ? "item"
                            : "items"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Product preview */}
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 sm:h-24 sm:w-24">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={firstItem?.name || "Product"}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-gray-900 sm:text-base">
                          {firstItem?.name || "Printzenz Product"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-400">
                          Qty: {firstItem?.quantity || 1}
                        </p>

                        {firstItem?.variant && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {firstItem.variant.size && (
                              <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                                {firstItem.variant.size}
                              </span>
                            )}

                            {firstItem.variant.color && (
                              <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                                {firstItem.variant.color}
                              </span>
                            )}
                          </div>
                        )}

                        {extraItems > 0 && (
                          <p className="mt-2 text-xs font-bold text-violet-600">
                            + {extraItems} more{" "}
                            {extraItems === 1 ? "item" : "items"}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-gray-400">
                          Order total
                        </p>

                        <p className="mt-1 text-lg font-black text-gray-900">
                          {formatCurrency(getOrderTotal(order))}
                        </p>
                      </div>
                    </div>

                    {/* Mobile price */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 sm:hidden">
                      <span className="text-xs text-gray-400">
                        Order total
                      </span>

                      <span className="text-lg font-black text-gray-900">
                        {formatCurrency(getOrderTotal(order))}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      {orderStatus === "delivered" &&
                        (order.returnRequest?.status ? (
                          <span className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-bold text-emerald-700">
                            Return {order.returnRequest.status.toLowerCase()}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReturnOrder(order);
                              setReturnReason("");
                              setReturnError("");
                            }}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200 px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                          >
                            Request Return
                          </button>
                        ))}

                      <Link
                        to={`/track-order?orderId=${encodeURIComponent(
                          order.orderId || order._id
                        )}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-bold text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        Track Order

                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </Link>

                      <Link
                        to={`/account/orders/${encodeURIComponent(
                          order.orderId || order._id
                        )}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-5 text-sm font-bold text-white shadow-md shadow-violet-100 transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        View Order

                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {returnOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm">
            <form
              onSubmit={handleRequestReturn}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2 className="text-lg font-black text-gray-900">
                Request a return
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Submit a return request for order #{returnOrder.orderId}.
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
                  onClick={() => setReturnOrder(null)}
                  disabled={returnSubmitting}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {returnSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}