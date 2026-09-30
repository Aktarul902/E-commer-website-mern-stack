import { Link } from "react-router";
import {

  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#0b0b0b] text-white">

      {/* Newsletter */}
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 py-14 md:flex-row md:items-center lg:px-8">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              Stay in the loop
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Get the next drop first.
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
              New designs, exclusive offers and early access.
              No spam. Just good stuff.
            </p>
          </div>

          <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">

            <input
              type="email"
              placeholder="Your email address"
              className="h-14 flex-1 rounded-full border border-white/10 bg-white/5 px-6 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
            />

            <button
              type="submit"
              className="h-14 rounded-full bg-white px-7 font-bold text-black transition hover:bg-yellow-300"
            >
              Subscribe
            </button>

          </form>

        </div>
      </section>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2">

            <Link to="/" className="inline-block">

              <h2 className="text-3xl font-black tracking-[-0.05em]">
                PRINTZENZ
              </h2>

              <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-white/40">
                WEAR YOUR VIBE
              </p>

            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
              Bold designs for people who don't want to blend in.
              Discover premium printwear made to express your personality.
            </p>

            {/* Social */}
            <div className="mt-7 flex gap-3">

             

            </div>

          </div>

          {/* Shop */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider">
              Shop
            </h3>

            <div className="space-y-3">

              <Link
                to="/shop"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                All Products
              </Link>

              <Link
                to="/category/t-shirts"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                T-Shirts
              </Link>

              <Link
                to="/category/hoodies"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Hoodies
              </Link>

              <Link
                to="/category/mugs"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Mugs
              </Link>

              <Link
                to="/category/tote-bags"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Tote Bags
              </Link>

              <Link
                to="/sale"
                className="block font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Sale
              </Link>

            </div>

          </div>

          {/* Help */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider">
              Help
            </h3>

            <div className="space-y-3">

              <Link
                to="/contact"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Contact Us
              </Link>

              <Link
                to="/faq"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                FAQ
              </Link>

              <Link
                to="/track-order"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Track Order
              </Link>

              <Link
                to="/shipping-policy"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Shipping
              </Link>

              <Link
                to="/return-policy"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Returns & Refunds
              </Link>

            </div>

          </div>

          {/* Company */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider">
              Company
            </h3>

            <div className="space-y-3">

              <Link
                to="/about"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                About Printzenz
              </Link>

              <Link
                to="/privacy-policy"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/contact"
                className="block text-sm text-white/50 transition hover:text-white"
              >
                Contact
              </Link>

            </div>

          </div>

        </div>

        {/* Contact */}
        <div className="mt-14 grid gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:grid-cols-3">

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-white" />
            support@printzenz.com
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-white" />
            +91 XXXXX XXXXX
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-white" />
            India
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/30 sm:flex-row sm:items-center">

          <p>
            © {new Date().getFullYear()} Printzenz. All rights reserved.
          </p>

          <div className="flex items-center gap-5">

            <span>Made with ❤️ in India</span>

            <Link
              to="/shop"
              className="flex items-center gap-1 transition hover:text-white"
            >
              Shop now
              <ArrowUpRight className="h-3 w-3" />
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;