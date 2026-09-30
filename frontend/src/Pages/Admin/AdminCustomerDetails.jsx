import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  IndianRupee,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  User,
  UserCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";


export default function AdminCustomerDetails() {
  const navigate = useNavigate();

  const { email } = useParams();

  const customerEmail = useMemo(() => {
    try {
      return decodeURIComponent(
        email || ""
      );
    } catch {
      return email || "";
    }
  }, [email]);


  const [customer, setCustomer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);


  // ==================================================
  // FETCH CUSTOMER
  // ==================================================

  const fetchCustomer = async () => {
    if (!customerEmail) {
      setError(
        "Customer email is missing."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/admin/customers/${encodeURIComponent(
            customerEmail
          )}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load customer."
        );
      }

      const customerData =
        data?.customer ||
        data?.data?.customer ||
        data?.data;

      if (!customerData) {
        throw new Error(
          "Customer data was not found."
        );
      }

      setCustomer(
        customerData
      );
    } catch (error) {
      console.error(
        "Admin customer details error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load customer."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCustomer();
  }, [customerEmail]);


  // ==================================================
  // HELPERS
  // ==================================================

  const getCustomerName = () => {
    if (!customer) {
      return "Customer";
    }

    if (
      customer.fullName
    ) {
      return customer.fullName;
    }

    if (
      customer.name
    ) {
      return customer.name;
    }

    const firstName =
      customer.firstName || "";

    const lastName =
      customer.lastName || "";

    return (
      `${firstName} ${lastName}`.trim() ||
      "Customer"
    );
  };


  const getInitials = () => {
    const name =
      getCustomerName();

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length >= 2) {
      return (
        `${parts[0][0]}${parts[1][0]}`
      ).toUpperCase();
    }

    return (
      name
        .slice(0, 2)
        .toUpperCase() ||
      "CU"
    );
  };


  const getPhone = () => {
    return (
      customer?.phone ||
      customer?.mobile ||
      customer?.customer?.phone ||
      "Not provided"
    );
  };


  const getStatus = () => {
    if (
      customer?.status
    ) {
      return String(
        customer.status
      ).toLowerCase();
    }

    if (
      customer?.isBlocked
    ) {
      return "blocked";
    }

    if (
      customer?.isActive === false
    ) {
      return "inactive";
    }

    return "active";
  };


  const getOrders = () => {
    const orders =
      customer?.orders ||
      customer?.recentOrders ||
      [];

    return Array.isArray(
      orders
    )
      ? orders
      : [];
  };


  const getOrderCount = () => {
    return Number(
      customer?.orderCount ??
        customer?.ordersCount ??
        customer?.totalOrders ??
        getOrders().length ??
        0
    );
  };


  const getTotalSpent = () => {
    return Number(
      customer?.totalSpent ??
        customer?.lifetimeValue ??
        customer?.totalAmount ??
        0
    );
  };


  const getAverageOrderValue = () => {
    const orders =
      getOrderCount();

    if (!orders) {
      return 0;
    }

    return (
      getTotalSpent() /
      orders
    );
  };


  const getCreatedDate = () => {
    return (
      customer?.createdAt ||
      customer?.joinedAt ||
      customer?.registeredAt ||
      null
    );
  };


  const getLastOrderDate = () => {
    return (
      customer?.lastOrderAt ||
      customer?.lastOrderDate ||
      null
    );
  };


  const formatCurrency = (
    amount
  ) => {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    );
  };


  const formatDate = (
    date,
    includeTime = false
  ) => {
    if (!date) {
      return "—";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "—";
    }

    if (includeTime) {
      return parsed.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const getOrderId = (
    order
  ) => {
    return (
      order?.orderId ||
      order?.orderNumber ||
      order?._id ||
      "Order"
    );
  };


  const getOrderTotal = (
    order
  ) => {
    return Number(
      order?.totalAmount ??
        order?.total ??
        order?.amount ??
        0
    );
  };


  const getOrderStatus = (
    order
  ) => {
    return (
      order?.orderStatus ||
      order?.status ||
      "pending"
    );
  };


  const getOrderItemsCount = (
    order
  ) => {
    if (
      Array.isArray(
        order?.items
      )
    ) {
      return order.items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item?.quantity || 1
          ),
        0
      );
    }

    return Number(
      order?.itemCount ||
        order?.quantity ||
        0
    );
  };


  const getAddresses = () => {
    const addresses =
      customer?.addresses ||
      customer?.shippingAddresses ||
      [];

    return Array.isArray(
      addresses
    )
      ? addresses
      : [];
  };


  // ==================================================
  // COPY EMAIL
  // ==================================================

  const handleCopyEmail =
    async () => {
      try {
        await navigator.clipboard.writeText(
          customerEmail
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch {
        console.error(
          "Unable to copy email"
        );
      }
    };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">

        <Navbar />

        <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

          <div className="h-5 w-32 animate-pulse rounded-full bg-gray-200" />

          <div className="mt-6 h-64 animate-pulse rounded-[32px] bg-white shadow-sm" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-3xl bg-white"
                />
              )
            )}

          </div>


          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">

            <div className="h-[500px] animate-pulse rounded-3xl bg-white" />

            <div className="h-[500px] animate-pulse rounded-3xl bg-white" />

          </div>

        </main>

      </div>
    );
  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">

        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10">

          <div className="w-full rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <XCircle
                size={28}
              />
            </div>


            <h1 className="mt-5 text-2xl font-black text-gray-950">
              Customer not found
            </h1>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {error}
            </p>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={
                  fetchCustomer
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                <RefreshCw
                  size={16}
                />

                Try Again
              </button>


              <Link
                to="/admin/customers"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft
                  size={16}
                />

                Customers
              </Link>

            </div>

          </div>

        </main>

      </div>
    );
  }


  const name =
    getCustomerName();

  const phone =
    getPhone();

  const status =
    getStatus();

  const orders =
    getOrders();

  const addresses =
    getAddresses();

  const orderCount =
    getOrderCount();

  const totalSpent =
    getTotalSpent();

  const averageOrderValue =
    getAverageOrderValue();


  return (
    <div
      className="min-h-screen bg-[#f7f7f8] text-gray-950"
      onClick={() =>
        setMenuOpen(false)
      }
    >

      <Navbar />


      {/* ================================================== */}
      {/* BACKGROUND */}
      {/* ================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-200/25 blur-3xl" />

        <div
          className="absolute -right-40 top-[500px] h-[500px] w-[500px] animate-pulse rounded-full bg-pink-200/20 blur-3xl"
          style={{
            animationDelay:
              "1.5s",
          }}
        />

      </div>


      <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">


        {/* ================================================== */}
        {/* BREADCRUMB */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">

          <Link
            to="/admin"
            className="text-gray-400 transition hover:text-gray-950"
          >
            Admin
          </Link>

          <ChevronRight
            size={15}
            className="text-gray-300"
          />

          <Link
            to="/admin/customers"
            className="text-gray-400 transition hover:text-gray-950"
          >
            Customers
          </Link>

          <ChevronRight
            size={15}
            className="text-gray-300"
          />

          <span className="max-w-[220px] truncate font-medium text-gray-700">
            {name}
          </span>

        </div>


        {/* ================================================== */}
        {/* CUSTOMER HERO */}
        {/* ================================================== */}

        <section className="relative overflow-hidden rounded-[32px] bg-gray-950 p-6 text-white shadow-2xl sm:p-8 lg:p-10">

          {/* Animated glow */}

          <div className="absolute -right-24 -top-32 h-96 w-96 animate-pulse rounded-full bg-violet-500/25 blur-3xl" />

          <div
            className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-pink-500/10 blur-3xl"
            style={{
              animationDelay:
                "1s",
            }}
          />


          <div className="relative">

            {/* Top actions */}

            <div className="mb-8 flex items-center justify-between">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/customers"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
              >
                <ArrowLeft
                  size={16}
                />

                Back to Customers
              </button>


              <div className="relative">

                <button
                  type="button"
                  onClick={(
                    event
                  ) => {
                    event.stopPropagation();

                    setMenuOpen(
                      (value) =>
                        !value
                    );
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/15 hover:text-white"
                >
                  <MoreHorizontal
                    size={19}
                  />
                </button>


                {menuOpen && (
                  <div
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 text-gray-900 shadow-2xl"
                  >

                    <a
                      href={`mailto:${customerEmail}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Mail
                        size={16}
                      />

                      Send Email
                    </a>


                    {phone !==
                      "Not provided" && (
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                      >
                        <Phone
                          size={16}
                        />

                        Call Customer
                      </a>
                    )}

                  </div>
                )}

              </div>

            </div>


            {/* Customer information */}

            <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

                {/* Avatar */}

                <div className="relative">

                  {customer?.avatar ? (
                    <img
                      src={
                        customer.avatar
                      }
                      alt={name}
                      className="h-24 w-24 rounded-[28px] object-cover shadow-2xl ring-4 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 text-2xl font-black shadow-2xl ring-4 ring-white/10">
                      {getInitials()}
                    </div>
                  )}


                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border-4 border-gray-950 bg-emerald-500 text-white">
                    <CheckCircle2
                      size={15}
                    />
                  </div>

                </div>


                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="truncate text-3xl font-black tracking-tight sm:text-4xl">
                      {name}
                    </h1>


                    <CustomerStatus
                      status={
                        status
                      }
                      dark
                    />

                  </div>


                  <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">

                    <button
                      type="button"
                      onClick={
                        handleCopyEmail
                      }
                      className="group flex min-w-0 items-center gap-2 text-left transition hover:text-white"
                    >
                      <Mail
                        size={15}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {customerEmail}
                      </span>

                      {copied ? (
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-emerald-400"
                        />
                      ) : (
                        <Copy
                          size={13}
                          className="shrink-0 opacity-0 transition group-hover:opacity-100"
                        />
                      )}

                    </button>


                    {phone !==
                      "Not provided" && (
                      <>
                        <span className="hidden text-gray-700 sm:block">
                          •
                        </span>

                        <span className="flex items-center gap-2">
                          <Phone
                            size={15}
                          />

                          {phone}
                        </span>
                      </>
                    )}

                  </div>


                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300">
                      <CalendarDays
                        size={13}
                      />

                      Customer since{" "}
                      {formatDate(
                        getCreatedDate()
                      )}
                    </span>


                    {getLastOrderDate() && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300">
                        <Clock3
                          size={13}
                        />

                        Last order{" "}
                        {formatDate(
                          getLastOrderDate()
                        )}
                      </span>
                    )}

                  </div>

                </div>

              </div>


              {/* Hero actions */}

              <div className="flex shrink-0 flex-wrap gap-3">

                <a
                  href={`mailto:${customerEmail}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:-translate-y-0.5 hover:bg-gray-100"
                >
                  <Mail
                    size={16}
                  />

                  Email
                </a>


                {phone !==
                  "Not provided" && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <Phone
                      size={16}
                    />

                    Call
                  </a>
                )}

              </div>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* STAT CARDS */}
        {/* ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <ProfileStat
            icon={
              <ShoppingBag
                size={20}
              />
            }
            label="Total Orders"
            value={orderCount}
            description="Orders placed"
            iconClass="bg-violet-50 text-violet-600"
          />


          <ProfileStat
            icon={
              <IndianRupee
                size={20}
              />
            }
            label="Total Spent"
            value={`₹${formatCurrency(
              totalSpent
            )}`}
            description="Lifetime customer value"
            iconClass="bg-emerald-50 text-emerald-600"
          />


          <ProfileStat
            icon={
              <TrendingIcon />
            }
            label="Average Order"
            value={`₹${formatCurrency(
              averageOrderValue
            )}`}
            description="Average order value"
            iconClass="bg-blue-50 text-blue-600"
          />


          <ProfileStat
            icon={
              <MapPin
                size={20}
              />
            }
            label="Addresses"
            value={
              addresses.length
            }
            description="Saved addresses"
            iconClass="bg-orange-50 text-orange-600"
          />

        </section>


        {/* ================================================== */}
        {/* MAIN CONTENT */}
        {/* ================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">


          {/* ================================================== */}
          {/* RECENT ORDERS */}
          {/* ================================================== */}

          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Package
                      size={17}
                    />
                  </div>

                  <h2 className="text-lg font-black">
                    Recent Orders
                  </h2>

                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Latest purchases from this customer
                </p>

              </div>


              {orderCount >
                0 && (
                <Link
                  to={`/admin/orders?customer=${encodeURIComponent(
                    customerEmail
                  )}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-gray-500 transition hover:text-gray-950"
                >
                  View All

                  <ArrowUpRight
                    size={14}
                  />
                </Link>
              )}

            </div>


            {orders.length ===
            0 ? (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <ShoppingBag
                    size={23}
                  />
                </div>

                <h3 className="mt-4 font-black">
                  No orders yet
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  This customer has not placed any orders.
                </p>

              </div>
            ) : (
              <div>

                {orders
                  .slice(0, 6)
                  .map(
                    (
                      order,
                      index
                    ) => (
                      <OrderRow
                        key={
                          order?._id ||
                          order?.orderId ||
                          index
                        }
                        order={
                          order
                        }
                        formatDate={
                          formatDate
                        }
                        formatCurrency={
                          formatCurrency
                        }
                        getOrderItemsCount={
                          getOrderItemsCount
                        }
                      />
                    )
                  )}

              </div>
            )}

          </div>


          {/* ================================================== */}
          {/* CUSTOMER INFORMATION */}
          {/* ================================================== */}

          <div className="space-y-6">


            {/* Personal information */}

            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">

              <SectionTitle
                icon={
                  <UserRound
                    size={17}
                  />
                }
                title="Customer Information"
                subtitle="Personal account details"
              />


              <div className="mt-6 space-y-4">

                <InfoRow
                  icon={
                    <User
                      size={16}
                    />
                  }
                  label="Full Name"
                  value={name}
                />


                <InfoRow
                  icon={
                    <Mail
                      size={16}
                    />
                  }
                  label="Email"
                  value={
                    customerEmail
                  }
                  copyable
                  onCopy={
                    handleCopyEmail
                  }
                />


                <InfoRow
                  icon={
                    <Phone
                      size={16}
                    />
                  }
                  label="Phone"
                  value={phone}
                />


                <InfoRow
                  icon={
                    <CalendarDays
                      size={16}
                    />
                  }
                  label="Registered"
                  value={formatDate(
                    getCreatedDate(),
                    true
                  )}
                />

              </div>

            </div>


            {/* Account status */}

            <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

              <div className="p-6">

                <SectionTitle
                  icon={
                    <UserCheck
                      size={17}
                    />
                  }
                  title="Account Status"
                  subtitle="Current customer state"
                />


                <div className="mt-6 rounded-2xl bg-gray-50 p-4">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <StatusDot
                          status={
                            status
                          }
                        />
                      </div>

                      <div>

                        <p className="text-sm font-black text-gray-950">
                          {formatStatus(
                            status
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Customer account
                        </p>

                      </div>

                    </div>


                    <CustomerStatus
                      status={
                        status
                      }
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* ADDRESSES */}
        {/* ================================================== */}

        <section className="mt-6 rounded-3xl border border-gray-200/80 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <SectionTitle
              icon={
                <MapPin
                  size={17}
                />
              }
              title="Saved Addresses"
              subtitle="Customer delivery addresses"
            />

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-500">
              {addresses.length}{" "}
              saved
            </span>

          </div>


          {addresses.length ===
          0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <MapPin
                  size={23}
                />
              </div>

              <p className="mt-4 font-black text-gray-950">
                No saved addresses
              </p>

              <p className="mt-1 text-sm text-gray-400">
                This customer has no saved delivery address.
              </p>

            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">

              {addresses.map(
                (
                  address,
                  index
                ) => (
                  <AddressCard
                    key={
                      address?._id ||
                      index
                    }
                    address={
                      address
                    }
                  />
                )
              )}

            </div>
          )}

        </section>


        {/* ================================================== */}
        {/* CUSTOMER INSIGHT */}
        {/* ================================================== */}

        <section className="mt-6 grid gap-4 md:grid-cols-2">

          <div className="relative overflow-hidden rounded-3xl bg-violet-50 p-6">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-200/50 blur-2xl" />

            <div className="relative flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                <Sparkles
                  size={20}
                />
              </div>

              <div>

                <h3 className="font-black text-violet-950">
                  Customer Overview
                </h3>

                <p className="mt-1 text-sm leading-6 text-violet-900/60">
                  {orderCount > 0
                    ? `${name} has placed ${orderCount} ${
                        orderCount === 1
                          ? "order"
                          : "orders"
                      } with a recorded lifetime spend of ₹${formatCurrency(
                        totalSpent
                      )}.`
                    : `${name} has registered an account but has not placed an order yet.`}
                </p>

              </div>

            </div>

          </div>


          <div className="relative overflow-hidden rounded-3xl bg-orange-50 p-6">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/50 blur-2xl" />

            <div className="relative flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                <Clock3
                  size={20}
                />
              </div>

              <div>

                <h3 className="font-black text-orange-950">
                  Customer Timeline
                </h3>

                <p className="mt-1 text-sm leading-6 text-orange-900/60">
                  Customer joined{" "}
                  {formatDate(
                    getCreatedDate()
                  )}
                  {getLastOrderDate()
                    ? ` and last ordered on ${formatDate(
                        getLastOrderDate()
                      )}.`
                    : "."}
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>


      <Footer />

    </div>
  );
}


// ======================================================
// PROFILE STAT
// ======================================================

function ProfileStat({
  icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gray-50 transition duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">

        <div>

          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-gray-950">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-gray-400">
            {description}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


// ======================================================
// SECTION TITLE
// ======================================================

function SectionTitle({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
        {icon}
      </div>

      <div>

        <h2 className="text-base font-black text-gray-950">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-gray-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
}


// ======================================================
// INFO ROW
// ======================================================

function InfoRow({
  icon,
  label,
  value,
  copyable,
  onCopy,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
        {icon}
      </div>


      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
          {label}
        </p>

        <div className="mt-1 flex items-center gap-2">

          <p className="truncate text-sm font-bold text-gray-900">
            {value}
          </p>

          {copyable && (
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 text-gray-400 transition hover:text-gray-950"
            >
              <Copy
                size={13}
              />
            </button>
          )}

        </div>

      </div>

    </div>
  );
}


// ======================================================
// ORDER ROW
// ======================================================

function OrderRow({
  order,
  formatDate,
  formatCurrency,
  getOrderItemsCount,
}) {
  const orderId =
    order?.orderId ||
    order?.orderNumber ||
    order?._id;

  const status =
    order?.orderStatus ||
    order?.status ||
    "pending";

  const total =
    Number(
      order?.totalAmount ??
        order?.total ??
        order?.amount ??
        0
    );

  const itemsCount =
    getOrderItemsCount(
      order
    );


  return (
    <Link
      to={`/admin/orders/${orderId}`}
      className="group flex items-center gap-4 border-b border-gray-100 px-6 py-5 transition last:border-b-0 hover:bg-gray-50/70"
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 transition group-hover:bg-violet-50 group-hover:text-violet-600">
        <Package
          size={18}
        />
      </div>


      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <p className="truncate text-sm font-black text-gray-950">
            #{orderId}
          </p>

          <OrderStatus
            status={
              status
            }
          />

        </div>


        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">

          <span>
            {formatDate(
              order?.createdAt ||
                order?.date
            )}
          </span>

          <span>
            •
          </span>

          <span>
            {itemsCount}{" "}
            {itemsCount ===
            1
              ? "item"
              : "items"}
          </span>

        </div>

      </div>


      <div className="text-right">

        <p className="text-sm font-black text-gray-950">
          ₹
          {formatCurrency(
            total
          )}
        </p>

        <ArrowUpRight
          size={15}
          className="ml-auto mt-1 text-gray-300 transition group-hover:text-gray-700"
        />

      </div>

    </Link>
  );
}


// ======================================================
// ORDER STATUS
// ======================================================

function OrderStatus({
  status,
}) {
  const normalized =
    String(
      status || "pending"
    )
      .toLowerCase()
      .replaceAll(
        " ",
        "_"
      );


  const map = {
    pending: [
      "bg-gray-100 text-gray-600",
      "Pending",
    ],

    confirmed: [
      "bg-blue-50 text-blue-600",
      "Confirmed",
    ],

    processing: [
      "bg-orange-50 text-orange-600",
      "Processing",
    ],

    shipped: [
      "bg-violet-50 text-violet-600",
      "Shipped",
    ],

    out_for_delivery: [
      "bg-cyan-50 text-cyan-600",
      "Out for Delivery",
    ],

    delivered: [
      "bg-emerald-50 text-emerald-600",
      "Delivered",
    ],

    cancelled: [
      "bg-red-50 text-red-600",
      "Cancelled",
    ],

    returned: [
      "bg-amber-50 text-amber-600",
      "Returned",
    ],

    rto: [
      "bg-pink-50 text-pink-600",
      "RTO",
    ],
  };


  const [
    classes,
    label,
  ] =
    map[
      normalized
    ] || [
      "bg-gray-100 text-gray-600",
      formatStatus(
        normalized
      ),
    ];


  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {label}
    </span>
  );
}


// ======================================================
// CUSTOMER STATUS
// ======================================================

function CustomerStatus({
  status,
  dark = false,
}) {
  const normalized =
    String(
      status || "active"
    ).toLowerCase();


  let classes =
    dark
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "bg-emerald-50 text-emerald-600";

  let label =
    "Active";


  if (
    normalized ===
    "inactive"
  ) {
    classes =
      dark
        ? "border-gray-400/20 bg-gray-400/10 text-gray-300"
        : "bg-gray-100 text-gray-500";

    label =
      "Inactive";
  }


  if (
    normalized ===
    "blocked"
  ) {
    classes =
      dark
        ? "border-red-400/20 bg-red-400/10 text-red-300"
        : "bg-red-50 text-red-600";

    label =
      "Blocked";
  }


  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {label}
    </span>
  );
}


// ======================================================
// STATUS DOT
// ======================================================

function StatusDot({
  status,
}) {
  const normalized =
    String(
      status || "active"
    ).toLowerCase();


  let classes =
    "h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]";


  if (
    normalized ===
    "inactive"
  ) {
    classes =
      "h-3 w-3 rounded-full bg-gray-400 shadow-[0_0_0_5px_rgba(107,114,128,0.12)]";
  }


  if (
    normalized ===
    "blocked"
  ) {
    classes =
      "h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.12)]";
  }


  return (
    <span
      className={classes}
    />
  );
}


// ======================================================
// ADDRESS CARD
// ======================================================

function AddressCard({
  address,
}) {
  const name =
    address?.name ||
    address?.fullName ||
    `${address?.firstName || ""} ${
      address?.lastName || ""
    }`.trim() ||
    "Delivery Address";


  const line1 =
    address?.address ||
    address?.addressLine1 ||
    address?.street ||
    "";

  const line2 =
    address?.addressLine2 ||
    "";

  const city =
    address?.city ||
    "";

  const state =
    address?.state ||
    "";

  const pincode =
    address?.pincode ||
    address?.postalCode ||
    address?.zipCode ||
    "";


  return (
    <div className="group rounded-2xl border border-gray-200 bg-gray-50/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:bg-white hover:shadow-lg">

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
            <MapPin
              size={16}
            />
          </div>

          <p className="text-sm font-black text-gray-950">
            {name}
          </p>

        </div>


        {address?.isDefault && (
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-violet-600">
            Default
          </span>
        )}

      </div>


      <div className="mt-4 text-sm leading-6 text-gray-500">

        {line1 && (
          <p>
            {line1}
          </p>
        )}

        {line2 && (
          <p>
            {line2}
          </p>
        )}

        <p>
          {[
            city,
            state,
          ]
            .filter(
              Boolean
            )
            .join(
              ", "
            )}

          {pincode &&
            ` - ${pincode}`}
        </p>

        {address?.country && (
          <p>
            {address.country}
          </p>
        )}

      </div>


      {(address?.phone ||
        address?.mobile) && (
        <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4 text-xs font-bold text-gray-500">

          <Phone
            size={13}
          />

          {address.phone ||
            address.mobile}

        </div>
      )}

    </div>
  );
}


// ======================================================
// FORMAT STATUS
// ======================================================

function formatStatus(
  status
) {
  if (!status) {
    return "Active";
  }

  return String(
    status
  )
    .replaceAll(
      "_",
      " "
    )
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


// ======================================================
// TRENDING ICON
// ======================================================

function TrendingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}