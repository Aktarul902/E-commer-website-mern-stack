import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Pencil,
  ShoppingBag,
  Mail,
  Check,
  X,
} from "lucide-react";

import useAuthuser from "../hooks/authuser.js";
import { updateProfile, logoutUser } from "../lib/api.js";
import { getRecentOrders } from "../lib/orderapi.js";


const accountMenu = [
  {
    label: "My Orders",
    description: "Track and manage your orders",
    icon: Package,
    to: "/account/orders",
  },
  {
    label: "Wishlist",
    description: "Your saved products",
    icon: Heart,
    to: "/wishlist",
  },
  {
    label: "Addresses",
    description: "Manage your delivery addresses",
    icon: MapPin,
    to: "/account/addresses",
  },
  {
    label: "Account Settings",
    description: "Update your personal information",
    icon: Settings,
    to: "/account/account/setting",
  },
];

export default function MyAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoading, authuser } = useAuthuser();

  const [currentUser, setCurrentUser] = useState(null);

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // --------------------------------------------------
  // Set local user from authentication hook
  // --------------------------------------------------
  useEffect(() => {
    if (authuser) {
      setCurrentUser(authuser);

      setFormData({
        firstName: authuser.firstName || "",
        lastName: authuser.lastName || "",
        email: authuser.email || "",
      });
    }
  }, [authuser]);

  const loadRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await getRecentOrders();
      const data =
        response?.orders ||
        response?.data?.orders ||
        [];

      setRecentOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Get recent orders error:", error);
      setOrdersError(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to load recent orders."
      );
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!authuser?._id) {
      setRecentOrders([]);
      setOrdersLoading(false);
      setOrdersError("");
      return;
    }

    loadRecentOrders();
  }, [authuser?._id]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6f2]">
        <div className="account-loading text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dce4dc] border-t-[#285b43]" />

          <p className="mt-4 text-sm font-medium text-[#68756c]">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Not logged in
  // --------------------------------------------------
  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6f2] px-5">
        <div className="account-enter w-full max-w-md rounded-2xl border border-[#e2e7e1] bg-white p-8 text-center shadow-[0_18px_60px_-40px_rgba(24,48,35,0.3)]">
          <p className="text-[#68756c]">
            Your session has expired.
          </p>

          <button
            onClick={() => navigate("/api/login")}
            className="mt-5 rounded-lg bg-[#183b2b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285b43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82b397] focus-visible:ring-offset-2"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Edit profile
  // --------------------------------------------------
  const handleEdit = () => {
    setFormData({
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      email: currentUser.email || "",
    });

    setProfileError("");
    setProfileSuccess("");
    setIsEditing(true);
  };

  // --------------------------------------------------
  // Cancel editing
  // --------------------------------------------------
  const handleCancelEdit = () => {
    setFormData({
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      email: currentUser.email || "",
    });

    setProfileError("");
    setProfileSuccess("");
    setIsEditing(false);
  };

  // --------------------------------------------------
  // Input change
  // --------------------------------------------------
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Save profile
  // --------------------------------------------------
  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();

    if (!firstName || !lastName || !email) {
      setProfileError(
        "First name, last name and email are required."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await updateProfile({
        firstName,
        lastName,
        email,
      });

      console.log("Updated user from API:", response.user);

      if (!response?.user) {
        throw new Error(
          "Updated user information was not returned by the server."
        );
      }

      // ----------------------------------------------
      // THIS IS THE IMPORTANT FIX
      // Replace old frontend user with updated user
      // ----------------------------------------------
      setCurrentUser(response.user);

      // Also update form with latest server data
      setFormData({
        firstName: response.user.firstName || "",
        lastName: response.user.lastName || "",
        email: response.user.email || "",
      });

      setIsEditing(false);

      setProfileSuccess(
        "Personal information updated successfully."
      );
    } catch (error) {
      console.error("Update profile error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update your personal information.";

      setProfileError(message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await logoutUser();
      queryClient.setQueryData(["authuser"], {
        success: true,
        user: null,
      });
      setShowLogout(false);
      navigate("/api/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutError(
        error?.message || "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const fullName =
    `${currentUser.firstName || ""} ${
      currentUser.lastName || ""
    }`.trim();

  const initials =
    `${currentUser.firstName?.charAt(0) || ""}${
      currentUser.lastName?.charAt(0) || ""
    }`.toUpperCase();

  const getStatusMeta = (status) => {
    const normalized = String(status || "pending")
      .toLowerCase()
      .replace(/_/g, " ");

    const map = {
      pending: {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
      },
      confirmed: {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
      },
      processing: {
        label: "Processing",
        className: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
      },
      shipped: {
        label: "Shipped",
        className: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
      },
      delivered: {
        label: "Delivered",
        className: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 ring-1 ring-red-200",
      },
      returned: {
        label: "Returned",
        className: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
      },
    };

    return map[normalized] || {
      label: normalized || "Pending",
      className: "bg-gray-100 text-gray-700",
    };
  };

  return (
    <main className="account-page relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.18),transparent_30%),linear-gradient(135deg,#fdf2f8_0%,#faf5ff_28%,#fff7ed_100%)] text-[#17251c]">
      <style>{`
        @keyframes account-enter {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes drift-slow {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(18px, -24px, 0) scale(1.08); }
          100% { transform: translate3d(-12px, 22px, 0) scale(1); }
        }
        @keyframes pulse-soft {
          0%, 100% { box-shadow: 0 0 0 rgba(99, 102, 241, 0.0); }
          50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.18); }
        }
        .account-page .account-enter {
          animation: account-enter 640ms cubic-bezier(.2,.7,.2,1) both;
        }
        .account-page .account-delay-1 { animation-delay: 70ms; }
        .account-page .account-delay-2 { animation-delay: 140ms; }
        .account-page .account-delay-3 { animation-delay: 210ms; }
        .account-page .account-float { animation: drift-slow 12s ease-in-out infinite alternate; }
        .account-page .account-pulse { animation: pulse-soft 3.4s ease-in-out infinite; }
        .account-page .account-card {
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .account-page .account-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 42px -24px rgba(31, 41, 55, 0.35);
        }
        @media (prefers-reduced-motion: reduce) {
          .account-page .account-enter,
          .account-page .account-float,
          .account-page .account-pulse {
            animation: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="account-float absolute -left-16 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.35),transparent_65%)] blur-3xl" />
        <div className="account-float absolute right-8 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.22),transparent_65%)] blur-3xl" style={{ animationDelay: '1.5s' }} />
        <div className="account-float absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(251,146,60,0.18),transparent_65%)] blur-3xl" style={{ animationDelay: '2.8s' }} />
      </div>
      {/* --------------------------------------------- */}
      {/* Breadcrumb */}
      {/* --------------------------------------------- */}
      <div className="relative border-b border-white/60 bg-white/65 backdrop-blur-sm">
        <div className="mx-auto max-w-[1320px] px-5 py-3.5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-[13px]">
            <Link
              to="/"
              className="text-[#778179] transition-colors hover:text-[#285b43]"
            >
              Home
            </Link>

            <ChevronRight
              size={14}
              className="text-[#a5afa7]"
            />

            <span className="font-semibold text-[#2f4939]">
              My Account
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Main */}
      {/* --------------------------------------------- */}
      <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* Page heading */}
        <div className="account-enter mb-8 flex flex-col gap-5 border-b border-[#dfe6de] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#476d5b]">
              <span className="h-px w-7 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />
              Your Printzenz account
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#183b2b] sm:text-4xl lg:text-[2.6rem]">
              Welcome back, <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">{currentUser.firstName}</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#5d6c63]">
              Keep your profile, orders, and delivery details in one place.
            </p>
          </div>

          <div className="account-pulse inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-200 bg-gradient-to-r from-violet-50 via-white to-pink-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-700 shadow-[0_10px_30px_-18px_rgba(168,85,247,0.7)]">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
            Account active
          </div>
        </div>

        {/* --------------------------------------------- */}
        {/* Main Grid */}
        {/* --------------------------------------------- */}
        <div className="grid items-start gap-6 lg:grid-cols-[285px_minmax(0,1fr)] lg:gap-8">
          {/* ------------------------------------------- */}
          {/* Sidebar */}
          {/* ------------------------------------------- */}
          <aside className="account-enter account-delay-1 account-card h-fit overflow-hidden rounded-[28px] border border-[#dfe6de] bg-white/80 shadow-[0_18px_60px_-35px_rgba(24,48,35,0.45)] backdrop-blur-sm lg:sticky lg:top-24">
            {/* Profile */}
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#4c1d95_0%,#7c3aed_28%,#ec4899_100%)] p-5 text-white">
              <div className="absolute inset-y-0 right-0 w-28 bg-[linear-gradient(135deg,transparent_28%,rgba(255,255,255,0.1)_28%,rgba(255,255,255,0.1)_58%,transparent_58%)]" />
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[linear-gradient(135deg,#dff5e5,#f5fffb)] text-lg font-bold text-[#214b34] shadow-[0_12px_24px_-10px_rgba(255,255,255,0.7)]">
                  {initials}
                </div>

                <div className="relative min-w-0">
                  <h2 className="truncate text-[15px] font-semibold tracking-wide">
                    {fullName}
                  </h2>

                  <p className="mt-1 truncate text-xs text-white/70">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <nav className="space-y-1 p-3">
              <Link
                to="/myaccount"
                className="flex items-center gap-3 rounded-2xl border border-[#dce8dd] bg-[linear-gradient(135deg,#eef8f1,#f6fbf7)] px-3.5 py-3 text-sm font-semibold text-[#214b34] shadow-[0_8px_18px_-14px_rgba(34,197,94,0.45)]"
              >
                <User size={18} />
                Account Overview
              </Link>

              {accountMenu.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-[#66736a] transition-all duration-300 hover:bg-[linear-gradient(135deg,#f6f8ff,#f4fbf5)] hover:text-[#214b34] hover:shadow-[0_10px_20px_-18px_rgba(30,64,175,0.6)]"
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#819187] transition-colors group-hover:text-[#3b7750]"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] font-normal text-[#98a29b]">
                        {item.description}
                      </span>
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-[#aab3ac] transition group-hover:translate-x-0.5 group-hover:text-[#3b7750]"
                    />
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => setShowLogout(true)}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#a84e45] transition-colors hover:bg-[#fff1ed]"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </aside>

          {/* ------------------------------------------- */}
          {/* Content */}
          {/* ------------------------------------------- */}
          <section className="space-y-6">
            {/* ----------------------------------------- */}
            {/* Personal Information */}
            {/* ----------------------------------------- */}
            <div className="account-enter account-delay-1 account-card rounded-[28px] border border-[#dfe6de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,248,0.92))] p-5 shadow-[0_18px_50px_-35px_rgba(37,99,235,0.4)] sm:p-7">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-[#183b2b] sm:text-xl">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-[#78847b]">
                    Your basic account information
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-2 rounded-xl border border-violet-200 bg-[linear-gradient(135deg,#f5f3ff,#fff1f2)] px-3 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:shadow-[0_12px_24px_-18px_rgba(168,85,247,0.65)]"
                  >
                    <Pencil size={15} />

                    <span className="hidden sm:inline">
                      Edit
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={15} />
                    Cancel
                  </button>
                )}
              </div>

              {/* --------------------------------------- */}
              {/* View Mode */}
              {/* --------------------------------------- */}
              {!isEditing && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <div className="rounded-xl border border-[#edf0eb] bg-[#f8faf7] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#849187]">
                        <User size={14} />
                        Full Name
                      </div>

                      <p className="font-semibold text-[#294433]">
                        {fullName}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="rounded-xl border border-[#edf0eb] bg-[#f8faf7] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#849187]">
                        <Mail size={14} />
                        Email
                      </div>

                      <p className="break-all font-semibold text-[#294433]">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Success */}
                  {profileSuccess && (
                    <div className="mt-4 rounded-lg border border-[#d7e8d9] bg-[#f0f7ef] px-4 py-3 text-sm font-medium text-[#397149]">
                      {profileSuccess}
                    </div>
                  )}
                </>
              )}

              {/* --------------------------------------- */}
              {/* Edit Mode */}
              {/* --------------------------------------- */}
              {isEditing && (
                <form onSubmit={handleSaveProfile}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* First Name */}
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={saving}
                        required
                        autoComplete="given-name"
                        className="w-full rounded-xl border border-[#dfe6de] bg-white/90 px-4 py-3 text-sm text-[#233a2b] outline-none transition placeholder:text-[#a2aca4] focus:border-[#4c805d] focus:ring-2 focus:ring-[#4c805d]/20 disabled:bg-[#f7f8f6]"
                        placeholder="Enter first name"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={saving}
                        required
                        autoComplete="family-name"
                        className="w-full rounded-xl border border-[#dfe6de] bg-white/90 px-4 py-3 text-sm text-[#233a2b] outline-none transition placeholder:text-[#a2aca4] focus:border-[#4c805d] focus:ring-2 focus:ring-[#4c805d]/20 disabled:bg-[#f7f8f6]"
                        placeholder="Enter last name"
                      />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={saving}
                          required
                          autoComplete="email"
                          className="w-full rounded-xl border border-[#dfe6de] bg-white/90 py-3 pl-11 pr-4 text-sm text-[#233a2b] outline-none transition placeholder:text-[#a2aca4] focus:border-[#4c805d] focus:ring-2 focus:ring-[#4c805d]/20 disabled:bg-[#f7f8f6]"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {profileError && (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {profileError}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#6d28d9,#8b5cf6,#ec4899)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_28px_-16px_rgba(168,85,247,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={17} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ----------------------------------------- */}
            {/* Quick Access */}
            {/* ----------------------------------------- */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-950">
                Quick Access
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {accountMenu.slice(0, 3).map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="account-card group rounded-[26px] border border-[#e9edf6] bg-[linear-gradient(135deg,#ffffff,#f5f7ff)] p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:border-[#c7d4ff] hover:shadow-[0_22px_50px_-24px_rgba(59,130,246,0.35)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3e8ff,#fce7f3)] text-violet-700 transition group-hover:bg-[linear-gradient(135deg,#8b5cf6,#ec4899)] group-hover:text-white">
                          <Icon size={21} />
                        </div>

                        <ChevronRight
                          size={19}
                          className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-950"
                        />
                      </div>

                      <h3 className="mt-5 font-bold text-gray-950">
                        {item.label}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------- */}
            {/* Recent Orders */}
            {/* ----------------------------------------- */}
            <div className="account-card overflow-hidden rounded-[30px] border border-[#e8ecf4] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] shadow-[0_25px_60px_-38px_rgba(30,64,175,0.4)]">
              <div className="flex items-center justify-between border-b border-[#edf1f8] bg-[linear-gradient(135deg,rgba(245,243,255,0.9),rgba(253,242,248,0.9))] p-5 sm:p-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">
                    Recent Orders
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your latest purchases
                  </p>
                </div>

                <Link
                  to="/account/orders"
                  className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {ordersLoading ? (
                  <div className="p-5 text-sm text-gray-500 sm:p-6">
                    Loading recent orders...
                  </div>
                ) : ordersError ? (
                  <div className="p-5 text-sm text-red-600 sm:p-6">
                    {ordersError}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="p-5 text-sm text-gray-500 sm:p-6">
                    You have no recent orders yet.
                  </div>
                ) : (
                  recentOrders.map((order) => {
                    const orderId = order.orderId || order._id;
                    const statusMeta = getStatusMeta(order.orderStatus);

                    return (
                      <Link
                        key={order._id || orderId}
                        to={`/account/orders/${encodeURIComponent(orderId)}`}
                        className="group flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                            <ShoppingBag size={19} />
                          </div>

                          <div>
                            <p className="font-bold text-gray-950">
                              {orderId}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              · {Array.isArray(order.items) ? order.items.length : 0}{" "}
                              {Array.isArray(order.items) && order.items.length === 1
                                ? "item"
                                : "items"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <div
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </div>

                          <span className="font-bold text-gray-950">
                            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                          </span>

                          <ChevronRight
                            size={18}
                            className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-950"
                          />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Logout Modal */}
      {/* --------------------------------------------- */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogOut size={24} />
            </div>

            <h2 className="mt-5 text-center text-xl font-bold text-gray-950">
              Logout from Printzenz?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              You can always sign back in to access your orders and
              account.
            </p>

            {logoutError && (
              <p role="alert" className="mt-3 text-center text-sm text-red-600">
                {logoutError}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogout(false)}
                disabled={loggingOut}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}