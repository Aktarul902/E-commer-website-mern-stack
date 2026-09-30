import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Clock3,
  Truck,
  ChevronDown,
  Eye,
  IndianRupee,
} from "lucide-react";
import axiosInstance from "../../lib/axios.js";
import { Link } from "react-router";
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        "/api/orders/admin/all"
      );

      setOrders(
        response.data?.orders ||
          response.data?.data ||
          []
      );
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {

      const orderId = String(
        order.orderId || order.orderNumber || order._id || ""
      ).toLowerCase();

      const customer = String(
        order.user?.email ||
          order.customer?.email ||
          order.shippingAddress?.email ||
          ""
      ).toLowerCase();

      const query = search.toLowerCase();

      const matchesSearch =
        orderId.includes(query) ||
        customer.includes(query);

      const matchesStatus =
        status === "all" ||
        String(order.orderStatus || order.status || "").toLowerCase() === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [orders, search, status]);

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(
        order.totalAmount ||
          order.total ||
          0
      ),
    0
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc]">

      {/* HEADER */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-5 lg:px-8 py-6">

          <div className="flex items-center justify-between">

            <div>
                <Link
            to="/admin"
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <span className="text-lg">←</span>
            Back to Admin
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            Products
          </h1>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <ShoppingBag size={14} />
                SALES
                <span>/</span>
                ORDERS
              </div>

              <h1 className="mt-2 text-3xl font-black">
                Orders
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Track and manage every Printzenz order.
              </p>

            </div>

          </div>

        </div>

      </div>


      <main className="mx-auto max-w-[1500px] px-5 lg:px-8 py-7">


        {/* STATS */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">

          <OrderStat
            title="All orders"
            value={orders.length}
            icon={<ShoppingBag size={19} />}
            color="violet"
          />

          <OrderStat
            title="Pending"
            value={
              orders.filter(
                (o) => String(o.orderStatus || o.status || "").toLowerCase() === "pending"
              ).length
            }
            icon={<Clock3 size={19} />}
            color="amber"
          />

          <OrderStat
            title="Processing"
            value={
              orders.filter(
                (o) => String(o.orderStatus || o.status || "").toLowerCase() === "processing"
              ).length
            }
            icon={<Truck size={19} />}
            color="blue"
          />

          <OrderStat
            title="Revenue"
            value={`₹${totalRevenue.toLocaleString(
              "en-IN"
            )}`}
            icon={<IndianRupee size={19} />}
            color="emerald"
          />

        </div>


        {/* ORDERS CARD */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* TOOLBAR */}

          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search order number or customer..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

            </div>


            <div className="relative">

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-sm font-medium outline-none"
              >
                <option value="all">
                  All orders
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

            </div>

          </div>


          {/* TABLE */}

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (

            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                <ShoppingBag size={28} />
              </div>

              <h3 className="mt-4 font-bold">
                No orders found
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Orders will appear here when customers place them.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-gray-50">

                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-400">

                    <th className="px-5 py-4">
                      Order
                    </th>

                    <th className="px-4 py-4">
                      Customer
                    </th>

                    <th className="px-4 py-4">
                      Date
                    </th>

                    <th className="px-4 py-4">
                      Items
                    </th>

                    <th className="px-4 py-4">
                      Total
                    </th>

                    <th className="px-4 py-4">
                      Payment
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-gray-100">

                  {filteredOrders.map((order) => {

                    const customer =
                      order.user?.email ||
                      order.customer?.email ||
                      order.shippingAddress?.email ||
                      "Guest customer";

                    const total =
                      order.totalAmount ||
                      order.total ||
                      0;

                    const items =
                      order.items?.length ||
                      order.products?.length ||
                      0;

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-violet-50/40 transition"
                      >

                        <td className="px-5 py-5">

                          <p className="font-bold">
                            #
                            {order.orderId || order.orderNumber ||
                              String(order._id).slice(-8)}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {order._id}
                          </p>

                        </td>


                        <td className="px-4 py-5">

                          <p className="text-sm font-semibold">
                            {customer}
                          </p>

                        </td>


                        <td className="px-4 py-5 text-sm text-gray-500">

                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}

                        </td>


                        <td className="px-4 py-5 text-sm font-semibold">
                          {items}
                        </td>


                        <td className="px-4 py-5">

                          <span className="font-black">
                            ₹
                            {Number(
                              total
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </td>


                        <td className="px-4 py-5">

                          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                            {order.paymentMethod ||
                              "—"}
                          </span>

                        </td>


                        <td className="px-4 py-5">
                          <OrderStatus
                            status={order.orderStatus || order.status}
                          />
                        </td>


                        <td className="px-5 py-5">
                        <Link to={`/admin/orders/${order.orderId || order.orderNumber}`}>
                          <button className="rounded-lg p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600">
                            <Eye size={17} />
                          </button>
                        </Link>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
};


const OrderStat = ({
  title,
  value,
  icon,
  color,
}) => {

  const colors = {
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>

    </div>
  );
};


const OrderStatus = ({ status }) => {

  const config = {
    pending: {
      text: "Pending",
      className:
        "bg-amber-50 text-amber-600 border-amber-100",
    },

    processing: {
      text: "Processing",
      className:
        "bg-blue-50 text-blue-600 border-blue-100",
    },

    shipped: {
      text: "Shipped",
      className:
        "bg-violet-50 text-violet-600 border-violet-100",
    },

    delivered: {
      text: "Delivered",
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
    },

    cancelled: {
      text: "Cancelled",
      className:
        "bg-red-50 text-red-600 border-red-100",
    },
  };

  const item =
    config[status] || {
      text: status || "Unknown",
      className:
        "bg-gray-100 text-gray-500 border-gray-200",
    };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${item.className}`}
    >
      {item.text}
    </span>
  );
};

export default Orders;