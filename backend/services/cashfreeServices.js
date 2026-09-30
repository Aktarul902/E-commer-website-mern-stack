import axios from "axios";

const CASHFREE_ENV =
  process.env.CASHFREE_ENV || "sandbox";

const CASHFREE_BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_API_VERSION = "2026-01-01";

export const createCashfreeOrder = async ({
  orderId,
  amount,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  returnUrl,
  notifyUrl,
}) => {
  const response = await axios.post(
    `${CASHFREE_BASE_URL}/orders`,
    {
      order_id: orderId,

      order_amount: Number(amount),

      order_currency: "INR",

      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },

      order_meta: {
          ...(returnUrl ? { return_url: returnUrl } : {}),
          ...(notifyUrl ? { notify_url: notifyUrl } : {}),
      },
    },
    {
      headers: {
        "x-client-id":
          process.env.CASHFREE_CLIENT_ID,

        "x-client-secret":
          process.env.CASHFREE_CLIENT_SECRET,

        "x-api-version":
          CASHFREE_API_VERSION,

        Accept: "application/json",

        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};