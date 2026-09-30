import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import {
  Link,
} from "react-router";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";


export default function AdminDiscount() {
  const [
    discounts,
    setDiscounts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    editingDiscount,
    setEditingDiscount,
  ] = useState(null);

  const [
    deleteDiscount,
    setDeleteDiscount,
  ] = useState(null);

  const [
    copiedCode,
    setCopiedCode,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");


  // ======================================================
  // FETCH DISCOUNTS
  // ======================================================

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/admin/discounts`,
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
            "Failed to fetch discounts"
        );
      }

      const list =
        data?.discounts ||
        data?.data?.discounts ||
        data?.data ||
        [];

      setDiscounts(
        Array.isArray(list)
          ? list
          : []
      );
    } catch (err) {
      console.error(
        "Fetch discounts error:",
        err
      );

      setError(
        err.message ||
          "Unable to load discounts"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDiscounts();
  }, []);


  // ======================================================
  // FILTER
  // ======================================================

  const filteredDiscounts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return discounts.filter(
        (discount) => {
          const code =
            String(
              discount.code || ""
            ).toLowerCase();

          const name =
            String(
              discount.name || ""
            ).toLowerCase();

          const matchesSearch =
            !query ||
            code.includes(query) ||
            name.includes(query);

          const currentStatus =
            getDiscountStatus(
              discount
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            currentStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      discounts,
      search,
      statusFilter,
    ]);


  // ======================================================
  // STATISTICS
  // ======================================================

  const statistics =
    useMemo(() => {
      const total =
        discounts.length;

      const active =
        discounts.filter(
          (item) =>
            getDiscountStatus(
              item
            ) === "active"
        ).length;

      const expired =
        discounts.filter(
          (item) =>
            getDiscountStatus(
              item
            ) === "expired"
        ).length;

      const scheduled =
        discounts.filter(
          (item) =>
            getDiscountStatus(
              item
            ) === "scheduled"
        ).length;

      const totalUsage =
        discounts.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.usedCount ||
                item.usageCount ||
                item.used ||
                0
            ),
          0
        );

      return {
        total,
        active,
        expired,
        scheduled,
        totalUsage,
      };
    }, [discounts]);


  // ======================================================
  // COPY
  // ======================================================

  const handleCopy = async (
    code
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );
    }
  };


  // ======================================================
  // TOGGLE STATUS
  // ======================================================

  const handleToggleStatus =
    async (discount) => {
      const id =
        discount._id ||
        discount.id;

      if (!id) {
        return;
      }

      try {
        setActionLoading(
          `toggle-${id}`
        );

        const current =
          getDiscountStatus(
            discount
          );

        const nextStatus =
          current === "active"
            ? "inactive"
            : "active";

        const response =
          await fetch(
            `${API_URL}/admin/discounts/${id}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "include",
              body: JSON.stringify({
                status:
                  nextStatus,
                isActive:
                  nextStatus ===
                  "active",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update discount"
          );
        }

        await fetchDiscounts();
      } catch (err) {
        console.error(
          "Toggle discount error:",
          err
        );

        alert(
          err.message ||
            "Unable to update discount"
        );
      } finally {
        setActionLoading("");
      }
    };


  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete =
    async () => {
      if (!deleteDiscount) {
        return;
      }

      const id =
        deleteDiscount._id ||
        deleteDiscount.id;

      if (!id) {
        return;
      }

      try {
        setActionLoading(
          `delete-${id}`
        );

        const response =
          await fetch(
            `${API_URL}/admin/discounts/${id}`,
            {
              method: "DELETE",
              credentials:
                "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete discount"
          );
        }

        setDeleteDiscount(null);

        await fetchDiscounts();
      } catch (err) {
        console.error(
          "Delete discount error:",
          err
        );

        alert(
          err.message ||
            "Unable to delete discount"
        );
      } finally {
        setActionLoading("");
      }
    };


  return (
    <div className="min-h-screen bg-[#f7f7f8] text-gray-950">

      <Navbar />


      {/* ================================================== */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-200/30 blur-3xl" />

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

        <div className="mb-6 flex items-center gap-2 text-sm">

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

          <span className="font-bold text-gray-700">
            Discounts
          </span>

        </div>


        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section className="relative overflow-hidden rounded-[32px] bg-gray-950 p-6 text-white shadow-2xl sm:p-8 lg:p-10">

          <div className="absolute -right-24 -top-32 h-96 w-96 animate-pulse rounded-full bg-violet-500/25 blur-3xl" />

          <div
            className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-pink-500/15 blur-3xl"
            style={{
              animationDelay:
                "1s",
            }}
          />


          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-violet-200 backdrop-blur">
                <Sparkles
                  size={14}
                />

                PROMOTIONS
              </div>


              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Discounts &
                <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-orange-200 bg-clip-text text-transparent">
                  {" "}
                  Coupons
                </span>
              </h1>


              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                Create, manage and monitor
                promotional offers for your
                Printzenz customers from one
                powerful dashboard.
              </p>


              <div className="mt-6 flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(
                      true
                    )
                  }
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
                >
                  <Plus
                    size={17}
                    className="transition duration-300 group-hover:rotate-90"
                  />

                  Create Discount
                </button>


                <button
                  type="button"
                  onClick={
                    fetchDiscounts
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
                >
                  <RefreshCw
                    size={16}
                  />

                  Refresh
                </button>

              </div>

            </div>


            {/* HERO VISUAL */}

            <div className="relative hidden h-48 w-48 shrink-0 lg:block">

              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-white/10" />

              <div
                className="absolute inset-5 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-white/10"
              />

              <div className="absolute inset-10 flex animate-pulse items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-pink-500 shadow-2xl shadow-violet-500/30">

                <Tag
                  size={52}
                  strokeWidth={1.5}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <DiscountStat
            icon={
              <Tag
                size={20}
              />
            }
            title="Total Discounts"
            value={
              statistics.total
            }
            subtitle="All coupons"
            className="bg-violet-50 text-violet-600"
          />


          <DiscountStat
            icon={
              <Zap
                size={20}
              />
            }
            title="Active"
            value={
              statistics.active
            }
            subtitle="Currently available"
            className="bg-emerald-50 text-emerald-600"
          />


          <DiscountStat
            icon={
              <Clock3
                size={20}
              />
            }
            title="Scheduled"
            value={
              statistics.scheduled
            }
            subtitle="Starting later"
            className="bg-blue-50 text-blue-600"
          />


          <DiscountStat
            icon={
              <TrendingUp
                size={20}
              />
            }
            title="Total Usage"
            value={
              statistics.totalUsage
            }
            subtitle="Coupons redeemed"
            className="bg-orange-50 text-orange-600"
          />

        </section>


        {/* ================================================== */}
        {/* TOOLBAR */}
        {/* ================================================== */}

        <section className="mt-6 rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}

            <div className="relative w-full lg:max-w-md">

              <Search
                size={17}
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
                placeholder="Search coupon code or name..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

            </div>


            {/* Filters */}

            <div className="flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">

                <Filter
                  size={15}
                />

                Filter
              </div>


              {[
                [
                  "all",
                  "All",
                ],
                [
                  "active",
                  "Active",
                ],
                [
                  "scheduled",
                  "Scheduled",
                ],
                [
                  "expired",
                  "Expired",
                ],
                [
                  "inactive",
                  "Inactive",
                ],
              ].map(
                (item) => (
                  <button
                    key={
                      item[0]
                    }
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        item[0]
                      )
                    }
                    className={`rounded-xl px-3.5 py-2.5 text-xs font-black transition ${
                      statusFilter ===
                      item[0]
                        ? "bg-gray-950 text-white shadow-lg"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
                    }`}
                  >
                    {item[1]}
                  </button>
                )
              )}

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">

            <div>
              <p className="font-black">
                Unable to load discounts
              </p>

              <p className="mt-1 text-xs">
                {error}
              </p>
            </div>


            <button
              type="button"
              onClick={
                fetchDiscounts
              }
              className="rounded-xl bg-white px-4 py-2 text-xs font-black shadow-sm transition hover:bg-gray-50"
            >
              Retry
            </button>

          </div>
        )}


        {/* ================================================== */}
        {/* DISCOUNTS TABLE */}
        {/* ================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-black">
                  All Discounts
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {filteredDiscounts.length}{" "}
                  discount
                  {filteredDiscounts.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  found
                </p>

              </div>


              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">

                <ShoppingBag
                  size={14}
                />

                Manage your offers

              </div>

            </div>

          </div>


          {loading ? (
            <DiscountSkeleton />
          ) : filteredDiscounts.length ===
            0 ? (
            <EmptyDiscounts
              search={
                search
              }
              onCreate={() =>
                setShowCreateModal(
                  true
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead>

                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">

                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Discount
                    </th>

                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Value
                    </th>

                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Minimum Order
                    </th>

                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Usage
                    </th>

                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Expiry
                    </th>

                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredDiscounts.map(
                    (
                      discount,
                      index
                    ) => (
                      <DiscountRow
                        key={
                          discount._id ||
                          discount.id ||
                          discount.code ||
                          index
                        }
                        discount={
                          discount
                        }
                        copiedCode={
                          copiedCode
                        }
                        onCopy={
                          handleCopy
                        }
                        onEdit={() => {
                          setEditingDiscount(
                            discount
                          );
                          setShowCreateModal(
                            true
                          );
                        }}
                        onDelete={() =>
                          setDeleteDiscount(
                            discount
                          )
                        }
                        onToggle={() =>
                          handleToggleStatus(
                            discount
                          )
                        }
                        actionLoading={
                          actionLoading
                        }
                      />
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* ================================================== */}
        {/* FOOTER INFO */}
        {/* ================================================== */}

        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <InfoCard
            icon={
              <Percent
                size={18}
              />
            }
            title="Percentage Discounts"
            description="Give customers a percentage off their order total."
          />


          <InfoCard
            icon={
              <IndianRupeeIcon />
            }
            title="Fixed Discounts"
            description="Create flat rupee discounts for selected orders."
          />


          <InfoCard
            icon={
              <Clock3
                size={18}
              />
            }
            title="Scheduled Offers"
            description="Set start and expiry dates for campaigns."
          />

        </section>

      </main>


      <Footer />


      {/* ================================================== */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================================== */}

      {showCreateModal && (
        <DiscountModal
          discount={
            editingDiscount
          }
          onClose={() => {
            setShowCreateModal(
              false
            );
            setEditingDiscount(
              null
            );
          }}
          onSaved={() => {
            setShowCreateModal(
              false
            );
            setEditingDiscount(
              null
            );
            fetchDiscounts();
          }}
        />
      )}


      {/* ================================================== */}
      {/* DELETE MODAL */}
      {/* ================================================== */}

      {deleteDiscount && (
        <DeleteModal
          discount={
            deleteDiscount
          }
          loading={
            actionLoading ===
            `delete-${
              deleteDiscount._id ||
              deleteDiscount.id
            }`
          }
          onClose={() =>
            setDeleteDiscount(
              null
            )
          }
          onConfirm={
            handleDelete
          }
        />
      )}

    </div>
  );
}


