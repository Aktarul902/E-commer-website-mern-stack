import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  Heart,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import Footer from "../components/footer";
import Navbar from "../components/navbar";

import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../lib/wishlistApi.js";

import { useCart } from "../context/cartcontex.jsx";
import { useWishlist } from "../context/WishlistContext";
import useAuthuser from "../hooks/authuser.js";


export default function Wishlist() {
  const {
    addToCart,
  } = useCart();
  const { authuser, isLoading: authLoading } = useAuthuser();
  const { openGuestPrompt, refreshWishlist } = useWishlist();


  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [removingId, setRemovingId] =
    useState(null);

  const [clearing, setClearing] =
    useState(false);

  const [addingToCartId, setAddingToCartId] =
    useState(null);

  const [showClearModal, setShowClearModal] =
    useState(false);


  // --------------------------------------------------
  // FETCH WISHLIST
  // --------------------------------------------------

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWishlist();

      const wishlistData =
        response?.wishlist ||
        response?.data?.wishlist ||
        [];

      setWishlist(
        Array.isArray(wishlistData)
          ? wishlistData
          : []
      );
    } catch (error) {
      console.error(
        "Wishlist loading error:",
        error
      );

      const message =
        error?.message ||
        "Unable to load your wishlist.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (authLoading) return;

    if (!authuser) {
      setWishlist([]);
      setLoading(false);
      setError("");
      return;
    }

    loadWishlist();
  }, [authLoading, authuser]);


  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getProduct = (item) => {
    return item?.product || item;
  };


  const getProductId = (item) => {
    const product = getProduct(item);

    return (
      product?._id ||
      product?.id ||
      item?.productId ||
      item?._id
    );
  };


  const getProductName = (item) => {
    const product = getProduct(item);

    return (
      product?.name ||
      product?.title ||
      "Product"
    );
  };


  const getProductImage = (item) => {
    const product = getProduct(item);

    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      const firstImage =
        product.images[0];

      if (
        typeof firstImage === "string"
      ) {
        return firstImage;
      }

      if (
        typeof firstImage === "object"
      ) {
        return (
          firstImage?.url ||
          firstImage?.src ||
          firstImage?.secure_url ||
          ""
        );
      }
    }

    return (
      product?.image ||
      product?.thumbnail ||
      product?.imageUrl ||
      ""
    );
  };


  const getProductPrice = (item) => {
    const product = getProduct(item);

    return Number(
      product?.price ||
      product?.sellingPrice ||
      product?.salePrice ||
      0
    );
  };


  const getProductOldPrice = (item) => {
    const product = getProduct(item);

    return Number(
      product?.oldPrice ||
      product?.compareAtPrice ||
      product?.originalPrice ||
      0
    );
  };


  const getProductCategory = (item) => {
    const product = getProduct(item);

    if (
      typeof product?.category ===
      "string"
    ) {
      return product.category;
    }

    if (
      typeof product?.category ===
        "object" &&
      product?.category?.name
    ) {
      return product.category.name;
    }

    return "Printzenz";
  };


  const getProductSlug = (item) => {
    const product = getProduct(item);

    return (
      product?._id ||
      product?.id ||
      product?.slug
    );
  };


  // --------------------------------------------------
  // TOTAL SAVINGS
  // --------------------------------------------------

  const totalSavings = wishlist.reduce(
    (total, item) => {
      const price = getProductPrice(item);
      const oldPrice = getProductOldPrice(item);

      return oldPrice > price && price > 0
        ? total + oldPrice - price
        : total;
    },
    0
  );


  // --------------------------------------------------
  // REMOVE PRODUCT
  // --------------------------------------------------

  const handleRemove = async (
    productId
  ) => {
    if (!productId) {
      return;
    }

    try {
      setRemovingId(
        String(productId)
      );

      await removeFromWishlist(
        productId
      );

      setWishlist((current) =>
        current.filter((item) => {
          const id =
            getProductId(item);

          return (
            String(id) !==
            String(productId)
          );
        })
      );
      await refreshWishlist();
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      alert(
        error?.message ||
          "Unable to remove this product from wishlist."
      );
    } finally {
      setRemovingId(null);
    }
  };


  // --------------------------------------------------
  // CLEAR WISHLIST
  // --------------------------------------------------

  const handleClearWishlist =
    async () => {
      try {
        setClearing(true);

        await clearWishlist();

        setWishlist([]);
        await refreshWishlist();

        setShowClearModal(false);
      } catch (error) {
        console.error(
          "Clear wishlist error:",
          error
        );

        alert(
          error?.message ||
            "Unable to clear wishlist."
        );
      } finally {
        setClearing(false);
      }
    };


  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const handleAddToCart = async (
    item
  ) => {
    const product =
      getProduct(item);

    const productId =
      getProductId(item);

    if (!product || !productId) {
      return;
    }

    try {
      setAddingToCartId(
        String(productId)
      );

      await addToCart(
        product,
        1
      );

      // Optional success message
      alert(
        `${getProductName(
          item
        )} added to your cart.`
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      alert(
        error?.message ||
          "Unable to add this product to cart."
      );
    } finally {
      setAddingToCartId(null);
    }
  };


  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/"
                className="text-gray-500 transition hover:text-gray-950"
              >
                Home
              </Link>

              <ChevronRight
                size={15}
                className="text-gray-400"
              />

              <span className="font-medium text-gray-950">
                Wishlist
              </span>
            </div>
          </div>
        </div>


        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          {/* Header skeleton */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 h-8 w-40 animate-pulse rounded-full bg-gray-200" />

              <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-200" />

              <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-lg bg-gray-200" />
            </div>

            <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>


          {/* Product skeletons */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="min-w-0"
              >
                <div className="aspect-[4/5] animate-pulse rounded-3xl bg-gray-200" />

                <div className="mt-4 h-3 w-20 animate-pulse rounded bg-gray-200" />

                <div className="mt-2 h-5 w-40 animate-pulse rounded bg-gray-200" />

                <div className="mt-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  if (!authuser) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            <Heart size={34} />
          </div>
          <h1 className="mt-6 text-3xl font-black text-gray-950">
            Your wishlist starts with an account
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
            Create an account to save your favorite products and see them here whenever you return.
          </p>
          <button
            type="button"
            onClick={openGuestPrompt}
            className="mt-7 rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Create account
          </button>
        </section>
        <Footer />
      </main>
    );
  }


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />


      {/* ------------------------------------------------ */}
      {/* BREADCRUMB */}
      {/* ------------------------------------------------ */}

      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">

            <Link
              to="/"
              className="text-gray-500 transition hover:text-gray-950"
            >
              Home
            </Link>

            <ChevronRight
              size={15}
              className="text-gray-400"
            />

            <span className="font-medium text-gray-950">
              Wishlist
            </span>

          </div>
        </div>
      </div>


      {/* ------------------------------------------------ */}
      {/* MAIN */}
      {/* ------------------------------------------------ */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">


        {/* ------------------------------------------------ */}
        {/* ERROR */}
        {/* ------------------------------------------------ */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X size={18} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="font-bold text-red-900">
                  Unable to load wishlist
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadWishlist}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
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


        {/* ------------------------------------------------ */}
        {/* HEADING */}
        {/* ------------------------------------------------ */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-pink-600">
              <Heart
                size={14}
                className="fill-current"
              />

              Saved For Later
            </div>


            <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              My Wishlist
            </h1>


            <p className="mt-2 text-gray-500">
              Keep your favorite Printzenz products close.
            </p>

          </div>


          {wishlist.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
                {wishlist.length}{" "}
                {wishlist.length === 1
                  ? "item"
                  : "items"}
              </span>


              {totalSavings > 0 && (
                <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-600 ring-1 ring-green-100">
                  Save ₹
                  {totalSavings.toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}


              <button
                type="button"
                onClick={() =>
                  setShowClearModal(
                    true
                  )
                }
                disabled={clearing}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearing
                  ? "Clearing..."
                  : "Clear All"}
              </button>

            </div>
          )}

        </div>


        {/* ------------------------------------------------ */}
        {/* WISHLIST */}
        {/* ------------------------------------------------ */}

        {wishlist.length > 0 ? (
          <>


            {/* Wishlist information */}

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <Sparkles size={19} />
              </div>


              <div>
                <p className="text-sm font-bold text-gray-950">
                  Your wishlist is looking good!
                </p>

                <p className="text-xs text-gray-500">
                  Add your favorites to cart whenever you're ready.
                </p>
              </div>

            </div>


            {/* Product grid */}

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">

              {wishlist.map(
                (item) => {
                  const product =
                    getProduct(item);

                  const productId =
                    getProductId(item);

                  const productName =
                    getProductName(
                      item
                    );

                  const image =
                    getProductImage(
                      item
                    );

                  const price =
                    getProductPrice(
                      item
                    );

                  const oldPrice =
                    getProductOldPrice(
                      item
                    );

                  const category =
                    getProductCategory(
                      item
                    );

                  const productPath =
                    getProductSlug(
                      item
                    );

                  const isRemoving =
                    String(
                      removingId
                    ) ===
                    String(
                      productId
                    );

                  const isAddingToCart =
                    String(
                      addingToCartId
                    ) ===
                    String(
                      productId
                    );


                  return (
                    <div
                      key={
                        item?._id ||
                        productId
                      }
                      className="group relative min-w-0"
                    >


                      {/* IMAGE */}

                      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-100">

                        {productPath ? (
                          <Link
                            to={`/product/${productPath}`}
                          >
                            {image ? (
                              <img
                                src={image}
                                alt={
                                  productName
                                }
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <ShoppingBag
                                  size={35}
                                />
                              </div>
                            )}
                          </Link>
                        ) : (
                          <div>
                            {image ? (
                              <img
                                src={image}
                                alt={
                                  productName
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <ShoppingBag
                                  size={35}
                                />
                              </div>
                            )}
                          </div>
                        )}


                        {/* Product badge */}

                        {product?.badge && (
                          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-950 shadow-sm">
                            {product.badge}
                          </span>
                        )}


                        {/* Remove */}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              productId
                            )
                          }
                          disabled={
                            isRemoving
                          }
                          aria-label={`Remove ${productName} from wishlist`}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isRemoving ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={16}
                            />
                          )}
                        </button>


                        {/* Add to cart */}

                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart(
                              item
                            )
                          }
                          disabled={
                            isAddingToCart
                          }
                          className="absolute bottom-3 left-3 right-3 flex translate-y-2 items-center justify-center gap-2 rounded-xl bg-gray-950 py-3 text-xs font-bold text-white opacity-0 shadow-lg transition duration-300 hover:bg-gray-800 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
                        >
                          {isAddingToCart ? (
                            <>
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />

                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart
                                size={15}
                              />

                              Add to Cart
                            </>
                          )}
                        </button>

                      </div>


                      {/* PRODUCT DETAILS */}

                      <div className="mt-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          {category}
                        </p>


                        {productPath ? (
                          <Link
                            to={`/product/${productPath}`}
                            className="mt-1 block truncate font-bold text-gray-950 transition hover:text-gray-500"
                          >
                            {productName}
                          </Link>
                        ) : (
                          <p className="mt-1 truncate font-bold text-gray-950">
                            {productName}
                          </p>
                        )}


                        <div className="mt-2 flex items-center gap-2">

                          <span className="font-bold text-gray-950">
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </span>


                          {oldPrice >
                            price &&
                            oldPrice >
                              0 && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹
                                {oldPrice.toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>


            {/* Continue shopping */}

            <div className="mt-12 flex justify-center">

              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                Continue Shopping

                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

            </div>

          </>
        ) : (

          /* ------------------------------------------------ */
          /* EMPTY STATE */
          /* ------------------------------------------------ */

          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-pink-500">
              <Heart
                size={34}
              />
            </div>


            <h2 className="mt-6 text-2xl font-black text-gray-950">
              Your wishlist is empty
            </h2>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Found something you love?
              Tap the heart icon on any
              product to save it here for
              later.
            </p>


            <Link
              to="/shop"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              <ShoppingBag
                size={17}
              />

              Explore Products

              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>

          </div>
        )}

      </div>


      <Footer />


      {/* ------------------------------------------------ */}
      {/* CLEAR WISHLIST MODAL */}
      {/* ------------------------------------------------ */}

      {showClearModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <Trash2
                    size={21}
                  />
                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowClearModal(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={18} />
                </button>

              </div>


              <h3 className="mt-5 text-xl font-black text-gray-950">
                Clear your wishlist?
              </h3>


              <p className="mt-2 text-sm leading-6 text-gray-500">
                This will remove all{" "}
                <strong className="text-gray-900">
                  {wishlist.length}
                </strong>{" "}
                saved products from your
                wishlist. This action cannot
                be undone.
              </p>


              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowClearModal(
                      false
                    )
                  }
                  disabled={clearing}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Keep Wishlist
                </button>


                <button
                  type="button"
                  onClick={
                    handleClearWishlist
                  }
                  disabled={clearing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearing && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {clearing
                    ? "Clearing..."
                    : "Clear All"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}