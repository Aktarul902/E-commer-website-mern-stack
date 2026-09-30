import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FolderTree,
  Package,
  Pencil,
  Trash2,
  ImagePlus,
  X,
  Check,
} from "lucide-react";
import { Link } from "react-router";
import axiosInstance from "../../lib/axios.js";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        "/categories"
      );

      setCategories(
        response.data?.categories ||
          response.data?.data ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);

    setForm({
      name: "",
      description: "",
      image: "",
      active: true,
    });

    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditing(category);

    setForm({
      name: category.name || "",
      description:
        category.description || "",
      image: category.image || "",
      active:
        category.active !== false,
    });

    setShowModal(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    try {

      if (editing) {

        const response =
          await axiosInstance.put(
            `/categories/${editing._id}`,
            form
          );

        const updated =
          response.data?.category ||
          response.data?.data;

        setCategories((prev) =>
          prev.map((item) =>
            item._id === editing._id
              ? updated || { ...item, ...form }
              : item
          )
        );

      } else {

        const response =
          await axiosInstance.post(
            "/categories",
            form
          );

        const created =
          response.data?.category ||
          response.data?.data;

        if (created) {
          setCategories((prev) => [
            created,
            ...prev,
          ]);
        }

      }

      setShowModal(false);

    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save category."
      );
    }
  };

  const deleteCategory = async (id) => {
    if (
      !window.confirm(
        "Delete this category?"
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(
        `/categories/${id}`
      );

      setCategories((prev) =>
        prev.filter(
          (category) =>
            category._id !== id
        )
      );

    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      alert("Failed to delete category.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">

      {/* HEADER */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-5 lg:px-8 py-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-400"
              >
                 <Link
                            to="/admin"
                            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <span className="text-lg">←</span>
                            Back to Admin
                          </Link>
                

                <FolderTree size={14} />

                CATALOG

                <span>/</span>

                CATEGORIES

              </div>

              <h1 className="mt-2 text-3xl font-black">
                Categories
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Organize your products into beautiful storefront collections.
              </p>

            </div>


            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-200 hover:shadow-xl transition"
            >
              <Plus size={18} />
              Add category
            </button>

          </div>

        </div>

      </div>


      <main className="mx-auto max-w-[1500px] px-5 lg:px-8 py-7">


        {/* CATEGORY HEADER */}

        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-white shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-semibold text-white/70">
                  Your catalog
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {categories.length}
                </h2>

                <p className="mt-1 text-sm text-white/80">
                  product categories
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <FolderTree size={23} />
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search categories..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

            </div>

          </div>

        </div>


        {/* CATEGORY GRID */}

        {loading ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center text-sm text-gray-400">
            Loading categories...
          </div>

        ) : filteredCategories.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
              <FolderTree size={28} />
            </div>

            <h3 className="mt-4 font-bold">
              No categories yet
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Create your first category to organize your products.
            </p>

            <button
              onClick={openCreate}
              className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white"
            >
              Create category
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredCategories.map(
              (category, index) => {

                const colors = [
                  "from-violet-500 to-indigo-500",
                  "from-pink-500 to-rose-500",
                  "from-amber-400 to-orange-500",
                  "from-emerald-400 to-teal-500",
                  "from-blue-500 to-cyan-500",
                  "from-fuchsia-500 to-purple-500",
                ];

                return (
                  <div
                    key={category._id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-[1.5/1] overflow-hidden bg-gray-100">

                      {category.image ? (

                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${colors[index % colors.length]} text-white`}
                        >
                          <FolderTree size={48} />
                        </div>

                      )}


                      <div className="absolute left-3 top-3">

                        <span
                          className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                            category.active === false
                              ? "bg-gray-900/70 text-white"
                              : "bg-white/90 text-emerald-600"
                          }`}
                        >
                          {category.active === false
                            ? "Hidden"
                            : "Live"}
                        </span>

                      </div>


                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition">

                        <div className="flex rounded-xl bg-white/95 p-1 shadow-lg">

                          <button
                            onClick={() =>
                              openEdit(category)
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-violet-50 hover:text-violet-600"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() =>
                              deleteCategory(
                                category._id
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </div>

                    </div>


                    {/* CONTENT */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <h3 className="font-black text-gray-900">
                            {category.name}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-400">
                            {category.description ||
                              "No category description added."}
                          </p>

                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                          <Package size={16} />
                        </div>

                      </div>


                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                        <span className="text-xs font-semibold text-gray-400">
                          Products
                        </span>

                        <span className="text-sm font-black text-violet-600">
                          {category.productCount ??
                            category.productsCount ??
                            0}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </main>


      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-5 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-black">
                  {editing
                    ? "Edit category"
                    : "Create category"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Organize your storefront catalog.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={saveCategory}
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Category name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Example: Oversized T-Shirts"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  required
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Short category description..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Image URL
                </label>

                <div className="relative">

                  <ImagePlus
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={form.image}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        image: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:bg-white"
                  />

                </div>

              </div>


              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">

                <div>

                  <p className="text-sm font-bold">
                    Visible in storefront
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Customers can browse this category.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-violet-600"
                />

              </label>


              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-100"
                >
                  <Check size={17} />

                  {editing
                    ? "Save changes"
                    : "Create category"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Categories;