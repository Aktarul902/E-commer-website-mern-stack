import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Search,
  X,
  ChevronDown,
  Tag,
  Flame,
} from "lucide-react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import AddToCartButton from "../components/addtocardbutton";
import { getProducts } from "../lib/productapi";
import { useWishlist } from "../context/WishlistContext";

function Sale() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("discount");
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sale-products"],
    queryFn: getProducts,
  });

  const saleProducts = useMemo(
    () =>
      (Array.isArray(data?.products) ? data.products : [])
        .filter((product) => product.isSale)
        .map((product) => {
          const price = Number(product.price) || 0;
          const oldPrice = Number(product.compareAtPrice || product.oldPrice) || 0;

          return {
            ...product,
            id: product._id || product.id,
            image: product.images?.[0] || "",
            price,
            oldPrice,
            discount:
              oldPrice > price
                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                : 0,
          };
        }),
    [data]
  );
  const highestDiscount = saleProducts.reduce(
    (highest, product) => Math.max(highest, product.discount),
    0
  );

  const filteredProducts = useMemo(() => {
    let result = [...saleProducts];

    if (search.trim()) {
      result = result.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          product.category
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (sort === "discount") {
      result.sort((a, b) => b.discount - a.discount);
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [saleProducts, search, sort]);

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

          <span className="font-bold text-orange-500">
            Sale
          </span>

        </div>

        <div
          className="
            flex
            flex-col
            gap-6
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div>

            {/* Sale label */}

            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-orange-500
                px-4
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.15em]
                text-white
              "
            >
              <Tag className="h-3.5 w-3.5" />

              Limited Time Sale
            </div>

            <h1
              className="
                text-4xl
                font-black
                tracking-[-0.05em]
                sm:text-6xl
              "
            >
              Sale
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
              Your favourite Printzenz designs, now at
              prices you'll love. Grab them before they're
              gone.
            </p>

          </div>

          {/* Savings */}

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-orange-100
              bg-orange-50
              px-5
              py-4
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-orange-500
                text-white
              "
            >
              <Flame className="h-5 w-5" />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                Up to
              </p>

              <p className="text-xl font-black">
                {highestDiscount > 0 ? `${highestDiscount}% OFF` : "Deals"}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          SALE INFO STRIP
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 sm:px-8">

        <div
          className="
            grid
            overflow-hidden
            rounded-2xl
            border
            border-neutral-200
            bg-white
            sm:grid-cols-3
          "
        >

          <SaleInfo
            title="Big Savings"
            text="Save on selected designs."
          />

          <SaleInfo
            title="Limited Stock"
            text="Popular designs won't last forever."
          />

          <SaleInfo
            title="COD Available"
            text="Shop easily across India."
          />

        </div>

      </section>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 sm:px-8">

        <div
          className="
            mt-10
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
              placeholder="Search sale products..."
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

          {/* Product count + sort */}

          <div className="flex items-center gap-3">

            <span className="hidden text-xs font-bold text-neutral-400 sm:block">
              {filteredProducts.length} Products
            </span>

            <div className="relative">

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
                  pl-5
                  pr-11
                  text-sm
                  font-bold
                  outline-none
                  transition
                  focus:border-black
                "
              >

                <option value="discount">
                  Biggest Discount
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

      </section>

      {/* =================================================
          PRODUCT GRID
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {isLoading ? (
          <div className="py-24 text-center text-sm font-semibold text-neutral-500" role="status">
            Loading sale products...
          </div>
        ) : isError ? (
          <div className="py-24 text-center text-sm font-semibold text-red-600" role="alert">
            Unable to load sale products. Please try again later.
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

              <SaleProductCard
                key={product.id}
                product={product}
                liked={isWishlisted(product.id)}
                onWishlist={() => toggleWishlist(product)}
              />

            ))}

          </div>

        ) : (

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
              No sale products found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try searching for another product.
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
          CATEGORY SHORTCUTS
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
                Shop by category
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  tracking-tight
                "
              >
                Find your deal
              </h2>

            </div>

            <Link
              to="/shop"
              className="
                group
                flex
                items-center
                gap-2
                text-sm
                font-bold
              "
            >
              View all products

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
   SALE PRODUCT CARD
================================================= */

function SaleProductCard({
  product,
  liked,
  onWishlist,
}) {
  return (
    <article className="group">

      {/* Image */}

      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden
          rounded-2xl
          bg-neutral-100
        "
      >

        <Link to={`/product/${product.id}`}>

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-300">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}

        </Link>

        {/* Discount badge */}

        {product.discount > 0 && <span
          className="
            absolute
            left-3
            top-3
            rounded-full
            bg-orange-500
            px-3
            py-1.5
            text-[9px]
            font-black
            tracking-wider
            text-white
          "
        >
          {product.discount}% OFF
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

      {/* Details */}

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
          {product.category || "Uncategorized"}
        </p>

        <Link
          to={`/product/${product.id}`}
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

          {product.oldPrice > product.price && <span
            className="
              text-xs
              text-neutral-400
              line-through
            "
          >
            ₹{product.oldPrice}
          </span>}

        </div>

        {product.oldPrice > product.price && (
          <p className="mt-1 text-[10px] font-bold text-orange-500">
            You save ₹{product.oldPrice - product.price}
          </p>
        )}

      </div>

    </article>
  );
}


/* =================================================
   SALE INFO
================================================= */

function SaleInfo({ title, text }) {
  return (
    <div
      className="
        border-b
        border-neutral-200
        p-5
        last:border-b-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >

      <h3 className="text-sm font-black">
        {title}
      </h3>

      <p className="mt-1 text-xs text-neutral-500">
        {text}
      </p>

    </div>
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
        hover:border-orange-500
        hover:bg-orange-500
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

export default Sale;