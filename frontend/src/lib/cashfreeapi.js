const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";

// ============================================================
// CREATE CASHFREE ORDER
// ============================================================

export const createCashfreeOrder = async ({
  orderId,
  trackingToken = null,
}) => {
  const response = await fetch(
    `${API_URL}/payments/cashfree/create-order`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        orderId,
        trackingToken,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create Cashfree payment"
    );
  }

  return data;
};

const trackingTokenKey = (orderId) =>
  `cashfree-tracking-${orderId}`;

export const saveCashfreeTrackingToken = (orderId, trackingToken) => {
  if (orderId && trackingToken) {
    sessionStorage.setItem(trackingTokenKey(orderId), trackingToken);
  }
};

export const getCashfreeTrackingToken = (orderId) =>
  sessionStorage.getItem(trackingTokenKey(orderId));

export const clearCashfreeTrackingToken = (orderId) =>
  sessionStorage.removeItem(trackingTokenKey(orderId));

// ============================================================
// VERIFY CASHFREE PAYMENT
// ============================================================

export const verifyCashfreePayment = async (orderId, trackingToken) => {
  const query = trackingToken
    ? `?trackingToken=${encodeURIComponent(trackingToken)}`
    : "";
  const response = await fetch(
    `${API_URL}/payments/cashfree/verify/${encodeURIComponent(
      orderId
    )}${query}`,
    {
      method: "GET",

      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to verify payment"
    );
  }

  return data;
};