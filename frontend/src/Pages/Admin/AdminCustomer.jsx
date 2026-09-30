import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Loader2,
  X,
  Sparkles,
  TrendingUp,
  Clock3,
  UserRound,
} from "lucide-react";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";


export default function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [showFilters, setShowFilters] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(null);


  // --------------------------------------------------
  // FETCH CUSTOMERS
  // --------------------------------------------------

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/customers`,
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
            "Unable to fetch customers"
        );
      }

      const customerData =
        data?.customers ||
        data?.data?.customers ||
        data?.data ||
        [];

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : []
      );
    } catch (error) {
      console.error(
        "Admin customers error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, []);


  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getCustomerId = (
    customer
  ) => {
    return (
      customer?._id ||
      customer?.id ||
      customer?.userId
    );
  };


  const getCustomerName = (
    customer
  ) => {
    const firstName =
      customer?.firstName ||
      customer?.name?.split(" ")?.[0] ||
      "";

    const lastName =
      customer?.lastName ||
      customer?.name
        ?.split(" ")
        ?.slice(1)
        ?.join(" ") ||
      "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    return (
      fullName ||
      customer?.name ||
      customer?.fullName ||
      "Customer"
    );
  };


  const getInitials = (
    customer
  ) => {
    const name =
      getCustomerName(customer);

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return (
      name?.slice(0, 2).toUpperCase() ||
      "CU"
    );
  };


  const getEmail = (
    customer
  ) => {
    return (
      customer?.email ||
      customer?.customer?.email ||
      "No email"
    );
  };


  const getPhone = (
    customer
  ) => {
    return (
      customer?.phone ||
      customer?.mobile ||
      customer?.customer?.phone ||
      "—"
    );
  };


  const getOrderCount = (
    customer
  ) => {
    return Number(
      customer?.orderCount ??
        customer?.ordersCount ??
        customer?.totalOrders ??
        customer?.orders?.length ??
        0
    );
  };


  const getTotalSpent = (
    customer
  ) => {
    return Number(
      customer?.totalSpent ??
        customer?.totalAmount ??
        customer?.lifetimeValue ??
        0
    );
  };


  const getLastOrderDate = (
    customer
  ) => {
    return (
      customer?.lastOrderAt ||
      customer?.lastOrderDate ||
      null
    );
  };


  const getStatus = (
    customer
  ) => {
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


  const formatDate = (
    date
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

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
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


  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------

  const filteredCustomers =
    useMemo(() => {
      let result = [
        ...customers,
      ];

      const searchValue =
        search
          .trim()
          .toLowerCase();

      if (searchValue) {
        result =
          result.filter(
            (customer) => {
              const name =
                getCustomerName(
                  customer
                ).toLowerCase();

              const email =
                getEmail(
                  customer
                ).toLowerCase();

              const phone =
                getPhone(
                  customer
                ).toLowerCase();

              return (
                name.includes(
                  searchValue
                ) ||
                email.includes(
                  searchValue
                ) ||
                phone.includes(
                  searchValue
                )
              );
            }
          );
      }

      if (
        statusFilter !==
        "all"
      ) {
        result =
          result.filter(
            (customer) =>
              getStatus(
                customer
              ) === statusFilter
          );
      }

      result.sort(
        (a, b) => {
          if (
            sortBy ===
            "newest"
          ) {
            return (
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
            );
          }

          if (
            sortBy ===
            "oldest"
          ) {
            return (
              new Date(
                a.createdAt || 0
              ) -
              new Date(
                b.createdAt || 0
              )
            );
          }

          if (
            sortBy ===
            "highest-spent"
          ) {
            return (
              getTotalSpent(b) -
              getTotalSpent(a)
            );
          }

          if (
            sortBy ===
            "most-orders"
          ) {
            return (
              getOrderCount(b) -
              getOrderCount(a)
            );
          }

          if (
            sortBy ===
            "name"
          ) {
            return getCustomerName(
              a
            ).localeCompare(
              getCustomerName(
                b
              )
            );
          }

          return 0;
        }
      );

      return result;
    }, [
      customers,
      search,
      statusFilter,
      sortBy,
    ]);


  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const statistics =
    useMemo(() => {
      const total =
        customers.length;

      const active =
        customers.filter(
          (customer) =>
            getStatus(
              customer
            ) === "active"
        ).length;

      const blocked =
        customers.filter(
          (customer) =>
            getStatus(
              customer
            ) === "blocked"
        ).length;

      const totalSpent =
        customers.reduce(
          (
            total,
            customer
          ) =>
            total +
            getTotalSpent(
              customer
            ),
          0
        );

      const totalOrders =
        customers.reduce(
          (
            total,
            customer
          ) =>
            total +
            getOrderCount(
              customer
            ),
          0
        );

      return {
        total,
        active,
        blocked,
        totalSpent,
        totalOrders,
      };
    }, [customers]);


  // --------------------------------------------------
  // VIEW CUSTOMER
  // --------------------------------------------------

  const handleViewCustomer =
    (customer) => {
      const email = getEmail(customer);

      if (!email || email === "No email") {
        return;
      }

      navigate(
        `/admin/customers/${encodeURIComponent(email)}`
      );
    };


  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] text-gray-950">

        <Navbar />

        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

          <div className="mb-8">

            <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200" />

            <div className="mt-4 h-10 w-64 animate-pulse rounded-xl bg-gray-200" />

            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-gray-200" />

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}

          </div>


          <div className="mt-6 h-[500px] animate-pulse rounded-3xl bg-white shadow-sm" />

        </div>

      </div>
    );
  }


  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div
      className="min-h-screen bg-[#f7f7f8] text-gray-950"
      onClick={() =>
        setOpenMenu(null)
      }
    >

      <Navbar />


      {/* ================================================== */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-32 top-20 h-72 w-72 animate-pulse rounded-full bg-violet-200/30 blur-3xl" />

        <div
          className="absolute right-0 top-96 h-96 w-96 animate-pulse rounded-full bg-pink-200/20 blur-3xl"
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

        <div className="mb-5 flex items-center gap-2 text-sm">

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

          <span className="font-medium text-gray-700">
            Customers
          </span>

        </div>


        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[32px] bg-gray-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">

          <div className="absolute inset-0 overflow-hidden">

            <div className="absolute -right-24 -top-32 h-80 w-80 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />

            <div
              className="absolute -bottom-40 left-1/3 h-96 w-96 animate-pulse rounded-full bg-pink-500/10 blur-3xl"
              style={{
                animationDelay:
                  "1s",
              }}
            />

          </div>


          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white/80 backdrop-blur">
                <Users size={13} />

                Customer Management
              </div>


              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Customers
              </h1>


              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                Manage your Printzenz customers,
                understand their activity, and
                keep track of their shopping
                relationship with your store.
              </p>

            </div>


            <div className="flex shrink-0 items-center gap-3">

              <button
                type="button"
                onClick={
                  fetchCustomers
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <RefreshCw
                  size={16}
                />

                Refresh
              </button>


              <Link
                to="/admin"
                className="hidden items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-gray-100 sm:inline-flex"
              >
                Dashboard

                <ArrowUpRight
                  size={16}
                />
              </Link>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <X size={18} />
              </div>

              <div className="flex-1">

                <p className="font-bold text-red-900">
                  Could not load customers
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    fetchCustomers
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <RefreshCw
                    size={15}
                  />

                  Try Again
                </button>

              </div>

            </div>

          </div>
        )}


        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}

          <StatCard
            icon={
              <Users size={20} />
            }
            label="Total Customers"
            value={statistics.total}
            description="Registered accounts"
            iconClass="bg-violet-50 text-violet-600"
          />


          {/* Active */}

          <StatCard
            icon={
              <UserCheck size={20} />
            }
            label="Active Customers"
            value={statistics.active}
            description="Currently active"
            iconClass="bg-emerald-50 text-emerald-600"
          />


          {/* Orders */}

          <StatCard
            icon={
              <ShoppingBag
                size={20}
              />
            }
            label="Total Orders"
            value={statistics.totalOrders}
            description="Across all customers"
            iconClass="bg-blue-50 text-blue-600"
          />


          {/* Revenue */}

          <StatCard
            icon={
              <IndianRupee
                size={20}
              />
            }
            label="Customer Value"
            value={`₹${formatCurrency(
              statistics.totalSpent
            )}`}
            description="Total recorded spend"
            iconClass="bg-orange-50 text-orange-600"
          />

        </section>


        {/* ================================================== */}
        {/* SEARCH + FILTERS */}
        {/* ================================================== */}

        <section className="mt-6 rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}

            <div className="relative w-full lg:max-w-xl">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by name, email or phone..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-10 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-4 focus:ring-gray-950/5"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                >
                  <X size={15} />
                </button>
              )}

            </div>


            <div className="flex flex-wrap gap-3">

              {/* Mobile filter button */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (value) =>
                      !value
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 lg:hidden"
              >
                <Filter
                  size={16}
                />

                Filters
              </button>


              {/* Status */}

              <div
                className={`relative ${
                  showFilters
                    ? "block"
                    : "hidden lg:block"
                }`}
              >

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm font-bold text-gray-700 outline-none transition hover:bg-gray-50 focus:border-gray-950"
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="blocked">
                    Blocked
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

              </div>


              {/* Sort */}

              <div
                className={`relative ${
                  showFilters
                    ? "block"
                    : "hidden lg:block"
                }`}
              >

                <select
                  value={sortBy}
                  onChange={(
                    event
                  ) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm font-bold text-gray-700 outline-none transition hover:bg-gray-50 focus:border-gray-950"
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>

                  <option value="highest-spent">
                    Highest Spent
                  </option>

                  <option value="most-orders">
                    Most Orders
                  </option>

                  <option value="name">
                    Name A-Z
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

              </div>

            </div>

          </div>


          {/* Result info */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">

            <p className="text-xs font-medium text-gray-400">
              Showing{" "}
              <span className="font-bold text-gray-700">
                {
                  filteredCustomers.length
                }
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-700">
                {customers.length}
              </span>{" "}
              customers
            </p>


            {(search ||
              statusFilter !==
                "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "all"
                  );
                }}
                className="text-xs font-bold text-gray-500 transition hover:text-gray-950"
              >
                Clear filters
              </button>
            )}

          </div>

        </section>


        {/* ================================================== */}
        {/* CUSTOMER TABLE */}
        {/* ================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

          {/* Desktop header */}

          <div className="hidden border-b border-gray-100 bg-gray-50/70 px-6 py-4 lg:grid lg:grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_50px] lg:items-center lg:gap-4">

            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Customer
            </p>

            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Contact
            </p>

            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Orders
            </p>

            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Total Spent
            </p>

            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Last Order
            </p>

            <span />

          </div>


          {/* Empty */}

          {filteredCustomers.length ===
          0 ? (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                {search ||
                statusFilter !==
                  "all" ? (
                  <Search
                    size={25}
                  />
                ) : (
                  <Users
                    size={25}
                  />
                )}
              </div>


              <h3 className="mt-5 text-lg font-black text-gray-950">
                {search ||
                statusFilter !==
                  "all"
                  ? "No customers found"
                  : "No customers yet"}
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search ||
                statusFilter !==
                  "all"
                  ? "Try changing your search or filter to find the customer you're looking for."
                  : "Customers will appear here when they create accounts on your Printzenz store."}
              </p>


              {(search ||
                statusFilter !==
                  "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "all"
                    );
                  }}
                  className="mt-5 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              )}

            </div>
          ) : (
            filteredCustomers.map(
              (
                customer,
                index
              ) => {
                const id =
                  getCustomerId(
                    customer
                  );

                const name =
                  getCustomerName(
                    customer
                  );

                const email =
                  getEmail(
                    customer
                  );

                const phone =
                  getPhone(
                    customer
                  );

                const orderCount =
                  getOrderCount(
                    customer
                  );

                const totalSpent =
                  getTotalSpent(
                    customer
                  );

                const lastOrder =
                  getLastOrderDate(
                    customer
                  );

                const status =
                  getStatus(
                    customer
                  );

                const menuOpen =
                  openMenu ===
                  id;


                return (
                  <div
                    key={
                      id ||
                      index
                    }
                    className="group border-b border-gray-100 px-4 py-5 transition hover:bg-gray-50/70 last:border-b-0 sm:px-6"
                  >

                    {/* DESKTOP */}

                    <div className="hidden lg:grid lg:grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_50px] lg:items-center lg:gap-4">

                      {/* Customer */}

                      <div className="flex min-w-0 items-center gap-3">

                        <CustomerAvatar
                          customer={
                            customer
                          }
                        />

                        <div className="min-w-0">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewCustomer(
                                customer
                              )
                            }
                            className="block max-w-full truncate text-left font-bold text-gray-950 transition hover:text-violet-600"
                          >
                            {name}
                          </button>

                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            ID:{" "}
                            {String(
                              id ||
                                "—"
                            ).slice(
                              -10
                            )}
                          </p>

                        </div>

                      </div>


                      {/* Contact */}

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <Mail
                            size={13}
                            className="shrink-0 text-gray-400"
                          />

                          <span className="truncate text-sm font-medium text-gray-600">
                            {email}
                          </span>

                        </div>

                        {phone !==
                          "—" && (
                          <div className="mt-1 flex items-center gap-2">

                            <Phone
                              size={13}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="text-xs text-gray-400">
                              {phone}
                            </span>

                          </div>
                        )}

                      </div>


                      {/* Orders */}

                      <div>

                        <div className="flex items-center gap-2">

                          <ShoppingBag
                            size={14}
                            className="text-gray-400"
                          />

                          <span className="font-bold text-gray-900">
                            {orderCount}
                          </span>

                        </div>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {orderCount ===
                          1
                            ? "order"
                            : "orders"}
                        </p>

                      </div>


                      {/* Spent */}

                      <div>

                        <p className="font-bold text-gray-950">
                          ₹
                          {formatCurrency(
                            totalSpent
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          lifetime value
                        </p>

                      </div>


                      {/* Last order */}

                      <div>

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={14}
                            className="text-gray-400"
                          />

                          <span className="text-sm font-medium text-gray-700">
                            {formatDate(
                              lastOrder
                            )}
                          </span>

                        </div>

                        <StatusBadge
                          status={
                            status
                          }
                        />

                      </div>


                      {/* Menu */}

                      <div className="relative flex justify-end">

                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            setOpenMenu(
                              menuOpen
                                ? null
                                : id
                            );
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <MoreHorizontal
                            size={18}
                          />
                        </button>


                        {menuOpen && (
                          <CustomerMenu
                            customer={
                              customer
                            }
                            onView={() =>
                              handleViewCustomer(
                                customer
                              )
                            }
                            onClose={() =>
                              setOpenMenu(
                                null
                              )
                            }
                          />
                        )}

                      </div>

                    </div>


                    {/* MOBILE / TABLET */}

                    <div className="lg:hidden">

                      <div className="flex items-start gap-4">

                        <CustomerAvatar
                          customer={
                            customer
                          }
                        />

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewCustomer(
                                    customer
                                  )
                                }
                                className="truncate text-left font-bold text-gray-950 hover:text-violet-600"
                              >
                                {name}
                              </button>

                              <p className="mt-1 truncate text-xs text-gray-400">
                                {email}
                              </p>

                            </div>


                            <StatusBadge
                              status={
                                status
                              }
                            />

                          </div>


                          <div className="mt-4 grid grid-cols-3 gap-2">

                            <MiniStat
                              icon={
                                <ShoppingBag
                                  size={
                                    13
                                  }
                                />
                              }
                              label="Orders"
                              value={
                                orderCount
                              }
                            />

                            <MiniStat
                              icon={
                                <IndianRupee
                                  size={
                                    13
                                  }
                                />
                              }
                              label="Spent"
                              value={`₹${formatCurrency(
                                totalSpent
                              )}`}
                            />

                            <MiniStat
                              icon={
                                <Clock3
                                  size={
                                    13
                                  }
                                />
                              }
                              label="Last Order"
                              value={formatDate(
                                lastOrder
                              )}
                            />

                          </div>


                          <div className="mt-4 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewCustomer(
                                  customer
                                )
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800"
                            >
                              <Eye
                                size={
                                  14
                                }
                              />

                              View Customer
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  menuOpen
                                    ? null
                                    : id
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                            >
                              <MoreHorizontal
                                size={
                                  17
                                }
                              />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              }
            )
          )}

        </section>


        {/* ================================================== */}
        {/* BOTTOM INSIGHT */}
        {/* ================================================== */}

        {customers.length >
          0 && (
          <section className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-3xl border border-violet-100 bg-violet-50 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                  <TrendingUp
                    size={20}
                  />
                </div>

                <div>

                  <p className="text-sm font-black text-violet-950">
                    Customer Activity
                  </p>

                  <p className="mt-1 text-sm leading-6 text-violet-800/70">
                    {statistics.active} of{" "}
                    {statistics.total}{" "}
                    customers are currently
                    active.
                  </p>

                </div>

              </div>

            </div>


            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                  <Sparkles
                    size={20}
                  />
                </div>

                <div>

                  <p className="text-sm font-black text-orange-950">
                    Customer Value
                  </p>

                  <p className="mt-1 text-sm leading-6 text-orange-800/70">
                    Your recorded customer
                    lifetime value is ₹
                    {formatCurrency(
                      statistics.totalSpent
                    )}
                    .
                  </p>

                </div>

              </div>

            </div>

          </section>
        )}

      </main>


      <Footer />

    </div>
  );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gray-50 transition duration-500 group-hover:scale-150" />


      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
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
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


// ======================================================
// CUSTOMER AVATAR
// ======================================================

function CustomerAvatar({
  customer,
}) {
  const name =
    customer?.name ||
    customer?.fullName ||
    `${customer?.firstName || ""} ${
      customer?.lastName || ""
    }`.trim() ||
    "Customer";

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .toUpperCase() ||
    "CU";


  if (customer?.avatar) {
    return (
      <img
        src={customer.avatar}
        alt={name}
        className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-sm"
      />
    );
  }


  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-xs font-black text-white shadow-sm">
      {initials}
    </div>
  );
}


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}) {
  const normalized =
    String(
      status || "active"
    ).toLowerCase();


  let styles =
    "bg-emerald-50 text-emerald-600";

  let label = "Active";


  if (
    normalized ===
    "blocked"
  ) {
    styles =
      "bg-red-50 text-red-600";

    label = "Blocked";
  }


  if (
    normalized ===
    "inactive"
  ) {
    styles =
      "bg-gray-100 text-gray-500";

    label = "Inactive";
  }


  return (
    <span
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {label}
    </span>
  );
}


// ======================================================
// MINI STAT
// ======================================================

function MiniStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">

      <div className="flex items-center gap-1.5 text-gray-400">

        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="mt-1 truncate text-xs font-black text-gray-900">
        {value}
      </p>

    </div>
  );
}


// ======================================================
// CUSTOMER MENU
// ======================================================

function CustomerMenu({
  customer,
  onView,
  onClose,
}) {
  const email =
    customer?.email || "";

  const phone =
    customer?.phone ||
    customer?.mobile ||
    "";


  return (
    <div
      onClick={(event) =>
        event.stopPropagation()
      }
      className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl"
    >

      <button
        type="button"
        onClick={() => {
          onView();
          onClose();
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50"
      >
        <Eye
          size={16}
          className="text-gray-400"
        />

        View Customer
      </button>


      {email && (
        <a
          href={`mailto:${email}`}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          <Mail
            size={16}
            className="text-gray-400"
          />

          Email Customer
        </a>
      )}


      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          <Phone
            size={16}
            className="text-gray-400"
          />

          Call Customer
        </a>
      )}

    </div>
  );
}