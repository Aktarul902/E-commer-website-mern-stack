import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search as SearchIcon,
  X,
  Heart,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { getProducts } from "../lib/productapi.js";
import { useWishlist } from "../context/WishlistContext";

/* =====================================================
   SEARCH PAGE
===================================================== */

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const queryFromUrl = searchParams.get("q") || "";

  const [input, setInput] = useState(queryFromUrl);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((response) => {
        if (isMounted) {
          setProducts(response?.products || []);
        }
      })
      .catch((error) => {
        console.error("Failed to load products for search:", error);
        if (isMounted) setLoadError("Unable to load products.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /* =====================================================
     SEARCH PRODUCTS
  ===================================================== */

  const results = useMemo(() => {
    let result = [...products];

    const query = queryFromUrl.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.slug || "").toLowerCase().includes(query)
        );
      });
    }

    if (category !== "All") {
      result = result.filter(
        (product) => product.category === category
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [products, queryFromUrl, category, sort]);

  /* =====================================================
     SEARCH SUBMIT
  ===================================================== */

  const handleSearch = (e) => {
    e.preventDefault();

    const value = input.trim();

    if (!value) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      q: value,
    });

    setCategory("All");
  };

  /* =====================================================
     CLEAR SEARCH
  ===================================================== */

  const clearSearch = () => {
    setInput("");
    setSearchParams({});
    setCategory("All");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-950">
<Navbar/>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-14">

        {/* Breadcrumb */}

        <div className="mb-8 flex items-center gap-2 text-xs font-medium text-neutral-400">

          <Link
            to="/"
            className="transition hover:text-black"
          >
            Home
          </Link>

          <span>/</span>

          <span className="font-bold text-neutral-900">
            Search
          </span>

        </div>

        {/* Heading */}

        <div>

          <div
            className="
              mb-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-neutral-200
              bg-white
              px-4
              py-2
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-neutral-500
            "
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />

            Find your style
          </div>

          <h1
            className="
              text-4xl
              font-black
              tracking-[-0.05em]
              sm:text-6xl
            "
          >
            Search
            <span className="text-orange-500">.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Find your favourite Printzenz designs,
            products and everyday essentials.
          </p>

        </div>

      </section>

      {/* =================================================
          SEARCH BAR
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 sm:px-8">

        <form
          onSubmit={handleSearch}
          className="
            relative
            flex
            w-full
            items-center
          "
        >

          <SearchIcon
            className="
              absolute
              left-5
              h-5
              w-5
              text-neutral-400
            "
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for t-shirts, hoodies, mugs..."
            className="
              h-14
              w-full
              rounded-full
              border
              border-neutral-200
              bg-white
              pl-14
              pr-32
              text-sm
              outline-none
              transition
              placeholder:text-neutral-400
              focus:border-black
              focus:ring-4
              focus:ring-black/5
            "
          />

          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="
                absolute
                right-24
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-neutral-100
                transition
                hover:bg-neutral-200
              "
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className="
              absolute
              right-1.5
              h-11
              rounded-full
              bg-black
              px-6
              text-sm
              font-bold
              text-white
              transition
              hover:bg-orange-500
            "
          >
            Search
          </button>

        </form>

      </section>

      {/* =================================================
          POPULAR SEARCHES
      ================================================= */}

      {!queryFromUrl && (
        <section className="mx-auto max-w-7xl px-5 pt-7 sm:px-8">

          <div className="flex flex-wrap items-center gap-2">

            <span className="mr-2 text-xs font-bold text-neutral-400">
              Popular:
            </span>

            <PopularSearch
              text="T-Shirts"
              onClick={() => {
                setInput("T-Shirts");
                setSearchParams({ q: "T-Shirts" });
              }}
            />

            <PopularSearch
              text="Hoodies"
              onClick={() => {
                setInput("Hoodies");
                setSearchParams({ q: "Hoodies" });
              }}
            />

            <PopularSearch
              text="Mugs"
              onClick={() => {
                setInput("Mugs");
                setSearchParams({ q: "Mugs" });
              }}
            />

            <PopularSearch
              text="Tote Bags"
              onClick={() => {
                setInput("Tote Bags");
                setSearchParams({ q: "Tote Bags" });
              }}
            />

          </div>

        </section>
      )}

      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">

        <div
          className="
            flex
            flex-col
            gap-4
            border-y
            border-neutral-200
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            {queryFromUrl ? (
              <p className="text-sm">

                Results for{" "}

                <span className="font-black">
                  "{queryFromUrl}"
                </span>

                <span className="ml-2 text-neutral-400">
                  ({results.length})
                </span>

              </p>
            ) : (
              <p className="text-sm font-bold">
                All Products
                <span className="ml-2 text-neutral-400">
                  ({results.length})
                </span>
              </p>
            )}

          </div>

          <div className="flex gap-3">

            {/* Category */}

            <div className="relative">

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="
                  h-10
                  appearance-none
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  pl-4
                  pr-9
                  text-xs
                  font-bold
                  outline-none
                  focus:border-black
                "
              >

                <option value="All">
                  All Categories
                </option>

                <option value="T-Shirts">
                  T-Shirts
                </option>

                <option value="Hoodies">
                  Hoodies
                </option>

                <option value="Mugs">
                  Mugs
                </option>

                <option value="Tote Bags">
                  Tote Bags
                </option>

              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  h-3.5
                  w-3.5
                  -translate-y-1/2
                "
              />

            </div>

            {/* Sort */}

            <div className="relative">

              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
                className="
                  h-10
                  appearance-none
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  pl-4
                  pr-9
                  text-xs
                  font-bold
                  outline-none
                  focus:border-black
                "
              >

                <option value="relevance">
                  Relevance
                </option>

                <option value="price-low">
                  Price: Low
                </option>

                <option value="price-high">
                  Price: High
                </option>

                <option value="name">
                  Name
                </option>

              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  h-3.5
                  w-3.5
                  -translate-y-1/2
                "
              />

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          RESULTS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {loading ? (
          <div className="py-24 text-center text-sm font-semibold text-neutral-500" role="status">
            Loading products...
          </div>
        ) : loadError ? (
          <div className="py-24 text-center text-sm font-semibold text-red-600" role="alert">
            {loadError}
          </div>
        ) : results.length > 0 ? (

          <div
            className="
              grid
              grid-cols-2
              gap-x-4
              gap-y-10
              md:grid-cols-3
              lg:grid-cols-4
              lg:gap-x-6
            "
          >

            {results.map((product) => (

              <ProductCard
                key={product._id}
                product={product}
                liked={isWishlisted(product._id)}
                onWishlist={() => toggleWishlist(product)}
              />

            ))}

          </div>

        ) : (

          <EmptySearch
            query={queryFromUrl}
            onClear={clearSearch}
          />

        )}

      </section>

      {/* =================================================
          BOTTOM CATEGORY LINKS
      ================================================= */}

      <section className="border-t border-neutral-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">

          <div className="flex items-end justify-between">

            <div>

              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-orange-500
                "
              >
                Explore
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Shop by category
              </h2>

            </div>

            <Link
              to="/categories"
              className="
                group
                flex
                items-center
                gap-2
                text-sm
                font-bold
              "
            >
              View all

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

          <div
            className="
              mt-7
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-4
            "
          >

            <CategoryLink
              name="T-Shirts"
              path="/categories/t-shirts"
            />

            <CategoryLink
              name="Hoodies"
              path="/categories/hoodies"
            />

            <CategoryLink
              name="Mugs"
              path="/categories/mugs"
            />

            <CategoryLink
              name="Tote Bags"
              path="/categories/tote-bags"
            />

          </div>

        </div>

      </section>
<Footer/>
    </main>
  );
}