// ======================================================
// DISCOUNT STAT
// ======================================================

function DiscountStat({
  icon,
  title,
  value,
  subtitle,
  className,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gray-50 transition duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-gray-400">
            {subtitle}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${className}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


// ======================================================
// DISCOUNT ROW
// ======================================================

function DiscountRow({
  discount,
  copiedCode,
  onCopy,
  onEdit,
  onDelete,
  onToggle,
  actionLoading,
}) {
  const code =
    discount.code ||
    "NO CODE";

  const status =
    getDiscountStatus(
      discount
    );

  const value =
    Number(
      discount.value ??
        discount.discountValue ??
        discount.amount ??
        0
    );

  const type =
    String(
      discount.type ||
        discount.discountType ||
        "percentage"
    ).toLowerCase();

  const used =
    Number(
      discount.usedCount ||
        discount.usageCount ||
        discount.used ||
        0
    );

  const usageLimit =
    Number(
      discount.usageLimit ||
        discount.maxUses ||
        discount.usageLimitTotal ||
        0
    );


  const usageText =
    usageLimit > 0
      ? `${used} / ${usageLimit}`
      : `${used} used`;


  return (
    <tr className="group border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50/60">

      {/* DISCOUNT */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 text-violet-600 transition duration-300 group-hover:scale-110">
            <Tag
              size={18}
            />
          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-black text-gray-950">
              {discount.name ||
                code}
            </p>


            <div className="mt-1 flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  onCopy(code)
                }
                className="group/code flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600 transition hover:bg-gray-950 hover:text-white"
              >
                {code}

                {copiedCode ===
                code ? (
                  <Check
                    size={11}
                  />
                ) : (
                  <Copy
                    size={11}
                  />
                )}

              </button>

            </div>

          </div>

        </div>

      </td>


      {/* VALUE */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            {type ===
            "percentage" ? (
              <Percent
                size={14}
              />
            ) : (
              <IndianRupeeIcon
                size={14}
              />
            )}
          </div>


          <div>

            <p className="text-sm font-black">
              {type ===
              "percentage"
                ? `${value}%`
                : `₹${formatNumber(
                    value
                  )}`}
            </p>

            <p className="text-[10px] text-gray-400">
              {type ===
              "percentage"
                ? "Percentage"
                : "Fixed amount"}
            </p>

          </div>

        </div>

      </td>


      {/* MIN ORDER */}

      <td className="px-6 py-5">

        <p className="text-sm font-bold text-gray-700">
          {discount.minimumOrderValue ||
          discount.minOrderValue ||
          discount.minimumAmount
            ? `₹${formatNumber(
                discount.minimumOrderValue ||
                  discount.minOrderValue ||
                  discount.minimumAmount
              )}`
            : "No minimum"}
        </p>

      </td>


      {/* USAGE */}

      <td className="px-6 py-5">

        <div className="min-w-[100px]">

          <div className="mb-1 flex items-center justify-between">

            <span className="text-xs font-black text-gray-700">
              {usageText}
            </span>

          </div>


          {usageLimit >
            0 && (
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (used /
                      usageLimit) *
                      100
                  )}%`,
                }}
              />

            </div>
          )}

        </div>

      </td>


      {/* EXPIRY */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">

          <Clock3
            size={14}
            className="text-gray-400"
          />

          {formatDate(
            discount.endDate ||
              discount.expiryDate ||
              discount.expiresAt
          )}

        </div>

      </td>


      {/* STATUS */}

      <td className="px-6 py-5">

        <DiscountStatus
          status={
            status
          }
        />

      </td>


      {/* ACTIONS */}

      <td className="px-6 py-5">

        <div className="flex justify-end gap-1">

          <button
            type="button"
            onClick={
              onEdit
            }
            title="Edit"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-950"
          >
            <Edit3
              size={15}
            />
          </button>


          <button
            type="button"
            onClick={
              onToggle
            }
            title={
              status ===
              "active"
                ? "Deactivate"
                : "Activate"
            }
            disabled={
              actionLoading ===
              `toggle-${
                discount._id ||
                discount.id
              }`
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
          >
            {actionLoading ===
            `toggle-${
              discount._id ||
              discount.id
            }` ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Zap
                size={15}
              />
            )}
          </button>


          <button
            type="button"
            onClick={
              onDelete
            }
            title="Delete"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2
              size={15}
            />
          </button>

        </div>

      </td>

    </tr>
  );
}


// ======================================================
// DISCOUNT STATUS
// ======================================================

function DiscountStatus({
  status,
}) {
  const config = {
    active: {
      label: "Active",
      classes:
        "bg-emerald-50 text-emerald-600",
    },

    inactive: {
      label: "Inactive",
      classes:
        "bg-gray-100 text-gray-500",
    },

    expired: {
      label: "Expired",
      classes:
        "bg-red-50 text-red-600",
    },

    scheduled: {
      label: "Scheduled",
      classes:
        "bg-blue-50 text-blue-600",
    },
  };


  const item =
    config[
      status
    ] || config.inactive;


  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${item.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {item.label}
    </span>
  );
}


// ======================================================
// CREATE / EDIT MODAL
// ======================================================

function DiscountModal({
  discount,
  onClose,
  onSaved,
}) {
  const isEditing =
    Boolean(discount);


  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const [
    form,
    setForm,
  ] = useState({
    code:
      discount?.code ||
      "",
    name:
      discount?.name ||
      "",
    type:
      discount?.type ||
      discount?.discountType ||
      "percentage",
    value:
      discount?.value ??
      discount?.discountValue ??
      "",
    minimumOrderValue:
      discount?.minimumOrderValue ??
      discount?.minOrderValue ??
      "",
    maximumDiscount:
      discount?.maximumDiscount ??
      discount?.maxDiscount ??
      "",
    usageLimit:
      discount?.usageLimit ??
      "",
    perCustomerLimit:
      discount?.perCustomerLimit ??
      1,
    startDate:
      formatDateInput(
        discount?.startDate
      ),
    endDate:
      formatDateInput(
        discount?.endDate ||
          discount?.expiryDate
      ),
    isActive:
      discount?.isActive ??
      true,
  });


  const update =
    (field, value) => {
      setForm(
        (current) => ({
          ...current,
          [field]:
            value,
        })
      );
    };


  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        !form.code.trim()
      ) {
        setError(
          "Discount code is required."
        );
        return;
      }

      if (
        !form.value ||
        Number(form.value) <= 0
      ) {
        setError(
          "Enter a valid discount value."
        );
        return;
      }

      try {
        setSaving(true);

        const id =
          discount?._id ||
          discount?.id;

        const endpoint =
          isEditing
            ? `${API_URL}/admin/discounts/${id}`
            : `${API_URL}/admin/discounts`;

        const response =
          await fetch(
            endpoint,
            {
              method:
                isEditing
                  ? "PUT"
                  : "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "include",
              body: JSON.stringify({
                code:
                  form.code
                    .trim()
                    .toUpperCase(),

                name:
                  form.name.trim(),

                type:
                  form.type,

                value:
                  Number(
                    form.value
                  ),

                minimumOrderValue:
                  form.minimumOrderValue
                    ? Number(
                        form.minimumOrderValue
                      )
                    : 0,

                maximumDiscount:
                  form.maximumDiscount
                    ? Number(
                        form.maximumDiscount
                      )
                    : null,

                usageLimit:
                  form.usageLimit
                    ? Number(
                        form.usageLimit
                      )
                    : null,

                perCustomerLimit:
                  Number(
                    form.perCustomerLimit ||
                      1
                  ),

                startDate:
                  form.startDate ||
                  null,

                endDate:
                  form.endDate ||
                  null,

                isActive:
                  form.isActive,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save discount"
          );
        }

        onSaved();
      } catch (err) {
        console.error(
          "Save discount error:",
          err
        );

        setError(
          err.message ||
            "Unable to save discount."
        );
      } finally {
        setSaving(false);
      }
    };


  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-md"
      onMouseDown={
        onClose
      }
    >

      <div
        className="my-8 w-full max-w-2xl animate-[modalIn_0.25s_ease-out] overflow-hidden rounded-[30px] bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="relative overflow-hidden bg-gray-950 px-6 py-6 text-white sm:px-8">

          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex items-start justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-violet-300">

                <Tag
                  size={18}
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Promotion
                </span>

              </div>


              <h2 className="text-2xl font-black">
                {isEditing
                  ? "Edit Discount"
                  : "Create Discount"}
              </h2>


              <p className="mt-1 text-sm text-gray-400">
                Configure your coupon and
                promotion settings.
              </p>

            </div>


            <button
              type="button"
              onClick={
                onClose
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              <X
                size={18}
              />
            </button>

          </div>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="max-h-[75vh] overflow-y-auto p-6 sm:p-8"
        >

          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}


          {/* Basic */}

          <div>

            <FormSectionTitle>
              Basic Information
            </FormSectionTitle>


            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <FormInput
                label="Discount Code"
                value={
                  form.code
                }
                onChange={(value) =>
                  update(
                    "code",
                    value
                  )
                }
                placeholder="WELCOME10"
                required
              />


              <FormInput
                label="Discount Name"
                value={
                  form.name
                }
                onChange={(value) =>
                  update(
                    "name",
                    value
                  )
                }
                placeholder="Welcome Offer"
              />

            </div>

          </div>


          {/* Discount type */}

          <div className="mt-7">

            <FormSectionTitle>
              Discount Value
            </FormSectionTitle>


            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  update(
                    "type",
                    "percentage"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  form.type ===
                  "percentage"
                    ? "border-violet-300 bg-violet-50 ring-4 ring-violet-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Percent
                      size={18}
                    />
                  </div>

                  <div>

                    <p className="text-sm font-black">
                      Percentage
                    </p>

                    <p className="text-xs text-gray-400">
                      Example: 10% off
                    </p>

                  </div>

                </div>

              </button>


              <button
                type="button"
                onClick={() =>
                  update(
                    "type",
                    "fixed"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  form.type ===
                  "fixed"
                    ? "border-violet-300 bg-violet-50 ring-4 ring-violet-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <IndianRupeeIcon />
                  </div>

                  <div>

                    <p className="text-sm font-black">
                      Fixed Amount
                    </p>

                    <p className="text-xs text-gray-400">
                      Example: ₹200 off
                    </p>

                  </div>

                </div>

              </button>

            </div>


            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <FormInput
                label={
                  form.type ===
                  "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"
                }
                value={
                  form.value
                }
                onChange={(value) =>
                  update(
                    "value",
                    value
                  )
                }
                placeholder={
                  form.type ===
                  "percentage"
                    ? "10"
                    : "200"
                }
                type="number"
                required
              />


              <FormInput
                label="Maximum Discount"
                value={
                  form.maximumDiscount
                }
                onChange={(value) =>
                  update(
                    "maximumDiscount",
                    value
                  )
                }
                placeholder="500"
                type="number"
              />

            </div>

          </div>


          {/* Conditions */}

          <div className="mt-7">

            <FormSectionTitle>
              Conditions & Usage
            </FormSectionTitle>


            <div className="mt-4 grid gap-4 sm:grid-cols-3">

              <FormInput
                label="Minimum Order"
                value={
                  form.minimumOrderValue
                }
                onChange={(value) =>
                  update(
                    "minimumOrderValue",
                    value
                  )
                }
                placeholder="999"
                type="number"
              />


              <FormInput
                label="Usage Limit"
                value={
                  form.usageLimit
                }
                onChange={(value) =>
                  update(
                    "usageLimit",
                    value
                  )
                }
                placeholder="100"
                type="number"
              />


              <FormInput
                label="Per Customer"
                value={
                  form.perCustomerLimit
                }
                onChange={(value) =>
                  update(
                    "perCustomerLimit",
                    value
                  )
                }
                placeholder="1"
                type="number"
              />

            </div>

          </div>


          {/* Dates */}

          <div className="mt-7">

            <FormSectionTitle>
              Campaign Schedule
            </FormSectionTitle>


            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <FormInput
                label="Start Date"
                value={
                  form.startDate
                }
                onChange={(value) =>
                  update(
                    "startDate",
                    value
                  )
                }
                type="datetime-local"
              />


              <FormInput
                label="End Date"
                value={
                  form.endDate
                }
                onChange={(value) =>
                  update(
                    "endDate",
                    value
                  )
                }
                type="datetime-local"
              />

            </div>

          </div>


          {/* Active */}

          <div className="mt-7 rounded-2xl bg-gray-50 p-4">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-sm font-black">
                  Activate discount
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Customers can use this
                  coupon immediately when active.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  update(
                    "isActive",
                    !form.isActive
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  form.isActive
                    ? "bg-violet-600"
                    : "bg-gray-300"
                }`}
              >

                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition ${
                    form.isActive
                      ? "left-6"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>


          {/* Buttons */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                saving
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={17}
                />
              )}

              {saving
                ? "Saving..."
                : isEditing
                ? "Update Discount"
                : "Create Discount"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


// ======================================================
// FORM INPUT
// ======================================================

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>


      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
      />

    </label>
  );
}


// ======================================================
// FORM SECTION
// ======================================================

function FormSectionTitle({
  children,
}) {
  return (
    <h3 className="text-sm font-black text-gray-950">
      {children}
    </h3>
  );
}


// ======================================================
// DELETE MODAL
// ======================================================

function DeleteModal({
  discount,
  loading,
  onClose,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-md"
      onMouseDown={
        onClose
      }
    >

      <div
        className="w-full max-w-md animate-[modalIn_0.2s_ease-out] rounded-[28px] bg-white p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Trash2
            size={23}
          />
        </div>


        <h2 className="mt-5 text-xl font-black">
          Delete discount?
        </h2>


        <p className="mt-2 text-sm leading-6 text-gray-500">
          You are about to permanently
          delete{" "}
          <strong className="text-gray-950">
            {discount.code}
          </strong>
          . This action cannot be undone.
        </p>


        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              loading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
          >

            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={16}
              />
            )}

            Delete

          </button>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// EMPTY
// ======================================================

function EmptyDiscounts({
  search,
  onCreate,
}) {
  return (
    <div className="px-6 py-20 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 text-violet-600">
        <Tag
          size={27}
        />
      </div>


      <h3 className="mt-5 text-xl font-black">
        {search
          ? "No discounts found"
          : "No discounts yet"}
      </h3>


      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
        {search
          ? "Try a different coupon code or clear your search."
          : "Create your first promotional discount to start offering special deals to customers."}
      </p>


      {!search && (
        <button
          type="button"
          onClick={
            onCreate
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
        >
          <Plus
            size={16}
          />

          Create Discount
        </button>
      )}

    </div>
  );
}


// ======================================================
// SKELETON
// ======================================================

function DiscountSkeleton() {
  return (
    <div className="divide-y divide-gray-100">

      {Array.from({
        length: 6,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="flex items-center gap-5 px-6 py-6"
          >

            <div className="h-11 w-11 animate-pulse rounded-2xl bg-gray-100" />

            <div className="flex-1 space-y-2">

              <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />

              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />

            </div>

            <div className="hidden h-4 w-20 animate-pulse rounded bg-gray-100 md:block" />

            <div className="hidden h-4 w-24 animate-pulse rounded bg-gray-100 md:block" />

            <div className="h-8 w-20 animate-pulse rounded-full bg-gray-100" />

          </div>
        )
      )}

    </div>
  );
}


// ======================================================
// INFO CARD
// ======================================================

function InfoCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="group rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white transition duration-300 group-hover:scale-110">
        {icon}
      </div>


      <h3 className="mt-4 text-sm font-black">
        {title}
      </h3>


      <p className="mt-1 text-xs leading-5 text-gray-400">
        {description}
      </p>

    </div>
  );
}


// ======================================================
// HELPERS
// ======================================================

function getDiscountStatus(
  discount
) {
  if (
    discount?.isActive ===
    false
  ) {
    return "inactive";
  }

  const now =
    new Date();


  const start =
    discount?.startDate
      ? new Date(
          discount.startDate
        )
      : null;

  const end =
    discount?.endDate
      ? new Date(
          discount.endDate
        )
      : discount?.expiryDate
      ? new Date(
          discount.expiryDate
        )
      : discount?.expiresAt
      ? new Date(
          discount.expiresAt
        )
      : null;


  if (
    start &&
    !Number.isNaN(
      start.getTime()
    ) &&
    start > now
  ) {
    return "scheduled";
  }


  if (
    end &&
    !Number.isNaN(
      end.getTime()
    ) &&
    end < now
  ) {
    return "expired";
  }


  if (
    discount?.status
  ) {
    const status =
      String(
        discount.status
      ).toLowerCase();

    if (
      [
        "inactive",
        "disabled",
        "expired",
        "scheduled",
        "active",
      ].includes(
        status
      )
    ) {
      return status;
    }
  }


  return "active";
}


function formatNumber(
  number
) {
  return Number(
    number || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  );
}


function formatDate(
  date
) {
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
}


function formatDateInput(
  date
) {
  if (!date) {
    return "";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  const pad =
    (value) =>
      String(value).padStart(
        2,
        "0"
      );

  return `${parsed.getFullYear()}-${pad(
    parsed.getMonth() + 1
  )}-${pad(
    parsed.getDate()
  )}T${pad(
    parsed.getHours()
  )}:${pad(
    parsed.getMinutes()
  )}`;
}


function IndianRupeeIcon({
  size = 18,
}) {
  return (
    <span
      className="text-sm font-black"
      style={{
        fontSize:
          size,
      }}
    >
      ₹
    </span>
  );
}