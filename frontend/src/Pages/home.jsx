import { useEffect, useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AddToCartButton from "../components/addtocardbutton";
import { getProducts } from "../lib/productapi.js";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronRight,
  
} from "lucide-react";

const categories = [
  {
    name: "Oversized Tees",
    subtitle: "Streetwear energy",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900",
    link: "/category/t-shirts",
  },
  {
    name: "Hoodies",
    subtitle: "Cozy. Bold. You.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900",
    link: "/category/hoodies",
  },
  {
    name: "Mugs",
    subtitle: "Sip your style",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900",
    link: "/category/mugs",
  },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        if (isMounted) setProducts(response?.products || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        if (isMounted) setProductsError("Unable to load products.");
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredTshirt = products
    .filter((product) =>
      product.category
        ?.toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") === "t-shirts"
    )
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

  return (
    <main className="overflow-hidden bg-[#fafafa] text-neutral-950">

      {/* =========================
          ANNOUNCEMENT BAR
      ========================== */}
      <div className="relative overflow-hidden bg-black py-2.5 text-center text-xs font-semibold tracking-[0.18em] text-white">
        <div className="animate-marquee whitespace-nowrap">
          FREE SHIPPING ALl OVER INDIA &nbsp; ✦ &nbsp;
          COD AVAILABLE &nbsp; ✦ &nbsp;
          NEW DROPS EVERY WEEK &nbsp; ✦ &nbsp;
          FREE SHIPPING ALl OVER INDIA
        </div>
      </div>
      <Navbar/>

      {/* =========================
          HERO
      ========================== */}
      <section className="relative min-h-[720px] overflow-hidden bg-[#111]">

        {/* colorful blobs */}
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

        {/* grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">

          {/* hero copy */}
          <div className="z-10 max-w-2xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              India's new-age printwear brand
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              WEAR
              <span className="block bg-gradient-to-r from-fuchsia-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                YOUR
              </span>
              VIBE.
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-white/70">
              Bold designs. Premium comfort. Zero boring outfits.
              Discover oversized tees and statement pieces made for
              people who don't follow the crowd.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">

              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-300"
              >
                Shop Collection
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/category/t-shirts"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20"
              >
                Explore Tees
              </Link>

            </div>

            <div className="mt-10 flex flex-wrap gap-7 text-sm text-white/60">
              <div>
                <strong className="text-xl text-white">10K+</strong>
                <p>Happy customers</p>
              </div>

              <div>
                <strong className="text-xl text-white">4.8/5</strong>
                <p>Customer rating</p>
              </div>

              <div>
                <strong className="text-xl text-white">100%</strong>
                <p>Original designs</p>
              </div>
            </div>
          </div>

          {/* hero visual */}
          <div className="relative hidden h-[600px] lg:block">

            <div className="absolute right-8 top-10 h-[470px] w-[360px] rotate-[-8deg] overflow-hidden rounded-[40px] shadow-2xl shadow-fuchsia-500/20 transition-transform duration-700 hover:rotate-[-3deg] hover:scale-105">
              <img
                src={
                  featuredTshirt?.images?.[0] ||
                  featuredTshirt?.image ||
                  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000"
                }
                alt={featuredTshirt?.name || "Printzenz oversized t-shirt"}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 text-white">
                <p className="text-sm font-medium text-white/70">
                  FEATURED DROP
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  {featuredTshirt?.name || "LATEST T-SHIRT DROP"}
                </h3>
              </div>
            </div>

            {/* floating card */}
            <div className="absolute bottom-16 left-4 z-20 animate-[float_4s_ease-in-out_infinite] rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500">
                  <ShoppingBag className="text-white" />
                </div>

                <div className="text-white">
                  <p className="text-xs text-white/60">STARTING FROM</p>
                  <p className="text-xl font-black">₹399</p>
                </div>
              </div>
            </div>

            {/* floating sticker */}
            <div className="absolute right-0 top-2 flex h-28 w-28 rotate-12 items-center justify-center rounded-full bg-yellow-300 text-center text-sm font-black text-black shadow-xl">
              NEW
              <br />
              DROP
              <br />
              🔥
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          BENEFITS
      ========================== */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-200 lg:grid-cols-4">

          {[
            {
              icon: Truck,
              title: "Fast Shipping",
              text: "Quick delivery across India",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              text: "100% safe checkout",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              text: "Hassle-free support",
            },
            {
              icon: Star,
              title: "Premium Quality",
              text: "Made to last",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group flex items-center gap-4 px-6 py-7 transition-colors hover:bg-neutral-50"
              >
                <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />

                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================== */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

        <div className="mb-12 flex items-end justify-between">

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-600">
              Shop your style
            </p>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Find your <span className="text-fuchsia-600">thing.</span>
            </h2>
          </div>

          <Link
            to="/shop"
            className="hidden items-center gap-2 font-bold sm:flex"
          >
            View all
            <ChevronRight />
          </Link>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={category.link}
              className={`group relative overflow-hidden rounded-[32px] ${
                index === 1 ? "md:translate-y-8" : ""
              }`}
            >

              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute bottom-0 p-7 text-white">
                <p className="mb-2 text-sm text-white/70">
                  {category.subtitle}
                </p>

                <h3 className="text-3xl font-black">
                  {category.name}
                </h3>

                <div className="mt-4 flex items-center gap-2 font-semibold">
                  Shop now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </div>
              </div>

            </Link>
          ))}

        </div>
      </section>

      {/* =========================
          FEATURED PRODUCTS
      ========================== */}
      <section className="bg-neutral-100 py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mb-12 flex items-end justify-between">

            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Fresh from the printer
              </p>

              <h2 className="text-4xl font-black sm:text-5xl">
                Trending <span className="text-orange-500">drops.</span>
              </h2>
            </div>

            <Link
              to="/shop"
              className="hidden items-center gap-2 font-bold sm:flex"
            >
              Shop all
              <ChevronRight />
            </Link>

          </div>

          {loadingProducts ? (
            <p className="py-10 text-sm text-neutral-500">Loading products...</p>
          ) : productsError ? (
            <p className="py-10 text-sm text-red-600">{productsError}</p>
          ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">

            {products.map((product) => (
              <Link
                key={product._id || product.id}
                to={`/product/${product._id || product.id}`}
                className="group"
              >

                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white">

                  <img
                    src={product.images?.[0] || product.image || ""}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {(product.tag || product.isNewArrival || product.isFeatured) && (
                    <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1.5 text-[10px] font-black tracking-wider text-white">
                      {product.tag || (product.isNewArrival ? "NEW" : "FEATURED")}
                    </span>
                  )}

                </div>

                <AddToCartButton
                  product={product}
                  icon={<ShoppingBag className="h-4 w-4" />}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-bold text-white shadow-lg hover:bg-neutral-800"
                />

                <div className="px-1 pt-4">

                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    {product.category}
                  </p>

                  <h3 className="mt-1 line-clamp-1 font-bold">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-black">
                      ₹{product.price}
                    </span>

                    {(product.compareAtPrice > product.price || product.oldPrice > product.price) && (
                      <>
                        <span className="text-sm text-neutral-400 line-through">
                          ₹{product.compareAtPrice || product.oldPrice}
                        </span>
                        <span className="text-xs font-bold text-green-600">
                          {Math.round(
                            (((product.compareAtPrice || product.oldPrice) - product.price) /
                              (product.compareAtPrice || product.oldPrice)) *
                              100
                          )}% OFF
                        </span>
                      </>
                    )}
                  </div>

                </div>

              </Link>
            ))}

          </div>
          )}
        </div>
      </section>

      {/* =========================
          STATEMENT BANNER
      ========================== */}
      <section className="relative overflow-hidden bg-[#ff4d00] py-24">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[80px] border-yellow-300/30" />

        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border-[70px] border-pink-500/30" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">

          <p className="text-sm font-black uppercase tracking-[0.3em] text-black/60">
            Not made for everyone
          </p>

          <h2 className="mt-5 text-5xl font-black leading-none tracking-tight text-black sm:text-7xl">
            YOUR STYLE.
            <br />
            YOUR RULES.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-lg font-medium text-black/70">
            Wear something that says something.
            Discover designs created for the bold, the weird,
            the creative and the unapologetic.
          </p>

          <Link
            to="/shop"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 font-bold text-white transition hover:scale-105"
          >
            Explore Printzenz
            <ArrowRight />
          </Link>

        </div>
      </section>

      {/* =========================
          REVIEWS
      ========================== */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-600">
            The Printzenz community
          </p>

          <h2 className="mt-3 text-4xl font-black sm:text-5xl">
            Loved by people who <span className="text-fuchsia-600">get it.</span>
          </h2>

        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">

          {[
            {
              name: "Arjun",
              text: "The oversized fit is exactly what I wanted. Quality is actually amazing for the price.",
            },
            {
              name: "Riya",
              text: "The design looks even better in person. Definitely ordering another one.",
            },
            {
              name: "Kabir",
              text: "Super comfortable and the print feels premium. Printzenz is now my go-to.",
            },
          ].map((review) => (
            <div
              key={review.name}
              className="rounded-3xl border border-neutral-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="mt-5 leading-7 text-neutral-600">
                “{review.text}”
              </p>

              <div className="mt-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold text-white">
                  {review.name[0]}
                </div>

                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-xs text-neutral-400">
                    Verified customer
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>
      </section>

      {/* =========================
          INSTAGRAM / SOCIAL
      ========================== */}
      <section className="bg-black py-20 text-white">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
                Follow the vibe
              </p>

              <h2 className="mt-2 text-4xl font-black">
                @printzenz
              </h2>
            </div>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 font-bold transition hover:bg-white hover:text-black"
            >
             
              Follow us
            </a>

          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">

            {[
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
              "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500",
              "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
              "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=500",
            ].map((image, index) => (
              <div
                key={index}
                className="group aspect-square overflow-hidden rounded-2xl"
              >
                <img
                  src={image}
                  alt="Printzenz style"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-2"
                />
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* =========================
          NEWSLETTER
      ========================== */}
    

      {/* animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-18px);
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>

<Footer/>
    </main>
  );
}

export default Home;