import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
} from "../lib/cartapi";

import { getCurrentUser } from "../lib/api";

const CartContext = createContext(null);

const GUEST_CART_KEY = "printzenz_guest_cart";

/* =========================
   HELPERS
========================= */

const getGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (cart) => {
  localStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify(cart)
  );
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

const getVariantKey = (variant = {}) => {
  return [
    variant.size || "",
    variant.color || "",
    variant.sku || "",
    variant.qikinkSku || "",
  ].join("|");
};

const getCartItemKey = (item) => {
  return `${item.product?._id || item.productId || item.product}|${getVariantKey(
    item.variant
  )}`;
};

/* =========================
   PROVIDER
========================= */

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================
     LOAD CART
  ========================= */

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const userResponse = await getCurrentUser();

      const loggedInUser =
        userResponse?.user || userResponse;

      if (loggedInUser) {
        setIsAuthenticated(true);

        const cartResponse =
          await getServerCart();

        const serverItems =
          cartResponse?.cart?.items ||
          cartResponse?.items ||
          [];

        setItems(serverItems);

        /*
         * If guest cart exists, move it
         * into MongoDB.
         */
        const guestItems = getGuestCart();

        if (guestItems.length > 0) {
          for (const item of guestItems) {
            try {
              await addServerCartItem({
                productId:
                  item.product?._id ||
                  item.productId,

                quantity:
                  item.quantity || 1,

                variant:
                  item.variant || {},
              });
            } catch (migrationError) {
              console.error(
                "Guest cart migration error:",
                migrationError
              );
            }
          }

          clearGuestCart();

          const updatedCart =
            await getServerCart();

          setItems(
            updatedCart?.cart?.items ||
              updatedCart?.items ||
              []
          );
        }

        return;
      }

      setIsAuthenticated(false);

      setItems(getGuestCart());
    } catch (err) {
      /*
       * If authentication check fails,
       * treat the user as guest.
       */
      setIsAuthenticated(false);

      const guestItems = getGuestCart();

      setItems(guestItems);

      setError(err.message || "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* =========================
     ADD ITEM
  ========================= */

  const addToCart = async ({
    product,
    quantity = 1,
    variant = {},
  }) => {
    if (!product) {
      throw new Error("Product is required.");
    }

    if (!quantity || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const productId =
      product._id || product.id;

    if (!productId) {
      throw new Error("Product ID is missing.");
    }

    setError("");

    /*
     * LOGGED-IN USER
     */
    if (isAuthenticated) {
      const response =
        await addServerCartItem({
          productId,
          quantity,
          variant,
        });

      const serverItems =
        response?.cart?.items ||
        response?.items ||
        [];

      setItems(serverItems);

      return response;
    }

    /*
     * GUEST USER
     */
    const guestCart = getGuestCart();

    const newItem = {
      product,
      productId,
      quantity,
      variant,
    };

    const itemKey =
      getCartItemKey(newItem);

    const existingIndex =
      guestCart.findIndex(
        (item) =>
          getCartItemKey(item) === itemKey
      );

    let updatedCart;

    if (existingIndex >= 0) {
      updatedCart = [...guestCart];

      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],

        quantity:
          Number(
            updatedCart[existingIndex]
              .quantity
          ) + Number(quantity),
      };
    } else {
      updatedCart = [
        ...guestCart,
        newItem,
      ];
    }

    saveGuestCart(updatedCart);

    setItems(updatedCart);

    return {
      success: true,
      cart: {
        items: updatedCart,
      },
    };
  };

  /* =========================
     UPDATE ITEM
  ========================= */

  const updateCartItem = async ({
    item,
    quantity,
  }) => {
    if (!item) {
      throw new Error("Cart item is required.");
    }

    if (quantity < 1) {
      return removeFromCart(item);
    }

    const productId =
      item.product?._id ||
      item.productId ||
      item.product;

    if (isAuthenticated) {
      const response =
        await updateServerCartItem({
          productId,
          quantity,
          variant:
            item.variant || {},
        });

      setItems(
        response?.cart?.items ||
          response?.items ||
          []
      );

      return response;
    }

    const guestCart = getGuestCart();

    const itemKey =
      getCartItemKey(item);

    const updatedCart =
      guestCart.map((cartItem) => {
        if (
          getCartItemKey(cartItem) ===
          itemKey
        ) {
          return {
            ...cartItem,
            quantity,
          };
        }

        return cartItem;
      });

    saveGuestCart(updatedCart);

    setItems(updatedCart);

    return {
      success: true,
      cart: {
        items: updatedCart,
      },
    };
  };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeFromCart = async (item) => {
    const productId =
      item.product?._id ||
      item.productId ||
      item.product;

    if (isAuthenticated) {
      const response =
        await removeServerCartItem({
          productId,
          variant:
            item.variant || {},
        });

      setItems(
        response?.cart?.items ||
          response?.items ||
          []
      );

      return response;
    }

    const guestCart = getGuestCart();

    const itemKey =
      getCartItemKey(item);

    const updatedCart =
      guestCart.filter(
        (cartItem) =>
          getCartItemKey(cartItem) !==
          itemKey
      );

    saveGuestCart(updatedCart);

    setItems(updatedCart);

    return {
      success: true,
      cart: {
        items: updatedCart,
      },
    };
  };

  /* =========================
     CLEAR CART
  ========================= */

  const clearCart = async () => {
    if (isAuthenticated) {
      await clearServerCart();
    }

    clearGuestCart();

    setItems([]);
  };

  /* =========================
     REFRESH
  ========================= */

  const refreshCart = async () => {
    await loadCart();
  };

  /* =========================
     TOTAL ITEMS
  ========================= */

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [items]);

  /* =========================
     SUBTOTAL
  ========================= */

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price =
        Number(
          item.product?.price ??
            item.price ??
            item.variant?.price ??
            0
        );

      return (
        total +
        price * Number(item.quantity || 0)
      );
    }, 0);
  }, [items]);

  const value = {
    items,
    loading,
    error,

    isAuthenticated,

    totalItems,
    subtotal,

    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/* =========================
   HOOK
========================= */

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};

export default CartContext;