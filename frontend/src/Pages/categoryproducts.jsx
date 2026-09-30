import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AddToCartButton from "../components/addtocardbutton";
const categoryData = {
  "t-shirts": {
    name: "T-Shirts",
    title: "T-SHIRTS",
    description:
      "Statement-making tees designed to match your mood, energy and everyday vibe.",
    count: "24+ Designs",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=85",
  },

  hoodies: {
    name: "Hoodies",
    title: "HOODIES",
    description:
      "Comfort meets attitude. Discover oversized hoodies made for your everyday vibe.",
    count: "16+ Designs",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=85",
  },

  mugs: {
    name: "Mugs",
    title: "MUGS",
    description:
      "Bring a little personality to your coffee breaks with our expressive mug collection.",
    count: "12+ Designs",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=1600&q=85",
  },

  "tote-bags": {
    name: "Tote Bags",
    title: "TOTE BAGS",
    description:
      "Carry your essentials and your personality everywhere you go.",
    count: "10+ Designs",
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1600&q=85",
  },
};

// const products = [
//   {
//     id: 1,
//     name: "Stay Weird Oversized Tee",
//     category: "t-shirts",
//     price: 699,
//     oldPrice: 999,
//     badge: "BESTSELLER",
//     image:
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 2,
//     name: "No Bad Days Graphic Tee",
//     category: "t-shirts",
//     price: 749,
//     oldPrice: 999,
//     badge: "NEW",
//     image:
//       "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 3,
//     name: "Create Your Reality Tee",
//     category: "t-shirts",
//     price: 699,
//     oldPrice: 999,
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 4,
//     name: "Stay Original Graphic Tee",
//     category: "t-shirts",
//     price: 799,
//     oldPrice: 1099,
//     badge: "LIMITED",
//     image:
//       "https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 5,
//     name: "Midnight Oversized Hoodie",
//     category: "hoodies",
//     price: 1299,
//     oldPrice: 1699,
//     badge: "TRENDING",
//     image:
//       "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 6,
//     name: "Good Vibes Only Hoodie",
//     category: "hoodies",
//     price: 1399,
//     oldPrice: 1799,
//     badge: "SALE",
//     image:
//       "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 7,
//     name: "Minimal Street Hoodie",
//     category: "hoodies",
//     price: 1499,
//     oldPrice: 1899,
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 8,
//     name: "Coffee & Chaos Mug",
//     category: "mugs",
//     price: 399,
//     oldPrice: 599,
//     badge: "POPULAR",
//     image:
//       "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 9,
//     name: "Dream Big Mug",
//     category: "mugs",
//     price: 399,
//     oldPrice: 599,
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 10,
//     name: "Main Character Tote",
//     category: "tote-bags",
//     price: 499,
//     oldPrice: 699,
//     badge: "NEW",
//     image:
//       "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=85",
//   },

//   {
//     id: 11,
//     name: "Positive Energy Tote",
//     category: "tote-bags",
//     price: 499,
//     oldPrice: 699,
//     badge: "BESTSELLER",
//     image:
//       "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=85",
//   },
// ];
import { getProducts } from "../lib/productapi.js";
import { useWishlist } from "../context/WishlistContext";

const toCategorySlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function CategoryProducts() {
  const { slug } = useParams();
 const [products ,setProducts] = useState([])
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchProducts = async () => {
     try {
      
 
       const response = await getProducts();
       setProducts(response?.products || []);
     } catch (error) {
       console.error("Failed to load products:", error);
     } 
   };
  useEffect(() => {
    fetchProducts();
  }, []);

  const category = categoryData[slug];

  const categoryProducts = useMemo(() => {
    if (!category) return [];

    let result = products.filter(
      (product) => toCategorySlug(product.category) === slug
    );

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
  }, [slug, search, sort, category , products]);

  /* Invalid category */
  if (!category) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#fafafa] px-5">
        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            404
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Category not found
          </h1>

          <p className="mt-3 text-neutral-500">
            The category you're looking for doesn't exist.
          </p>

          <Link
            to="/categories"
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              font-bold
              text-white
            "
          >
            View Categories
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>
      </main>
    );
  }

  return (
      <main className="min-h-screen bg-[#fafafa] text-neutral-950">
        <Navbar/>

      {/* =================================================
          CATEGORY HERO
      ================================================= */}

      

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8">

        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">

          <Link
            to="/"
            className="transition hover:text-black"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            to="/categories"
            className="transition hover:text-black"
          >
            Categories
          </Link>

          <span>/</span>

          <span className="font-bold text-neutral-900">
            {category.name}
          </span>

        </div>

      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {/* Header */}
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              {category.name}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Shop {category.name}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {categoryProducts.length} products
            </p>

          </div>

          {/* Controls */}
          <div className="flex gap-3">

            {/* Search */}
            <div className="relative flex-1 sm:w-64">

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
                placeholder="Search..."
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

            {/* Filter */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
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
                font-bold
                transition
                hover:border-black
              "
            >
              <SlidersHorizontal className="h-4 w-4" />

              <span className="hidden sm:inline">
                Filter
              </span>
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
                  pl-5
                  pr-10
                  text-sm
                  font-bold
                  outline-none
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

        {/* Mobile sort */}
        {filterOpen && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-4
              sm:hidden
            "
          >
            <p className="mb-3 text-sm font-bold">
              Sort by
            </p>

            <div className="grid grid-cols-2 gap-2">

              <SortButton
                active={sort === "featured"}
                onClick={() => {
                  setSort("featured");
                  setFilterOpen(false);
                }}
              >
                Featured
              </SortButton>

              <SortButton
                active={sort === "newest"}
                onClick={() => {
                  setSort("newest");
                  setFilterOpen(false);
                }}
              >
                Newest
              </SortButton>

              <SortButton
                active={sort === "price-low"}
                onClick={() => {
                  setSort("price-low");
                  setFilterOpen(false);
                }}
              >
                Price: Low
              </SortButton>

              <SortButton
                active={sort === "price-high"}
                onClick={() => {
                  setSort("price-high");
                  setFilterOpen(false);
                }}
              >
                Price: High
              </SortButton>

            </div>
          </div>
        )}

        {/* Product grid */}
        {categoryProducts.length > 0 ? (
          <div
            className="
              mt-9
              grid
              grid-cols-2
              gap-x-4
              gap-y-10
              md:grid-cols-3
              lg:grid-cols-4
              lg:gap-x-6
            "
          >
            {categoryProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                liked={isWishlisted(product._id || product.id)}
                onWishlist={() => toggleWishlist(product)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <Search className="h-8 w-8 text-neutral-400" />
            </div>

            <h3 className="mt-6 text-xl font-black">
              No products found
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              Try a different search.
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
              "
            >
              Clear Search
            </button>

          </div>
        )}

      </section>

      {/* =================================================
          OTHER CATEGORIES
      ================================================= */}

      <section className="border-t border-neutral-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                Keep exploring
              </p>

              <h2 className="mt-2 text-2xl font-black">
                More from Printzenz
              </h2>

            </div>

            <Link
              to="/categories"
              className="
                hidden
                items-center
                gap-2
                text-sm
                font-bold
                sm:flex
              "
            >
              All Categories
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

            {Object.entries(categoryData)
              .filter(([key]) => key !== slug)
              .map(([key, item]) => (
                <Link
                  key={key}
                  to={`/categories/${key}`}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    bg-neutral-100
                  "
                >

                  <div className="aspect-[4/3]">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                      "
                    />

                  </div>

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-transparent
                      to-transparent
                    "
                  />

                  <div className="absolute bottom-4 left-4 text-white">

                    <p className="text-sm font-black">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[10px] text-white/70">
                      {item.count}
                    </p>

                  </div>

                </Link>
              ))}

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

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">

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
            transition
            hover:scale-110
          "
          aria-label="Add to wishlist"
        >
          <Heart
            className={`
              h-4
              w-4
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

      {/* Product info */}
      <div className="mt-4">

        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {product.category.replace("-", " ")}
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

          {(product.compareAtPrice > product.price || product.oldPrice > product.price) && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{product.compareAtPrice || product.oldPrice}
            </span>
          )}

        </div>

      </div>

    </article>
  );
}


/* =================================================
   SORT BUTTON
================================================= */

function SortButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-xl
        border
        px-4
        py-3
        text-sm
        font-bold
        ${
          active
            ? "border-black bg-black text-white"
            : "border-neutral-200 bg-white text-neutral-700"
        }
      `}
    >
      {children}
    </button>
  );
}

export default CategoryProducts;