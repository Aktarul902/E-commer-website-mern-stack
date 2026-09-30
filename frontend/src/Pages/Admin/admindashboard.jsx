import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Package,
  ShoppingBag,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Heart,
  Tag,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Boxes,
  UserPlus,
  Check,
  Clock3,
} from "lucide-react";

import { getAdminProducts } from "../../lib/productapi.js";
import { logoutUser } from "../../lib/api.js";
import {
  getAdminNotifications,
  markAdminNotificationRead,
} from "../../lib/adminapi.js";
import useAuthuser from "../../hooks/authuser.js";
const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authuser } = useAuthuser();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });

  const { data: notificationData } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: getAdminNotifications,
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: markAdminNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Unable to update notification.");
    },
  });

  const products = data?.products || [];
  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  const scrollToNotifications = () => {
    document.getElementById("admin-notification-center")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      queryClient.setQueryData(["authuser"], {
        success: true,
        user: null,
      });
      navigate("/api/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Unable to log out. Please try again.");
    }
  };

  const activeProducts = products.filter(
    (product) => product.isActive !== false
  ).length;

  const featuredProducts = products.filter(
    (product) => product.isFeatured
  ).length;

  const newProducts = products.filter(
    (product) => product.isNewArrival
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            Loading Printzenz dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <Package size={30} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard couldn't load
          </h1>

          <p className="text-gray-500 mt-3">
            {error?.response?.data?.message ||
              error?.message ||
              "Something went wrong."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900">

      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header className="fixed top-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50">

        <div className="h-full flex items-center px-5">

          {/* LOGO */}

          <div className="w-[250px] flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-200">
              <Sparkles
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="font-black text-lg tracking-tight">
                PRINTZENZ
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                Admin Studio
              </p>
            </div>

          </div>

          {/* SEARCH */}

          <div className="flex-1 max-w-2xl">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-20 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 bg-white border border-gray-200 rounded-lg px-2 py-1">
                Ctrl K
              </span>

            </div>

          </div>

          {/* RIGHT */}

          <div className="ml-auto flex items-center gap-4 pl-5">

            <button
              type="button"
              onClick={scrollToNotifications}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              className="relative w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-white text-[10px] font-bold border-2 border-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-3 border-l border-gray-100 pl-5">

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-bold">
                P
              </div>

              <div>
                <p className="text-sm font-semibold">
                   {authuser.firstName} {authuser.lastName} 
                </p>

                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed top-[72px] left-0 bottom-0 w-[250px] bg-white border-r border-gray-100 p-4 z-40 overflow-y-auto">

        <nav className="space-y-1">

          <p className="px-3 pt-2 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Workspace
          </p>

          <AdminNavItem
            icon={<LayoutDashboard size={18} />}
            label="Overview"
            active
            to="/admin"
          />

          <AdminNavItem
            icon={<Package size={18} />}
            label="Products"
            to="/admin/products"
          />

          <AdminNavItem
            icon={<ShoppingBag size={18} />}
            label="Orders"
            to="/admin/orders"
          />

          <AdminNavItem
            icon={<Users size={18} />}
            label="Customers"
            to="/admin/customers"
          />

          <AdminNavItem
            icon={<UserPlus size={18} />}
            label="Create Admin"
            to="/admin/createadmin"
          />


          <p className="px-3 pt-8 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Store
          </p>

          <AdminNavItem
            icon={<Boxes size={18} />}
            label="Categories"
            to="/admin/categories"
          />

          <AdminNavItem
            icon={<Tag size={18} />}
            label="Discounts"
            to="/admin/discounts"
          />


          <p className="px-3 pt-8 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            System
          </p>

          <AdminNavItem
            icon={<Settings size={18} />}
            label="Settings"
            to="/admin/settings"
          />

        </nav>


        {/* STORE STATUS */}

        <div className="mt-8 rounded-2xl p-4 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 border border-fuchsia-100">

          <div className="flex items-center gap-2">

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />

            <span className="text-sm font-semibold">
              Store is live
            </span>

          </div>

          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Your Printzenz storefront is currently online.
          </p>

          <Link
            to="/"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
          >
            View storefront
            <ArrowUpRight size={13} />
          </Link>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
        >

          <LogOut size={18} />

          <span className="text-sm font-medium">
            Logout
          </span>

        </button>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="ml-[250px] pt-[72px]">

        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">


          {/* WELCOME */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white p-8 lg:p-10 mb-7 shadow-xl shadow-fuchsia-100">

            <div className="relative z-10">

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold mb-5">
                <Sparkles size={14} />
                Printzenz Admin
              </div>

              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
                Good evening 👋
              </h2>

              <p className="mt-2 text-white/80 max-w-xl">
                Manage your products, orders and storefront from one beautiful workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/admin/products/new"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
                >
                  <Plus size={17} />
                  Add Product
                </Link>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-sm px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition"
                >
                  View Store
                  <ArrowUpRight size={16} />
                </Link>

              </div>

            </div>


            {/* DECORATIVE SHAPES */}

            <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10" />

            <div className="absolute right-24 -bottom-32 w-80 h-80 rounded-full bg-white/10" />

            <div className="absolute right-12 top-10 w-20 h-20 rounded-3xl bg-white/10 rotate-12" />

          </section>


          {/* =====================================================
              STAT CARDS
          ===================================================== */}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

            <StatCard
              title="Total Products"
              value={products.length}
              icon={<Package size={21} />}
              iconColor="text-violet-600"
              bg="bg-violet-50"
            />

            <StatCard
              title="Active Products"
              value={activeProducts}
              icon={<TrendingUp size={21} />}
              iconColor="text-emerald-600"
              bg="bg-emerald-50"
            />

            <StatCard
              title="Featured Products"
              value={featuredProducts}
              icon={<Heart size={21} />}
              iconColor="text-pink-600"
              bg="bg-pink-50"
            />

            <StatCard
              title="New Arrivals"
              value={newProducts}
              icon={<Sparkles size={21} />}
              iconColor="text-amber-600"
              bg="bg-amber-50"
            />

          </section>


          {/* =====================================================
              MIDDLE SECTION
          ===================================================== */}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-7">


            {/* SALES GRAPH */}

            <div className="xl:col-span-2 bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h3 className="font-bold text-lg">
                    Store Overview
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    Your store activity at a glance
                  </p>
                </div>

                <select className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>

              </div>


              {/* GRAPH */}

              <div className="h-[230px] relative">

                <div className="absolute inset-0 flex flex-col justify-between">

                  {[0, 1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="border-t border-dashed border-gray-100"
                    />
                  ))}

                </div>

                <svg
                  viewBox="0 0 800 220"
                  className="absolute inset-0 w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >

                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.25"
                      />

                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0 180 C80 160 100 175 160 135 C220 95 260 145 320 110 C380 75 420 120 480 85 C540 45 570 95 630 70 C690 45 730 60 800 25 L800 220 L0 220 Z"
                    fill="url(#chartGradient)"
                  />

                  <path
                    d="M0 180 C80 160 100 175 160 135 C220 95 260 145 320 110 C380 75 420 120 480 85 C540 45 570 95 630 70 C690 45 730 60 800 25"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-3">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">

              <h3 className="font-bold text-lg">
                Quick Actions
              </h3>

              <p className="text-sm text-gray-400 mt-1 mb-5">
                Common admin tasks
              </p>

              <div className="space-y-3">

                <QuickAction
                  to="/admin/products/new"
                  icon={<Plus size={19} />}
                  title="Add Product"
                  description="Create a new product"
                  iconClass="bg-violet-100 text-violet-600"
                />

                <QuickAction
                  to="/admin/products"
                  icon={<Package size={19} />}
                  title="Manage Products"
                  description={`${products.length} products`}
                  iconClass="bg-blue-100 text-blue-600"
                />

                <QuickAction
                  to="/admin/orders"
                  icon={<ShoppingBag size={19} />}
                  title="View Orders"
                  description="Manage customer orders"
                  iconClass="bg-emerald-100 text-emerald-600"
                />

                <QuickAction
                  to="/admin/categories"
                  icon={<Boxes size={19} />}
                  title="Categories"
                  description="Organize your products"
                  iconClass="bg-orange-100 text-orange-600"
                />

              </div>

            </div>

          </section>


          <section
            id="admin-notification-center"
            className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-7 scroll-mt-24"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Notification Center</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} unread order ${unreadCount === 1 ? "notification" : "notifications"}`
                    : "You are all caught up"}
                </p>
              </div>
              <Bell size={19} className="text-gray-400" />
            </div>

            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="font-semibold text-gray-700">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  New customer orders will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-5 sm:px-6 py-4 flex items-center gap-4 ${
                      notification.readAt ? "bg-white" : "bg-pink-50/50"
                    }`}
                  >
                    <span
                      className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                        notification.readAt
                          ? "bg-gray-100 text-gray-500"
                          : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      <ShoppingBag size={18} />
                    </span>
                    <Link
                      to={`/admin/orders/${encodeURIComponent(notification.orderId)}`}
                      onClick={() => {
                        if (!notification.readAt) {
                          markReadMutation.mutate(notification._id);
                        }
                      }}
                      className="min-w-0 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </span>
                        {!notification.readAt && (
                          <span className="w-2 h-2 rounded-full bg-pink-600" />
                        )}
                      </span>
                      <span className="block text-sm text-gray-500 truncate mt-0.5">
                        {notification.message}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock3 size={12} />
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </Link>
                    {!notification.readAt && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(notification._id)}
                        disabled={markReadMutation.isPending}
                        aria-label="Mark notification as read"
                        title="Mark as read"
                        className="shrink-0 w-9 h-9 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center disabled:opacity-50"
                      >
                        <Check size={17} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>


          {/* =====================================================
              PRODUCTS
          ===================================================== */}

          <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h3 className="font-bold text-lg">
                  Recent Products
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Recently added products to your store
                </p>

              </div>

              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
              >
                View all
                <ChevronRight size={16} />
              </Link>

            </div>


            {products.length === 0 ? (

              <div className="py-16 text-center">

                <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package size={28} />
                </div>

                <h4 className="font-bold text-lg">
                  No products yet
                </h4>

                <p className="text-gray-400 text-sm mt-1">
                  Start building your Printzenz catalog.
                </p>

                <Link
                  to="/admin/products/new"
                  className="inline-flex items-center gap-2 mt-5 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800"
                >
                  <Plus size={16} />
                  Create Product
                </Link>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 p-6">

                {products.slice(0, 8).map((product) => (

                  <Link
                    key={product._id}
                    to={`/admin/products/${product._id}`}
                    className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                  >

                    <div className="aspect-square bg-gray-50 overflow-hidden">

                      {product.images?.[0] ? (

                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={38} />
                        </div>

                      )}

                    </div>

                    <div className="p-4">

                      <p className="font-semibold truncate">
                        {product.name}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {product.category || "Uncategorized"}
                      </p>

                      <div className="flex items-center justify-between mt-4">

                        <span className="font-bold">
                          ₹{product.price}
                        </span>

                        <span className="text-xs font-semibold text-emerald-600">
                          {product.isActive === false
                            ? "Inactive"
                            : "Active"}
                        </span>

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
};


/* =============================================================
   COMPONENTS
============================================================= */

const AdminNavItem = ({
  icon,
  label,
  to,
  active = false,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};


const StatCard = ({
  title,
  value,
  icon,
  iconColor,
  bg,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-[22px] p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-start justify-between">

        <div
          className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}
        >
          <span className={iconColor}>
            {icon}
          </span>
        </div>

        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
          <TrendingUp size={13} />
          Live
        </span>

      </div>

      <p className="text-sm text-gray-400 mt-5">
        {title}
      </p>

      <p className="text-3xl font-black mt-1">
        {value}
      </p>

    </div>
  );
};


const QuickAction = ({
  to,
  icon,
  title,
  description,
  iconClass,
}) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition group"
    >

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-gray-400 truncate">
          {description}
        </p>

      </div>

      <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-gray-600"
      />

    </Link>
  );
};


export default AdminDashboard;