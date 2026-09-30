import { Link } from "react-router";
import {
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const categories = [
  {
    id: 1,
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Statement prints made for everyday vibes.",
    count: "24+ Designs",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    accent: "from-orange-500/80",
  },
  {
    id: 2,
    name: "Hoodies",
    slug: "hoodies",
    description: "Cozy fits with designs that speak louder.",
    count: "16+ Designs",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    accent: "from-purple-500/80",
  },
  {
    id: 3,
    name: "Mugs",
    slug: "mugs",
    description: "Start your day with a little personality.",
    count: "12+ Designs",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=1200&q=85",
    accent: "from-blue-500/80",
  },
  {
    id: 4,
    name: "Tote Bags",
    slug: "tote-bags",
    description: "Carry your vibe wherever you go.",
    count: "10+ Designs",
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=85",
    accent: "from-emerald-500/80",
  },
];

function Categories() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-950">

      {/* =========================================
          HERO
      ========================================== */}

      <Navbar/>

      {/* =========================================
          CATEGORY SECTION
      ========================================== */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">

        {/* Heading */}
        <div
          className="
            mb-10
            flex
            flex-col
            gap-4
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
                tracking-[0.2em]
                text-orange-500
              "
            >
              Shop by category
            </p>

            <h2
              className="
                mt-2
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              "
            >
              What's your vibe?
            </h2>
          </div>

          <Link
            to="/shop"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-neutral-600
              transition
              hover:text-black
            "
          >
            View all products

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

        </div>

        {/* Category grid */}
        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="
                group
                relative
                overflow-hidden
                rounded-[1.75rem]
                bg-neutral-200
              "
            >

              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden">

                <img
                  src={category.image}
                  alt={category.name}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-110
                  "
                />

              </div>

              {/* Gradient */}
              <div
                className={`
                  absolute
                  inset-0
                  bg-gradient-to-t
                  ${category.accent}
                  via-black/10
                  to-transparent
                  opacity-70
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                `}
              />

              {/* Content */}
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  p-5
                  text-white
                "
              >

                <div
                  className="
                    mb-3
                    inline-flex
                    rounded-full
                    bg-white/15
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    backdrop-blur-md
                  "
                >
                  {category.count}
                </div>

                <h3
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  {category.name}
                </h3>

                <p
                  className="
                    mt-1
                    max-w-[220px]
                    text-xs
                    leading-5
                    text-white/75
                  "
                >
                  {category.description}
                </p>

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                  "
                >
                  Explore

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-black
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

              </div>

            </Link>
          ))}

        </div>
      </section>

      {/* =========================================
          FEATURE STRIP
      ========================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">

        <div
          className="
            grid
            overflow-hidden
            rounded-[2rem]
            border
            border-neutral-200
            bg-white
            sm:grid-cols-3
          "
        >

          <Feature
            number="01"
            title="Premium Print"
            text="Sharp, vibrant designs made to last."
          />

          <Feature
            number="02"
            title="Made For Your Vibe"
            text="Unique designs for every personality."
          />

          <Feature
            number="03"
            title="COD Available"
            text="Easy ordering across India."
          />

        </div>

      </section>

      {/* =========================================
          CTA
      ========================================== */}

      <section className="px-5 pb-20 sm:px-8">

        <div
          className="
            relative
            mx-auto
            max-w-7xl
            overflow-hidden
            rounded-[2rem]
            bg-black
            px-7
            py-16
            text-white
            sm:px-12
            lg:px-16
          "
        >

          {/* Glow */}
          <div
            className="
              absolute
              -right-20
              -top-20
              h-72
              w-72
              rounded-full
              bg-orange-500/30
              blur-3xl
            "
          />

          <div className="relative max-w-2xl">

            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-orange-400
              "
            >
              Can't decide?
            </p>

            <h2
              className="
                mt-3
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
              "
            >
              Explore the
              <span className="text-orange-400">
                {" "}full collection.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                text-sm
                leading-7
                text-white/50
              "
            >
              Find your next favourite tee, hoodie, mug
              or tote and make it part of your everyday vibe.
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
                transition-all
                duration-300
                hover:bg-orange-400
              "
            >
              <ShoppingBag className="h-4 w-4" />

              Shop Everything

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

          </div>

        </div>

      </section>
<Footer/>
    </main>
  );
}


/* =========================================
   FEATURE COMPONENT
========================================= */

function Feature({ number, title, text }) {
  return (
    <div
      className="
        group
        border-b
        border-neutral-200
        p-7
        last:border-b-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >

      <span
        className="
          text-xs
          font-black
          tracking-widest
          text-orange-500
        "
      >
        {number}
      </span>

      <h3
        className="
          mt-5
          text-lg
          font-black
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-neutral-500
        "
      >
        {text}
      </p>

    </div>
  );
}

export default Categories;