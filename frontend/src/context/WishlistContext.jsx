import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router";
import { Heart, X } from "lucide-react";
import toast from "react-hot-toast";
import useAuthuser from "../hooks/authuser";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../lib/wishlistApi";

const WishlistContext = createContext(null);

const getProductId = (entry) => {
  const product = entry?.product;
  const id =
    product?._id ||
    (typeof product === "string" ? product : null) ||
    entry?.productId ||
    entry?._id;

  return id ? String(id) : "";
};

export function WishlistProvider({ children }) {
  const { authuser, isLoading: authLoading } = useAuthuser();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [pendingIds, setPendingIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!authuser?._id) {
      setWishlistIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getWishlist();
      const entries = Array.isArray(response?.wishlist)
        ? response.wishlist
        : [];
      setWishlistIds(entries.map(getProductId).filter(Boolean));
    } catch (error) {
      console.error("Unable to load wishlist:", error);
      setWishlistIds([]);
    } finally {
      setLoading(false);
    }
  }, [authuser?._id]);

  useEffect(() => {
    if (!authLoading) {
      refreshWishlist();
    }
  }, [authLoading, refreshWishlist]);

  const isWishlisted = (productId) =>
    Boolean(productId) && wishlistIds.includes(String(productId));

  const isPending = (productId) =>
    Boolean(productId) && pendingIds.includes(String(productId));

  const toggleWishlist = async (product) => {
    if (authLoading) return;

    if (!authuser?._id) {
      setShowGuestPrompt(true);
      return;
    }

    const productId = String(product?._id || product?.id || "");
    if (!productId || isPending(productId)) return;

    const wasWishlisted = isWishlisted(productId);
    setPendingIds((current) => [...current, productId]);

    try {
      if (wasWishlisted) {
        await removeFromWishlist(productId);
        setWishlistIds((current) =>
          current.filter((id) => id !== productId)
        );
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId);
        setWishlistIds((current) =>
          current.includes(productId) ? current : [...current, productId]
        );
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error?.message || "Unable to update wishlist");
    } finally {
      setPendingIds((current) =>
        current.filter((id) => id !== productId)
      );
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        loading,
        isWishlisted,
        isPending,
        toggleWishlist,
        refreshWishlist,
        openGuestPrompt: () => setShowGuestPrompt(true),
      }}
    >
      {children}

      {showGuestPrompt && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowGuestPrompt(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-signup-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowGuestPrompt(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-600">
              <Heart className="fill-pink-100" size={24} />
            </div>
            <h2 id="wishlist-signup-title" className="mt-5 text-xl font-black text-neutral-950">
              Create an account to save favorites
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Sign up to keep your wishlist synced and available whenever you return.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/api/login"
                onClick={() => setShowGuestPrompt(false)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                Log in
              </Link>
              <Link
                to="/api/signup"
                onClick={() => setShowGuestPrompt(false)}
                className="rounded-xl bg-neutral-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
              >
                Create account
              </Link>
            </div>
          </section>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
}