/* =====================================================
   PRODUCT CARD
===================================================== */

function ProductCard({
  product,
  liked,
  onWishlist,
}) {
  return (
    <article className="group">

      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden
          rounded-2xl
          bg-neutral-100
        "
      >

        <Link to={`/product/${product._id}`}>

          <img
            src={product.images?.[0] || ""}
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
          aria-label="Add to wishlist"
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
            transition
            duration-300
            hover:scale-110
          "
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

        <button
          className="
            absolute
            bottom-3
            left-3
            right-3
            flex
            translate-y-3
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-black
            py-3
            text-xs
            font-bold
            text-white
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
        >

          <ShoppingBag className="h-4 w-4" />

          Quick Add

        </button>

      </div>

      {/* Product information */}

      <div className="mt-4">

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-neutral-400
          "
        >
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

          {product.oldPrice && (
            <span
              className="
                text-xs
                text-neutral-400
                line-through
              "
            >
              ₹{product.oldPrice}
            </span>
          )}

        </div>

      </div>

    </article>
  );
}

/* =====================================================
   EMPTY SEARCH
===================================================== */

function EmptySearch({
  query,
  onClear,
}) {
  return (
    <div className="py-20 text-center">

      <div
        className="
          mx-auto
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          bg-neutral-100
        "
      >
        <SearchIcon className="h-9 w-9 text-neutral-400" />
      </div>

      <h2
        className="
          mt-7
          text-2xl
          font-black
          tracking-tight
        "
      >
        No results found
      </h2>

      {query && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          We couldn't find anything matching{" "}
          <span className="font-bold text-neutral-800">
            "{query}"
          </span>
          .
        </p>
      )}

      <div className="mt-7 flex flex-col items-center gap-3">

        <button
          onClick={onClear}
          className="
            rounded-full
            bg-black
            px-7
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-orange-500
          "
        >
          Clear Search
        </button>

        <Link
          to="/shop"
          className="
            text-sm
            font-bold
            underline
            underline-offset-4
            transition
            hover:text-orange-500
          "
        >
          Browse all products
        </Link>

      </div>

    </div>
  );
}

/* =====================================================
   POPULAR SEARCH
===================================================== */

function PopularSearch({
  text,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="
        rounded-full
        border
        border-neutral-200
        bg-white
        px-4
        py-2
        text-xs
        font-bold
        text-neutral-600
        transition
        hover:border-black
        hover:bg-black
        hover:text-white
      "
    >
      {text}
    </button>
  );
}

/* =====================================================
   CATEGORY LINK
===================================================== */

function CategoryLink({
  name,
  path,
}) {
  return (
    <Link
      to={path}
      className="
        group
        flex
        items-center
        justify-between
        rounded-2xl
        border
        border-neutral-200
        bg-neutral-50
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-black
        hover:bg-black
        hover:text-white
      "
    >

      <span className="text-sm font-black">
        {name}
      </span>

      <ArrowRight
        className="
          h-4
          w-4
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
      />

    </Link>
  );
}

export default Search;