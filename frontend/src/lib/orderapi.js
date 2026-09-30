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
      data.message || "Order request failed."
    );
  }

  return data;
};

/* =========================
   CREATE ORDER
========================= */

export const createOrder = async (orderData) => {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

/* =========================
   MY ORDERS
========================= */
export const getRecentOrders = async () => {
 
  return request("/orders/recent");


};
export const getMyOrders = async () => {
  return request("/orders/my-orders");
};

/* =========================
   MY SINGLE ORDER
========================= */

export const getMyOrder = async (orderId) => {
  return request(
    `/orders/my-orders/${encodeURIComponent(orderId)}`
  );
};

/* =========================
   TRACK GUEST ORDER
========================= */

export const trackOrder = async (payload = {}) => {
  const body =
    typeof payload === "string"
      ? { orderId: payload }
      : payload;

  return request("/orders/track", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/* =========================
   CANCEL ORDER
========================= */

export const cancelOrder = async (orderId) => {
  return request(
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: "PUT",
    }
  );
};

export const requestOrderReturn = async (orderId, reason = "") => {
  return request(
    `/orders/${encodeURIComponent(orderId)}/return`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
};