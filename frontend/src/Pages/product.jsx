import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import BuyNowModal from "../context/BuyNowModal.jsx";
import {
  getProductById,
  getProducts,
  submitProductReview,
} from "../lib/productapi.js";

import useAuthuser from "../hooks/authuser.js";
import { useWishlist } from "../context/WishlistContext";

import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AddToCartButton from "../components/addtocardbutton";

import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Check,
  PackageCheck,
  LockKeyhole,
  BadgeCheck,
  MapPin,
  Clock3,
  Sparkles,
} from "lucide-react";

export default function ProductDetails() {
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const { id } = useParams();
  const { authuser } = useAuthuser();

  const [product, setProduct] = useState(null);
  const [loadedProductId, setLoadedProductId] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);

  const [featuredProducts, setFeaturedProducts] = useState([]);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /*
   * ---------------------------------------------------------
   * LOAD PRODUCT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoadedProductId(null);

        const response = await getProductById(id);

        if (!isMounted) return;

        const loadedProduct = response?.product || null;

        setProduct(loadedProduct);
        setLoadedProductId(id);

        // Reset UI when moving from one product to another.
        setSelectedImage(0);
        setQuantity(1);
        setSelectedSize("");
        setSelectedColor("");
      } catch (error) {
        console.error("Failed to load product:", error);

        if (isMounted) {
          setProduct(null);
          setLoadedProductId(id);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /*
   * ---------------------------------------------------------
   * LOAD RELATED PRODUCTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const response = await getProducts();

        const allProducts = Array.isArray(response?.products)
          ? response.products
          : [];

        const suggestions = allProducts
          .filter(
            (item) =>
              String(item?._id || item?.id) !== String(id) &&
              item?.isActive !== false
          )
          .sort((first, second) => {
            const featuredDifference =
              Number(Boolean(second?.isFeatured)) -
              Number(Boolean(first?.isFeatured));

            if (featuredDifference !== 0) {
              return featuredDifference;
            }

            return (
              new Date(second?.createdAt || 0) -
              new Date(first?.createdAt || 0)
            );
          })
          .slice(0, 4);

        if (isMounted) {
          setFeaturedProducts(suggestions);
        }
      } catch (error) {
        console.error("Failed to load related products:", error);

        if (isMounted) {
          setFeaturedProducts([]);
        }
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /*
   * ---------------------------------------------------------
   * DERIVED PRODUCT DATA
   * ---------------------------------------------------------
   */

  const loading = loadedProductId !== id;

  const variants = useMemo(() => {
    return (
      product?.variants?.filter((variant) => variant?.active !== false) || []
    );
  }, [product]);

  const colors = useMemo(() => {
    return [
      ...new Set(
        variants
          .map((variant) => variant?.color)
          .filter(Boolean)
          .map((color) => String(color).trim())
      ),
    ];
  }, [variants]);

  const sizes = useMemo(() => {
    return [
      ...new Set(
        variants
          .map((variant) => variant?.size)
          .filter(Boolean)
          .map((size) => String(size).trim())
      ),
    ];
  }, [variants]);

  const activeSize = sizes.includes(selectedSize)
    ? selectedSize
    : sizes[0] || "";

  const activeColor = colors.includes(selectedColor)
    ? selectedColor
    : colors[0] || "";

  const selectedVariant = variants.find((variant) => {
    const sizeMatches =
      !activeSize || String(variant?.size || "") === String(activeSize);

    const colorMatches =
      !activeColor || String(variant?.color || "") === String(activeColor);

    return sizeMatches && colorMatches;
  });

  const stock = Number(selectedVariant?.stock ?? product?.stock ?? 0);

  const price =
    Number(selectedVariant?.price) > 0
      ? Number(selectedVariant.price)
      : Number(product?.price || 0);

  const compareAtPrice = Number(
    product?.compareAtPrice || product?.oldPrice || 0
  );

  const discount =
    compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const images =
    product?.images?.filter(Boolean) ||
    (product?.image ? [product.image] : []);

  const reviewList = Array.isArray(product?.reviews)
    ? product.reviews
    : [];

  const reviewCount = Number(
    product?.numReviews ?? reviewList.length ?? 0
  );

  const productRating = Number(product?.rating || 0);

  const ratingDistribution = [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: reviewList.filter(
      (review) => Number(review?.rating) === value
    ).length,
  }));

  const isOutOfStock = stock <= 0;

  /*
   * ---------------------------------------------------------
   * QUANTITY
   * ---------------------------------------------------------
   */

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(current + 1, Math.max(stock, 1)));
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(current - 1, 1));
  };

  /*
   * ---------------------------------------------------------
   * CART
   * ---------------------------------------------------------
   */

  /*
   * ---------------------------------------------------------
   * BUY NOW
   * ---------------------------------------------------------
   */

  const buyNow = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    console.log("Buy now:", {
      productId: product?._id || product?.id,
      quantity,
      size: activeSize,
      color: activeColor,
      variantId: selectedVariant?._id || null,
    });

    toast.success("Buy Now Form");
    setBuyNowOpen(true)
  };

  /*
   * ---------------------------------------------------------
   * REVIEW
   * ---------------------------------------------------------
   */

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewComment.trim()) {
      toast.error("Please write your review.");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await submitProductReview({
        productId: id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (response?.product) {
        setProduct(response.product);
      }

      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);

      toast.success("Your review has been saved.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not save your review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />

            <p className="text-sm font-medium text-neutral-500">
              Loading product...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * PRODUCT NOT FOUND
   * ---------------------------------------------------------
   */

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
              <ShoppingCart size={30} className="text-neutral-400" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-neutral-950">
              Product not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              We couldn't find the product you're looking for. It may have
              been removed or the link may be incorrect.
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Product ID: {id || "No product ID"}
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              <ArrowLeft size={17} />
              Back to Shop
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navbar />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2 overflow-hidden text-xs font-medium text-neutral-500">
          <Link to="/" className="shrink-0 transition hover:text-black">
            Home
          </Link>

          <ChevronRight size={14} className="shrink-0" />

          <Link
            to="/shop"
            className="shrink-0 transition hover:text-black"
          >
            Shop
          </Link>

          <ChevronRight size={14} className="shrink-0" />

          <span className="truncate text-neutral-900">
            {product.name}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-7 sm:px-8 lg:px-10 lg:pt-10">
        {/* Product section */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] lg:gap-16">
          {/* =====================================================
              IMAGE GALLERY
          ====================================================== */}

          <div>
            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="aspect-[4/4.7]">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImage] || images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      Product image unavailable
                    </div>
                  )}
                </div>

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute left-4 top-4 rounded-full bg-orange-600 px-3.5 py-2 text-xs font-black text-white shadow-sm">
                    SAVE {discount}%
                  </div>
                )}

                {/* Featured badge */}
                {product.isFeatured && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold shadow-sm backdrop-blur">
                    <Sparkles size={13} />
                    Featured
                  </div>
                )}

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label={
                    isWishlisted(product._id || product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
                >
                  <Heart
                    size={20}
                    className={
                      isWishlisted(product._id || product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-neutral-900"
                    }
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={selectedImage === index}
                      className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition sm:h-24 sm:w-20 ${
                        selectedImage === index
                          ? "border-neutral-950"
                          : "border-transparent hover:border-neutral-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image reassurance */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <LockKeyhole size={14} />
                Secure checkout & protected payment
              </div>
            </div>
          </div>

          {/* =====================================================
              PRODUCT INFORMATION
          ====================================================== */}

          <div className="lg:py-2">
            <div className="lg:sticky lg:top-24">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                  {product.category}
                </span>

                {product.isNewArrival && (
                  <>
                    <span className="text-neutral-300">•</span>

                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      New Arrival
                    </span>
                  </>
                )}
              </div>

              {/* Name */}
              <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight text-neutral-950 sm:text-4xl lg:text-[42px]">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      className={
                        star <= Math.round(productRating)
                          ? "fill-orange-500 text-orange-500"
                          : "text-neutral-300"
                      }
                    />
                  ))}
                </div>

                {reviewCount > 0 ? (
                  <>
                    <span className="text-sm font-bold">
                      {productRating.toFixed(1)}
                    </span>

                    <a
                      href="#reviews"
                      className="text-sm text-neutral-500 underline underline-offset-4 hover:text-black"
                    >
                      {reviewCount}{" "}
                      {reviewCount === 1 ? "review" : "reviews"}
                    </a>
                  </>
                ) : (
                  <a
                    href="#reviews"
                    className="text-sm font-medium text-neutral-500 underline underline-offset-4"
                  >
                    Be the first to review
                  </a>
                )}
              </div>

              {/* Price */}
              <div className="mt-7 rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-3xl font-black tracking-tight">
                    ₹{price.toLocaleString("en-IN")}
                  </span>

                  {compareAtPrice > price && (
                    <span className="text-base text-neutral-400 line-through">
                      ₹{compareAtPrice.toLocaleString("en-IN")}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Inclusive of applicable taxes
                </p>
              </div>

              {/* Description */}
              

              {/* =================================================
                  COLOR
              ================================================== */}

              {colors.length > 0 && (
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold">
                      Color
                    </span>

                    <span className="text-sm text-neutral-500">
                      {activeColor}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          setQuantity(1);
                        }}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          activeColor === color
                            ? "border-neutral-950 bg-neutral-950 text-white"
                            : "border-neutral-300 bg-white hover:border-neutral-950"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================
                  SIZE
              ================================================== */}

              {sizes.length > 0 && (
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold">
                      Size
                    </span>

                    <button
                      type="button"
                      className="text-xs font-semibold text-neutral-500 underline underline-offset-4 hover:text-black"
                    >
                      Size guide
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`min-w-14 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                          activeSize === size
                            ? "border-neutral-950 bg-neutral-950 text-white"
                            : "border-neutral-300 bg-white hover:border-neutral-950"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================
                  STOCK
              ================================================== */}

              <div className="mt-7 flex items-center gap-2">
                {isOutOfStock ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      Currently out of stock
                    </span>
                  </>
                ) : stock <= 5 ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                    <span className="text-sm font-semibold text-orange-700">
                      Only {stock} left in stock
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-700">
                      In stock and ready to ship
                    </span>
                  </>
                )}
              </div>

              {/* =================================================
                  QUANTITY + CART
              ================================================== */}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-14 items-center justify-between rounded-xl border border-neutral-300 bg-white px-2 sm:w-36">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="text-sm font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock}
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <AddToCartButton
                  product={product}
                  quantity={quantity}
                  variant={{
                    size: activeSize,
                    color: activeColor,
                    sku: selectedVariant?.sku || "",
                    qikinkSku: selectedVariant?.qikinkSku || "",
                  }}
                  disabled={isOutOfStock}
                  className="h-14 flex-1 rounded-xl bg-neutral-950 px-6 text-sm font-bold hover:bg-orange-600"
                />
              </div>

              {/* Buy now */}
              <button
                type="button"
                onClick={buyNow}
                disabled={isOutOfStock}
                className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border-2 border-neutral-950 bg-white text-sm font-bold transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
              >
                Buy it now
              </button>
{(product.shortDescription || product.description) && (
                <p className="mt-6 text-sm leading-7 text-neutral-600">
                  {product.shortDescription || product.description}
                </p>
              )}
              {/* =================================================
                  TRUST / DELIVERY
              ================================================== */}

              <div className="mt-7 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                <div className="flex gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <Truck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Fast delivery across India
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Delivery estimates are shown during checkout based on
                      your address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Secure checkout
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Your payment details are handled through our secure
                      checkout process.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <RotateCcw size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Easy returns
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Return eligibility depends on our current return
                      policy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product assurance */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
                  <BadgeCheck
                    size={18}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                    Quality
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
                  <PackageCheck
                    size={18}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                    Packed safely
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
                  <LockKeyhole
                    size={18}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                    Secure
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
                  <Check
                    size={18}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                    Verified
                  </p>
                </div>
              </div>

              {/* Delivery check */}
              <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <MapPin size={18} />

                  <div>
                    <p className="text-sm font-bold">
                      Check delivery availability
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Enter your pincode during checkout to see the estimated
                      delivery date.
                    </p>
                  </div>
                </div>
              </div>

              {/* SKU / source */}
              {(product.qikinkSku || product.category) && (
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                  {product.qikinkSku && (
                    <span>
                      SKU:{" "}
                      <span className="font-medium text-neutral-600">
                        {product.qikinkSku}
                      </span>
                    </span>
                  )}

                  {product.category && (
                    <span>
                      Category:{" "}
                      <span className="font-medium text-neutral-600">
                        {product.category}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =======================================================
            REVIEWS
        ======================================================== */}

        <section
          id="reviews"
          className="mt-20 border-y border-neutral-200 py-16"
        >
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
            {/* Review summary */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                Customer reviews
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                What customers are saying
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-neutral-500">
                Honest feedback from customers who purchased this product.
              </p>

              <div className="mt-8 flex items-end gap-4">
                <span className="text-6xl font-black tracking-tight">
                  {reviewCount
                    ? productRating.toFixed(1)
                    : "0.0"}
                </span>

                <div className="pb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={17}
                        className={
                          star <= Math.round(productRating)
                            ? "fill-orange-500 text-orange-500"
                            : "text-neutral-300"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Based on {reviewCount}{" "}
                    {reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Rating distribution */}
              <div className="mt-7 space-y-3">
                {ratingDistribution.map(({ value, count }) => (
                  <div
                    key={value}
                    className="flex items-center gap-3 text-xs text-neutral-500"
                  >
                    <span className="w-10">
                      {value} star
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${
                            reviewCount
                              ? (count / reviewCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <span className="w-5 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Review form */}
              <div className="mt-10 border-t border-neutral-200 pt-8">
                <h3 className="text-lg font-black">
                  Share your experience
                </h3>

                {authuser ? (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="mt-5 space-y-4"
                  >
                    <div>
                      <span className="mb-2 block text-sm font-medium">
                        Your rating
                      </span>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            aria-label={`Rate ${star} out of 5`}
                            className="rounded p-1"
                          >
                            <Star
                              size={21}
                              className={
                                star <= reviewRating
                                  ? "fill-orange-500 text-orange-500"
                                  : "text-neutral-300"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      value={reviewTitle}
                      onChange={(event) =>
                        setReviewTitle(event.target.value)
                      }
                      maxLength={100}
                      placeholder="Review title (optional)"
                      className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-950"
                    />

                    <textarea
                      value={reviewComment}
                      onChange={(event) =>
                        setReviewComment(event.target.value)
                      }
                      required
                      maxLength={2000}
                      rows={5}
                      placeholder="Tell other customers about your experience..."
                      className="w-full resize-y rounded-xl border border-neutral-300 bg-white p-4 text-sm outline-none transition focus:border-neutral-950"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                    >
                      {submittingReview
                        ? "Saving review..."
                        : "Submit review"}
                    </button>
                  </form>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-neutral-600">
                    <Link
                      to="/api/login"
                      className="font-bold text-neutral-950 underline underline-offset-4"
                    >
                      Sign in
                    </Link>{" "}
                    to share your review.
                  </p>
                )}
              </div>
            </div>

            {/* Review list */}
            <div>
              <div className="flex items-baseline justify-between border-b border-neutral-200 pb-4">
                <h3 className="text-lg font-black">
                  Recent reviews
                </h3>

                <span className="text-xs text-neutral-500">
                  {reviewCount} total
                </span>
              </div>

              {reviewList.length > 0 ? (
                <div className="divide-y divide-neutral-200">
                  {[...reviewList]
                    .sort(
                      (first, second) =>
                        new Date(second?.createdAt || 0) -
                        new Date(first?.createdAt || 0)
                    )
                    .map((review) => (
                      <article
                        key={review?._id}
                        className="py-7"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-xs font-black uppercase">
                              {(review?.name || "C")
                                .slice(0, 1)}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold">
                                  {review?.name || "Customer"}
                                </p>

                                <BadgeCheck
                                  size={14}
                                  className="text-green-600"
                                />
                              </div>

                              <p className="mt-0.5 text-xs text-neutral-500">
                                {review?.createdAt
                                  ? new Date(
                                      review.createdAt
                                    ).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "Recently"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={13}
                                className={
                                  star <=
                                  Number(review?.rating || 0)
                                    ? "fill-orange-500 text-orange-500"
                                    : "text-neutral-300"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        {review?.title && (
                          <h4 className="mt-5 text-sm font-black">
                            {review.title}
                          </h4>
                        )}

                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-neutral-600">
                          {review?.comment}
                        </p>
                      </article>
                    ))}
                </div>
              ) : (
                <div className="py-12">
                  <p className="text-sm font-bold">
                    No reviews yet
                  </p>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                    Be the first customer to share your experience with
                    this product.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =======================================================
            RELATED PRODUCTS
        ======================================================== */}

        {featuredProducts.length > 0 && (
          <section className="pt-16 sm:pt-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                  You may also like
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  More from our collection
                </h2>
              </div>

              <Link
                to="/shop"
                className="hidden items-center gap-2 text-sm font-bold transition hover:text-orange-600 sm:flex"
              >
                Shop all
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
              {featuredProducts.map((item) => {
                const itemId = item?._id || item?.id;

                const itemImage =
                  item?.images?.[0] || item?.image;

                const itemComparePrice = Number(
                  item?.compareAtPrice || 0
                );

                const itemPrice = Number(item?.price || 0);

                const itemDiscount =
                  itemComparePrice > itemPrice
                    ? Math.round(
                        ((itemComparePrice - itemPrice) /
                          itemComparePrice) *
                          100
                      )
                    : 0;

                return (
                  <Link
                    key={itemId}
                    to={`/product/${itemId}`}
                    className="group min-w-0"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-white">
                      <div className="aspect-[4/5]">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item?.name || "Product"}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                            Image unavailable
                          </div>
                        )}
                      </div>

                      {item?.isFeatured && (
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide shadow-sm">
                          <Sparkles size={11} />
                          Featured
                        </span>
                      )}

                      {itemDiscount > 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-orange-600 px-2.5 py-1.5 text-[10px] font-black text-white">
                          -{itemDiscount}%
                        </span>
                      )}
                    </div>

                    <p className="mt-4 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                      {item?.category}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-neutral-950 group-hover:underline">
                      {item?.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-black">
                        ₹{itemPrice.toLocaleString("en-IN")}
                      </span>

                      {itemComparePrice > itemPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹
                          {itemComparePrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom reassurance */}
        <section className="mt-20 rounded-3xl bg-neutral-950 px-6 py-10 text-white sm:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex gap-4">
              <Truck className="shrink-0" size={22} />

              <div>
                <p className="font-bold">
                  Delivery across India
                </p>

                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  We deliver your order to serviceable locations across
                  India.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <ShieldCheck className="shrink-0" size={22} />

              <div>
                <p className="font-bold">
                  Secure shopping experience
                </p>

                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  Your order and payment information are handled securely.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock3 className="shrink-0" size={22} />

              <div>
                <p className="font-bold">
                  Customer support
                </p>

                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  We're here to help with your order and product questions.
                </p>
              </div>
            </div>
          </div>
          <BuyNowModal
  open={buyNowOpen}
  onClose={() => setBuyNowOpen(false)}
  product={product}
  quantity={quantity}
  variant={selectedVariant}
/>
        </section>
      </main>

      <Footer />
    </div>
  );
}