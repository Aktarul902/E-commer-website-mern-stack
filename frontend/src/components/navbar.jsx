import { useState } from "react";
import { Link, NavLink } from "react-router";
import Logo from "../assets/logo.png";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const categories = [
  { name: "T-Shirts", path: "/category/t-shirts" },
  { name: "Hoodies", path: "/category/hoodies" },
  { name: "Mugs", path: "/category/mugs" },
  { name: "Tote Bags", path: "/category/tote-bags" },
];

import useAuthuser from "../hooks/authuser";
import { useWishlist } from "../context/WishlistContext";

function Navbar() {
  const { authuser } = useAuthuser();
  const { wishlistCount } = useWishlist();
  const isAdmin = authuser?.role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <>
      {/* Announcement bar */}
      {/* <div className="bg-black px-4 py-2 text-center text-[11px] font-bold tracking-[0.2em] text-white">
        FREE SHIPPING ON ORDERS ABOVE ₹999 ✦ COD AVAILABLE
      </div> */}

      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-white transition-transform duration-300 group-hover:rotate-6">
              <img src={Logo} alt="" />
            </div>

            <div>
              <span className="text-2xl font-black tracking-[-0.06em]">
                PRINTZENZ
              </span>

              <span className="block text-[8px] font-bold tracking-[0.3em] text-neutral-400">
                WEAR YOUR VIBE
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
      <nav className="hidden items-center gap-9 lg:flex">

  <NavLink
    to="/"
    className={({ isActive }) =>
      `nav-link ${
        isActive ? "nav-link-active" : ""
      } text-sm font-semibold ${
        isActive
          ? "text-black"
          : "text-neutral-500"
      }`
    }
  >
    Home
  </NavLink>

  <NavLink
    to="/shop"
    className={({ isActive }) =>
      `nav-link ${
        isActive ? "nav-link-active" : ""
      } text-sm font-semibold ${
        isActive
          ? "text-black"
          : "text-neutral-500"
      }`
    }
  >
    Shop
  </NavLink>
  <NavLink
    to="/track-order"
    className={({ isActive }) =>
      `nav-link ${
        isActive ? "nav-link-active" : ""
      } text-sm font-semibold ${
        isActive
          ? "text-black"
          : "text-neutral-500"
      }`
    }
  >
    Track Order
  </NavLink>

  {/* Categories */}
  <div
    className="relative"
    onMouseEnter={() => setCategoryOpen(true)}
    onMouseLeave={() => setCategoryOpen(false)}
  >
    <button
      className={`nav-link flex items-center gap-1 text-sm font-semibold text-neutral-500`}
    >
      Categories

      <ChevronDown
        className={`h-4 w-4 transition-transform duration-300 ${
          categoryOpen ? "rotate-180" : ""
        }`}
      />
    </button>

 {/* Dropdown */}
<div
  className={`absolute left-1/2 top-full w-52 -translate-x-1/2 pt-4 transition-all duration-200 ${
    categoryOpen
      ? "pointer-events-auto translate-y-0 opacity-100"
      : "pointer-events-none -translate-y-2 opacity-0"
  }`}
>
  <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white p-2 shadow-2xl">

    {categories.map((category) => (
      <Link
        key={category.path}
        to={category.path}
        className="block rounded-xl px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
      >
        {category.name}
      </Link>
    ))}

  </div>
</div>
  </div>

  <NavLink
    to="/new-arrivals"
    className={({ isActive }) =>
      `nav-link ${
        isActive ? "nav-link-active" : ""
      } text-sm font-semibold ${
        isActive
          ? "text-black"
          : "text-neutral-500"
      }`
    }
  >
    New Arrivals
  </NavLink>

  <NavLink
    to="/sale"
    className="nav-link nav-sale text-sm font-bold text-orange-500"
  >
    Sale
  </NavLink>
  {isAdmin && (
    <NavLink
      to="/admin"
      className="nav-link nav-admin text-sm font-bold text-red-500"
    >
      Admin
  </NavLink>
  )}
</nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            <Link
              to="/search"
              className="hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 sm:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              to={authuser ? `/myaccount/${authuser._id}` : "/api/login"}
              className="hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 sm:flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <Link
              to="/wishlist"
              className="relative hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 sm:flex"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />

              {/* Cart count */}
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

          </div>
        </div>

        {/* Mobile navigation */}
      {/* Mobile navigation */}
<div
  className={`
    lg:hidden
    overflow-hidden
    border-t
    border-neutral-100
    bg-white

    text-black

    transition-all
    duration-300
    ease-in-out

    ${
      mobileOpen
        ? "max-h-[calc(100dvh-108px)] opacity-100"
        : "max-h-0 opacity-0"
    }
  `}
>
  <div
    className={`
      max-h-[calc(100dvh-108px)]
      overflow-y-auto
      overscroll-contain
      px-5
      py-5

      scrollbar-thin
      scrollbar-thumb-neutral-300
      dark:scrollbar-thumb-neutral-700
    `}
  >

    {/* Search */}
    <div
      className="
        mb-5
        flex
        items-center
        gap-3
        rounded-2xl
        bg-neutral-100
        px-4
        py-3

        dark:bg-neutral-800
      "
    >
      <Search className="h-5 w-5 text-neutral-500" />

      <input
        type="text"
        placeholder="Search products..."
        className="
          w-full
          bg-transparent
          text-sm
          outline-none

          placeholder:text-neutral-400
          
        "
      />
    </div>

    {/* Navigation */}
    <div className="space-y-1">

      {/* Home */}
      <Link
        to="/"
        onClick={() => setMobileOpen(false)}
        className="
          block
          rounded-xl
          px-4
          py-4
          text-base
          font-semibold

          transition
          hover:bg-neutral-100

          
          dark:hover:bg-neutral-800
        "
      >
        Home
      </Link>

      {/* Shop */}
      <Link
        to="/shop"
        onClick={() => setMobileOpen(false)}
        className="
          block
          rounded-xl
          px-4
          py-4
          text-base
          font-semibold

          transition
          hover:bg-neutral-100

          
          dark:hover:bg-neutral-800
        "
      >
        Shop
      </Link>
      <Link
        to="/track-order"
        onClick={() => setMobileOpen(false)}
        className="
          block
          rounded-xl
          px-4
          py-4
          text-base
          font-semibold

          transition
          hover:bg-neutral-100

          
          dark:hover:bg-neutral-800
        "
      >
        Track Order
      </Link>

      {/* Categories */}
      <div
        className="
          my-3
          border-y
          border-neutral-100
          py-3

          dark:border-white/10
        "
      >

        <p
          className="
            px-4
            py-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-neutral-400
          "
        >
          Categories
        </p>

        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            onClick={() => setMobileOpen(false)}
            className="
              block
              rounded-xl
              px-4
              py-3
              text-sm
              font-medium

              transition
              hover:bg-neutral-100

             
            "
          >
            {category.name}
          </Link>
        ))}

      </div>

      {/* New Arrivals */}
      <Link
        to="/new-arrivals"
        onClick={() => setMobileOpen(false)}
        className="
          block
          rounded-xl
          px-4
          py-4
          text-base
          font-semibold

          transition
          hover:bg-neutral-100

          
       
        "
      >
        New Arrivals
      </Link>

      {/* Sale */}
      <Link
        to="/sale"
        onClick={() => setMobileOpen(false)}
        className="
          block
          rounded-xl
          px-4
          py-4
          text-base
          font-bold
          text-orange-500

          transition
          hover:bg-orange-50

          
        "
      >
        Sale
      </Link>

      {isAdmin && (
        <Link
          to="/admin"
          onClick={() => setMobileOpen(false)}
          className="block rounded-xl px-4 py-4 text-base font-bold text-red-600 transition hover:bg-red-50"
        >
          Admin
        </Link>
      )}

      {/* Account */}
      <Link
        to={`/myaccount/${authuser?._id}`}
        onClick={() => setMobileOpen(false)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-4
          text-base
          font-semibold

          transition
          hover:bg-neutral-100

          
          
        "
      >
        <User className="h-5 w-5" />

        My Account
      </Link>

      {/* Wishlist */}
      <Link
        to="/wishlist"
        onClick={() => setMobileOpen(false)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-4
          text-base
          font-semibold

          transition
          hover:bg-neutral-100

          
        
        "
      >
        <Heart className="h-5 w-5" />

        Wishlist
      </Link>

      {/* Extra bottom spacing */}
      <div className="h-8" />

    </div>
  </div>
</div>

      </header>
    </>
  );
}

export default Navbar;