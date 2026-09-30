const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Cart request failed."
    );
  }

  return data;
};

/* =========================
   GET CART
========================= */

export const getServerCart = async () => {
  return request("/cart");
};

/* =========================
   ADD TO CART
========================= */

export const addServerCartItem = async ({
  productId,
  quantity = 1,
  variant = {},
}) => {
  return request("/cart/add", {
    method: "POST",

    body: JSON.stringify({
      productId,
      quantity,
      variant,
    }),
  });
};

/* =========================
   UPDATE CART ITEM
========================= */

export const updateServerCartItem = async ({
  productId,
  quantity,
  variant = {},
}) => {
  return request(`/cart/${productId}`, {
    method: "PUT",

    body: JSON.stringify({
      quantity,
      variant,
    }),
  });
};

/* =========================
   REMOVE CART ITEM
========================= */

export const removeServerCartItem = async ({
  productId,
  variant = {},
}) => {
  const params = new URLSearchParams();

  if (variant.size) {
    params.set("size", variant.size);
  }

  if (variant.color) {
    params.set("color", variant.color);
  }

  if (variant.sku) {
    params.set("sku", variant.sku);
  }

  const query = params.toString();

  return request(
    `/cart/${productId}${query ? `?${query}` : ""}`,
    {
      method: "DELETE",
    }
  );
};

/* =========================
   CLEAR CART
========================= */

export const clearServerCart = async () => {
  return request("/cart", {
    method: "DELETE",
  });
};