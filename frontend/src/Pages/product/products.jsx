import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Package,
  Star,
  Sparkles,
  Pencil,
  Trash2,
  ChevronDown,
  CheckCircle2,
  LayoutGrid,
  List,
} from "lucide-react";
import { axiosinstance } from "../../lib/axios.js";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("table");
  const [selected, setSelected] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axiosinstance.get("/products/admin/all");
      console.log(response.data)

      setProducts(
        response.data?.products ||
          response.data?.data ||
          []
      );
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean);

    return [...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        product.sku
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        getProductStatus(product) === status;

      const matchesCategory =
        category === "all" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [products, search, status, category]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === filteredProducts.length) {
      setSelected([]);
    } else {
      setSelected(
        filteredProducts.map((product) => product._id)
      );
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Delete this product?"
    );

    if (!confirmed) return;

    try {
      await axiosinstance.delete(`/products/${id}`);

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      );

      setSelected((prev) =>
        prev.filter((item) => item !== id)
      );
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Failed to delete product.");
    }
  };

  const getImage = (product) => {
    if (Array.isArray(product.images)) {
      return product.images[0];
    }

    return product.image || "";
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">

      {/* HEADER */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-5 lg:px-8 py-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
                 <Link
            to="/admin"
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <span className="text-lg">←</span>
            Back to Admin
          </Link>

       
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Package size={14} />
                CATALOG
                <span>/</span>
                PRODUCTS
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                Products
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your Printzenz product catalog.
              </p>
            </div>

            <Link
              to="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-200 hover:shadow-xl transition"
            >
              <Plus size={18} />
              Add product
            </Link>

          </div>

        </div>

      </div>


      <main className="mx-auto max-w-[1500px] px-5 lg:px-8 py-7">

        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">

          <MiniStat
            label="All products"
            value={products.length}
            icon={<Package size={18} />}
            bg="bg-violet-50"
            color="text-violet-600"
          />

          <MiniStat
            label="Active"
            value={
              products.filter(
                (product) => getProductStatus(product) === "active"
              ).length
            }
            icon={<CheckCircle2 size={18} />}
            bg="bg-emerald-50"
            color="text-emerald-600"
          />

          <MiniStat
            label="Featured"
            value={
              products.filter(
                (p) => p.isFeatured
              ).length
            }
            icon={<Star size={18} />}
            bg="bg-pink-50"
            color="text-pink-600"
          />

          <MiniStat
            label="New arrivals"
            value={
              products.filter(
                (p) => p.isNewArrival
              ).length
            }
            icon={<Sparkles size={18} />}
            bg="bg-amber-50"
            color="text-amber-600"
          />

        </div>


        {/* TOOLBAR */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">

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
                placeholder="Search products or SKU..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

            </div>


            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                ["all", "All status"],
                ["active", "Active"],
                ["draft", "Draft"],
                ["inactive", "Inactive"],
              ]}
            />


            <FilterSelect
              value={category}
              onChange={setCategory}
              options={[
                ["all", "All categories"],
                ...categories.map((item) => [
                  item,
                  item,
                ]),
              ]}
            />


            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">

              <button
                onClick={() => setView("table")}
                className={`rounded-lg p-2 ${
                  view === "table"
                    ? "bg-white shadow text-violet-600"
                    : "text-gray-400"
                }`}
              >
                <List size={17} />
              </button>

              <button
                onClick={() => setView("grid")}
                className={`rounded-lg p-2 ${
                  view === "grid"
                    ? "bg-white shadow text-violet-600"
                    : "text-gray-400"
                }`}
              >
                <LayoutGrid size={17} />
              </button>

            </div>

          </div>


          {/* BULK BAR */}

          {selected.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-violet-50 px-5 py-3">

              <span className="text-sm font-semibold text-violet-700">
                {selected.length} selected
              </span>

              <div className="flex gap-2">

                <button className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm">
                  Archive
                </button>

                <button className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white">
                  Delete
                </button>

              </div>

            </div>
          )}


          {view === "table" ? (
            <ProductTable
              products={filteredProducts}
              loading={loading}
              selected={selected}
              toggleSelect={toggleSelect}
              toggleAll={toggleAll}
              getImage={getImage}
              deleteProduct={deleteProduct}
            />
          ) : (
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              getImage={getImage}
            />
          )}

        </div>

      </main>

    </div>
  );
};


/* =====================================================
   PRODUCT TABLE
===================================================== */

