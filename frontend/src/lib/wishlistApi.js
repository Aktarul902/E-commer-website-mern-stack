const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";

/**
 * Get logged-in user's wishlist
 */
export const getWishlist = async () => {
  const response = await fetch(
    `${API_URL}/wishlist`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch wishlist"
    );
  }

  return data;
};


/**
 * Add product to wishlist
 *
 * Backend:
 * POST /api/wishlist/:productId
 */
export const addToWishlist = async (
  productId
) => {
  const response = await fetch(
    `${API_URL}/wishlist/${productId}`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to add product to wishlist"
    );
  }

  return data;
};


/**
 * Remove product from wishlist
 *
 * Backend:
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (
  productId
) => {
  const response = await fetch(
    `${API_URL}/wishlist/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to remove product from wishlist"
    );
  }

  return data;
};


/**
 * Check whether a product is in wishlist
 *
 * Backend:
 * GET /api/wishlist/check/:productId
 */
export const checkWishlist = async (
  productId
) => {
  const response = await fetch(
    `${API_URL}/wishlist/check/${productId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to check wishlist"
    );
  }

  return data;
};


/**
 * Clear entire wishlist
 *
 * Backend:
 * DELETE /api/wishlist
 */
export const clearWishlist = async () => {
  const response = await fetch(
    `${API_URL}/wishlist`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to clear wishlist"
    );
  }

  return data;
};