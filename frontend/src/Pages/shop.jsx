import { useMemo, useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AddToCartButton from "../components/addtocardbutton";
import {
  SlidersHorizontal,
  ChevronDown,
  Heart,
  ShoppingBag,
  Search,
  X,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { useWishlist } from "../context/WishlistContext";


const categories = [
  "All",
  "T-Shirts",
  "Hoodies",
  "Mugs",
  "Tote Bags",
];
import {axiosinstance} from '../lib/axios.js'
function Shop() {
  const [products,setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();

  const fetchProducts = async () => {
    try {
     

      const response = await axiosinstance.get("/products");

      setProducts(
        response.data?.products ||
          response.data?.data ||
          []
      );
    } catch (error) {
      console.error("Failed to load products:", error);
    } 
  };
  useEffect(() => {
    fetchProducts();
  }, []);





  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (search.trim()) {
      result = result.filter((product) =>
        product.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "newest") {
      result.reverse();
    }

    return result;
  }, [selectedCategory, search, sort, products]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-950">

      {/* =========================================
          SHOP HERO
      ========================================== */}

  <Navbar/>

      {/* =========================================
          SHOP CONTENT
      ========================================== */}

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

        {/* Top controls */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  whitespace-nowrap
                  rounded-full
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition-all
                  duration-300

                  ${
                    selectedCategory === category
                      ? "bg-black text-white shadow-lg"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black"
                  }
                `}
              >
                {category}
              </button>
            ))}

          </div>

          {/* Right controls */}
          <div className="flex gap-3">

            {/* Search */}
            <div className="relative flex-1 lg:w-64">

              <Search
                className="
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-neutral-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="
                  h-11
                  w-full
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  pl-11
                  pr-10
                  text-sm
                  outline-none
                  transition
                  focus:border-black
                "
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              )}

            </div>

            {/* Filter */}
            <button
              onClick={() =>
                setMobileFilterOpen(!mobileFilterOpen)
              }
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-full
                border
                border-neutral-200
                bg-white
                px-5
                text-sm
                font-semibold
                transition
                hover:border-black
              "
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>

            {/* Sort */}
            <div className="relative hidden sm:block">

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="
                  h-11
                  appearance-none
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  py-0
                  pl-5
                  pr-10
                  text-sm
                  font-semibold
                  outline-none
                  transition
                  focus:border-black
                "
              >
                <option value="featured">
                  Featured
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                "
              />

            </div>

          </div>

        </div>

        {/* Mobile filter panel */}
        {mobileFilterOpen && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-5
              lg:hidden
            "
          >
            <p className="mb-3 text-sm font-bold">
              Sort products
            </p>

            <div className="grid grid-cols-2 gap-2">

              {[
                ["featured", "Featured"],
                ["newest", "Newest"],
                ["price-low", "Price: Low"],
                ["price-high", "Price: High"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSort(value);
                    setMobileFilterOpen(false);
                  }}
                  className={`
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-semibold

                    ${
                      sort === value
                        ? "border-black bg-black text-white"
                        : "border-neutral-200"
                    }
                  `}
                >
                  {label}
                </button>
              ))}

            </div>
          </div>
        )}

        {/* Product count */}
        <div className="mt-10 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-black tracking-tight">
              All Products
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {filteredProducts.length} products
            </p>
          </div>

          <p className="hidden text-sm text-neutral-400 sm:block">
            Made to express you.
          </p>

        </div>

        {/* =========================================
            PRODUCTS
        ========================================== */}

        {filteredProducts.length > 0 ? (
          <div
            className="
              mt-8
              grid
              grid-cols-2
              gap-x-4
              gap-y-10
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              lg:gap-x-6
            "
          >

            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                liked={isWishlisted(product._id)}
                onWishlist={() => toggleWishlist(product)}
              />
            ))}

          </div>
        ) : (
          <div className="py-24 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <Search className="h-8 w-8 text-neutral-400" />
            </div>

            <h3 className="mt-6 text-xl font-bold">
              No products found
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              Try another search or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="
                mt-6
                rounded-full
                bg-black
                px-6
                py-3
                text-sm
                font-bold
                text-white
              "
            >
              View all products
            </button>

          </div>
        )}

        {/* Load more */}
        {filteredProducts.length > 0 && (
          <div className="mt-16 text-center">

            <button
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-black
                px-7
                py-3.5
                text-sm
                font-bold
                transition-all
                duration-300
                hover:bg-black
                hover:text-white
              "
            >
              Load More

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>

          </div>
        )}

      </section>

      {/* =========================================
          BOTTOM CTA
      ========================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">

        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-black
            px-7
            py-14
            text-white
            sm:px-12
            lg:px-16
          "
        >

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />

          <div className="relative max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              Don't just wear clothes
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Wear something
              <span className="text-orange-400">
                {" "}that feels like you.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">
              Your style is personal. Your clothes should be too.
              Find a design that matches your energy.
            </p>

            <Link
              to="/shop"
              className="
                group
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white
                px-7
                py-3.5
                text-sm
                font-bold
                text-black
                transition
                hover:bg-orange-400
              "
            >
              Explore Collection

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>

          </div>

        </div>

      </section>
<Footer/>
    </main>
  );
}


/* =========================================
   PRODUCT CARD
========================================= */

function ProductCard({
  product,
  liked,
  onWishlist,
}) 




{
  return (
    <article className="group">

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">

        <Link to={`/product/${product._id}`}>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-105
              "
            />
          )}

        </Link>

        {/* Badge */}
        {product.badge && (
          <span
            className={`
              absolute
              left-3
              top-3
              rounded-full
              px-3
              py-1.5
              text-[9px]
              font-black
              tracking-wider

              ${
                product.badge === "SALE"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-black"
              }
            `}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={onWishlist}
          className="
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/90
            shadow-sm
            backdrop-blur
            transition-all
            duration-300
            hover:scale-110
          "
          aria-label="Add to wishlist"
        >
          <Heart
            className={`
              h-4
              w-4
              transition
              ${
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-black"
              }
            `}
          />
        </button>

        {/* Quick add */}
        <div
          className="
            absolute
            bottom-3
            left-3
            right-3
            translate-y-3
            opacity-0
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
            max-sm:static
            max-sm:mt-3
            max-sm:translate-y-0
            max-sm:opacity-100
          "
          onClick={(event) => event.stopPropagation()}
        >
          <AddToCartButton
            product={product}
            quantity={1}
            label="Quick Add"
            icon={<ShoppingBag className="h-4 w-4" />}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-neutral-800"
          />
        </div>

      </div>

      {/* Details */}
      <div className="mt-4">

        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          {product.category}
        </p>

        <Link
          to={`/product/${product._id}`}
          className="
            mt-1
            block
            text-sm
            font-bold
            leading-5
            transition
            hover:text-orange-500
          "
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2">

          <span className="text-sm font-black">
            ₹{product.price}
          </span>

          {product.compareAtPrice > product.price && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{product.compareAtPrice}
            </span>
          )}

        </div>

      </div>

   
    </article>
  );
}

export default Shop;