const ProductTable = ({
  products,
  loading,
  selected,
  toggleSelect,
  toggleAll,
  getImage,
  deleteProduct,
}) => {

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400">
        Loading products...
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="p-14 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
          <Package size={28} />
        </div>

        <h3 className="mt-4 font-bold">
          No products found
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Add your first product to start building your catalog.
        </p>

      </div>
    );
  }

  return (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[850px]">

        <thead className="border-t border-gray-100 bg-gray-50">

          <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-400">

            <th className="w-12 px-5 py-4">
              <input
                type="checkbox"
                checked={
                  selected.length === products.length &&
                  products.length > 0
                }
                onChange={toggleAll}
                className="h-4 w-4 accent-violet-600"
              />
            </th>

            <th className="px-4 py-4">
              Product
            </th>

            <th className="px-4 py-4">
              Category
            </th>

            <th className="px-4 py-4">
              Price
            </th>

            <th className="px-4 py-4">
              Inventory
            </th>

            <th className="px-4 py-4">
              Status
            </th>

            <th className="px-5 py-4 text-right">
              Action
            </th>

          </tr>

        </thead>


        <tbody className="divide-y divide-gray-100">

          {products.map((product) => {

            const image = getImage(product);

            return (
              <tr
                key={product._id}
                className="group hover:bg-violet-50/40 transition"
              >

                <td className="px-5 py-4">

                  <input
                    type="checkbox"
                    checked={selected.includes(
                      product._id
                    )}
                    onChange={() =>
                      toggleSelect(product._id)
                    }
                    className="h-4 w-4 accent-violet-600"
                  />

                </td>


                <td className="px-4 py-4">

                  <div className="flex items-center gap-3">

                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100">

                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Package size={22} />
                        </div>
                      )}

                    </div>

                    <div>

                      <p className="font-bold text-gray-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {product.sku || "No SKU"}
                      </p>

                    </div>

                  </div>

                </td>


                <td className="px-4 py-4 text-sm text-gray-500">
                  {product.category || "Uncategorized"}
                </td>


                <td className="px-4 py-4">

                  <span className="font-bold text-gray-900">
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </span>

                </td>


                <td className="px-4 py-4">

                  <span
                    className={`text-sm font-semibold ${
                      Number(product.stock ?? product.quantity ?? 0) <= 0
                        ? "text-red-500"
                        : "text-gray-700"
                    }`}
                  >
                    {product.stock ?? product.quantity ?? 0}
                  </span>

                </td>


                <td className="px-4 py-4">
                  <StatusBadge status={getProductStatus(product)} />
                </td>


                <td className="px-5 py-4">

                  <div className="flex justify-end gap-1">

                    <Link
                      to={`/admin/products/${product._id}`}
                      className="rounded-lg p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      onClick={() =>
                        deleteProduct(product._id)
                      }
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
};


/* =====================================================
   PRODUCT GRID
===================================================== */

const ProductGrid = ({
  products,
  loading,
  getImage,
}) => {

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400">
        Loading products...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {products.map((product) => {

        const image = getImage(product);

        return (
          <div
            key={product._id}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg transition"
          >

            <div className="relative aspect-square bg-gray-100">

              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <Package size={40} />
                </div>
              )}

              <div className="absolute right-3 top-3">
                <StatusBadge status={getProductStatus(product)} />
              </div>

            </div>

            <div className="p-4">

              <p className="text-xs text-gray-400">
                {product.category}
              </p>

              <h3 className="mt-1 font-bold truncate">
                {product.name}
              </h3>

              <div className="mt-3 flex items-center justify-between">

                <span className="text-lg font-black">
                  ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </span>

                <span className="text-xs text-gray-400">
                  {product.stock ?? product.quantity ?? 0} in stock
                </span>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};


/* =====================================================
   COMPONENTS
===================================================== */

const MiniStat = ({
  label,
  value,
  icon,
  bg,
  color,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

    <div className="flex items-center justify-between">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}
      >
        {icon}
      </div>

      <span className="text-2xl font-black">
        {value}
      </span>

    </div>

    <p className="mt-3 text-xs font-semibold text-gray-400">
      {label}
    </p>

  </div>
);


const FilterSelect = ({
  value,
  onChange,
  options,
}) => (
  <div className="relative">

    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-sm font-medium outline-none focus:border-violet-400 focus:bg-white"
    >

      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}

    </select>

    <ChevronDown
      size={15}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
    />

  </div>
);


const StatusBadge = ({ status }) => {

  const config = {
    active: {
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
    },

    draft: {
      label: "Draft",
      className:
        "bg-amber-50 text-amber-600 border-amber-100",
    },

    inactive: {
      label: "Inactive",
      className:
        "bg-gray-100 text-gray-500 border-gray-200",
    },
  };

  const item =
    config[status] || config.inactive;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${item.className}`}
    >
      {item.label}
    </span>
  );
};

const getProductStatus = (product) => {
  if (typeof product.isActive === "boolean") {
    return product.isActive ? "active" : "inactive";
  }

  if (["active", "draft", "inactive"].includes(product.status)) {
    return product.status;
  }

  return product.isActive ? "active" : "inactive";
};

export default Products;