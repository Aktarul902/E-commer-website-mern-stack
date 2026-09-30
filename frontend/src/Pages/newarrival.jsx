import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Search,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import AddToCartButton from "../components/addtocardbutton";
import { getProducts } from "../lib/productapi.js";
import { useWishlist } from "../context/WishlistContext";

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;

    const fetchNewArrivals = async () => {
      try {
        const response = await getProducts();
        if (isMounted) {
          setProducts(
            (response?.products || []).filter((product) => product.isNewArrival)
          );
        }
      } catch (error) {
        console.error("Failed to load new arrivals:", error);
        if (isMounted) setLoadError("Unable to load new arrivals.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNewArrivals();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

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

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [products, search, sort]);

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
            New Arrivals
          </span>

        </div>

        {/* Heading */}

        <div
          className="
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div>

            <div
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-orange-200
                bg-orange-50
                px-3
                py-1.5
                text-[10px]
                font-black
                uppercase
                tracking-[0.15em]
                text-orange-600
              "
            >
              <Sparkles className="h-3.5 w-3.5" />

              Fresh Drops
            </div>

            <h1
              className="
                text-4xl
                font-black
                tracking-[-0.04em]
                sm:text-6xl
              "
            >
              New Arrivals
              <span className="text-orange-500">.</span>
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-neutral-500
                sm:text-base
              "
            >
              Fresh designs, new vibes and the latest
              additions to the Printzenz collection.
            </p>

          </div>

          <div className="text-sm font-bold text-neutral-400">
            {loading ? "Loading products..." : `${filteredProducts.length} Products`}
          </div>

        </div>

      </section>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 sm:px-8">

        <div
          className="
            flex
            flex-col
            gap-3
            border-y
            border-neutral-200
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* Search */}

          <div className="relative w-full sm:max-w-sm">

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
              placeholder="Search new arrivals..."
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
                placeholder:text-neutral-400
                focus:border-black
              "
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                "
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}

          </div>

          {/* Sort */}

          <div className="relative">

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="
                h-11
                w-full
                appearance-none
                rounded-full
                border
                border-neutral-200
                bg-white
                pl-5
                pr-11
                text-sm
                font-bold
                outline-none
                transition
                focus:border-black
                sm:w-52
              "
            >

              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name">
                Name
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

      </section>

      {/* =================================================
          PRODUCT GRID
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {loading ? (
          <div className="py-24 text-center text-sm text-neutral-500">
            Loading new arrivals...
          </div>
        ) : loadError ? (
          <div className="py-24 text-center text-sm text-red-600">
            {loadError}
          </div>
        ) : filteredProducts.length > 0 ? (

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

            {filteredProducts.map((product) => (

              <ProductCard
                key={product._id || product.id}
                product={product}
                liked={isWishlisted(product._id || product.id)}
                onWishlist={() => toggleWishlist(product)}
              />

            ))}

          </div>

        ) : (

          /* Empty state */

          <div className="py-24 text-center">

            <div
              className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-neutral-100
              "
            >
              <Search className="h-8 w-8 text-neutral-400" />
            </div>

            <h2 className="mt-6 text-xl font-black">
              No new arrivals found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try searching for something else.
            </p>

            <button
              onClick={() => setSearch("")}
              className="
                mt-6
                rounded-full
                bg-black
                px-6
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

          </div>

        )}

      </section>

      {/* =================================================
          CATEGORY LINKS
      ================================================= */}

      <section className="border-t border-neutral-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">

          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

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
                Keep exploring
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  tracking-tight
                "
              >
                Shop your vibe
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
              All Categories

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


/* =================================================
   PRODUCT CARD
================================================= */

function ProductCard({
  product,
  liked,
  onWishlist,
}) {
  return (
    <article className="group">

      {/* Product Image */}

      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden
          rounded-2xl
          bg-neutral-100
        "
      >

        <Link to={`/product/${product._id || product.id}`}>

          <img
            src={product.images?.[0] || product.image || ""}
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

        {(product.badge || product.isNewArrival) && <span
          className="
            absolute
            left-3
            top-3
            rounded-full
            bg-black
            px-3
            py-1.5
            text-[9px]
            font-black
            tracking-wider
            text-white
          "
        >
          {product.badge || "NEW"}
        </span>}

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

        {/* Quick Add */}

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

      {/* Product Details */}

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
          to={`/product/${product._id || product.id}`}
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

          {(product.compareAtPrice > product.price || product.oldPrice > product.price) && <span
            className="
              text-xs
              text-neutral-400
              line-through
            "
          >
            ₹{product.compareAtPrice || product.oldPrice}
          </span>}

        </div>

      </div>

    </article>
  );
}


/* =================================================
   CATEGORY LINK
================================================= */

function CategoryLink({ name, path }) {
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

export default NewArrivals;