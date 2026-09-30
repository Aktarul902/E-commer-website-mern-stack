import axios from "axios";
import Order from "../app/models/Order.js";

const CASHFREE_ENV =
  process.env.CASHFREE_ENV || "sandbox";

const CASHFREE_BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_API_VERSION = "2026-01-01";

const getCashfreeReturnUrl = (orderId) => {
  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/$/, "");

  if (!frontendUrl?.startsWith("https://")) {
    return null;
  }

  return `${frontendUrl}/payment/cashfree/return?orderId=${encodeURIComponent(orderId)}`;
};

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

const canAccessOrder = (req, order, trackingToken) => {
  if (req.user && order.user && String(req.user._id) === String(order.user)) {
    return true;
  }

  return Boolean(
    trackingToken &&
      order.trackingToken &&
      trackingToken === order.trackingToken
  );
};

export const createCashfreeCheckout = async (req, res) => {
  try {
    const { orderId, trackingToken } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!canAccessOrder(req, order, trackingToken)) {
      return res.status(403).json({
        success: false,
        message: "Order access could not be verified",
      });
    }

    if (order.paymentMethod !== "CASHFREE") {
      return res.status(400).json({
        success: false,
        message: "This order is not a Cashfree payment",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    const returnUrl = getCashfreeReturnUrl(order.orderId);
    const checkoutMode = returnUrl ? "redirect" : "modal";

    if (order.cashfree?.paymentSessionId) {
      return res.status(200).json({
        success: true,
        orderId: order.orderId,
        paymentSessionId: order.cashfree.paymentSessionId,
        environment: CASHFREE_ENV,
        checkoutMode,
      });
    }

    const phone = String(order.customer.phone || "")
      .replace(/\D/g, "")
      .slice(-10);

    if (phone.length !== 10 || !order.customer.email) {
      return res.status(400).json({
        success: false,
        message: "A valid email and 10-digit phone number are required for prepaid payment",
      });
    }

    const gatewayOrder = await createCashfreeOrder({
      orderId: order.orderId,
      amount: Number(order.totalAmount.toFixed(2)),
      customerId: String(order.user || order.orderId)
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 50),
      customerName: [order.customer.firstName, order.customer.lastName]
        .filter(Boolean)
        .join(" "),
      customerEmail: order.customer.email,
      customerPhone: phone,
      returnUrl,
    });

    if (!gatewayOrder.payment_session_id) {
      throw new Error("Cashfree did not return a payment session");
    }

    order.cashfree = {
      orderId: gatewayOrder.order_id,
      paymentSessionId: gatewayOrder.payment_session_id,
      paymentStatus: gatewayOrder.order_status || "ACTIVE",
    };
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      paymentSessionId: gatewayOrder.payment_session_id,
      environment: CASHFREE_ENV,
      checkoutMode,
    });
  } catch (error) {
    console.error("Create Cashfree checkout error:", error.response?.data || error);
    return res.status(502).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Unable to start Cashfree payment",
    });
  }
};

export const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!canAccessOrder(req, order, req.query.trackingToken)) {
      return res.status(403).json({
        success: false,
        message: "Order access could not be verified",
      });
    }

    const response = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${encodeURIComponent(order.orderId)}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": CASHFREE_API_VERSION,
          Accept: "application/json",
        },
      }
    );

    const gatewayOrder = response.data;
    const gatewayStatus = String(gatewayOrder.order_status || "").toUpperCase();
    const paymentStatus = gatewayStatus === "PAID"
      ? "PAID"
      : ["EXPIRED", "TERMINATED", "CANCELLED"].includes(gatewayStatus)
        ? "FAILED"
        : "PENDING";

    order.paymentStatus = paymentStatus;
    order.cashfree = {
      ...order.cashfree?.toObject?.(),
      orderId: gatewayOrder.order_id || order.cashfree?.orderId,
      paymentSessionId:
        gatewayOrder.payment_session_id || order.cashfree?.paymentSessionId,
      paymentStatus: gatewayStatus,
      lastCheckedAt: new Date(),
    };

    if (paymentStatus === "PAID") {
      order.orderStatus = "Confirmed";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      paymentStatus,
      order: {
        orderId: order.orderId,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("Verify Cashfree payment error:", error.response?.data || error);
    return res.status(502).json({
      success: false,
      message: "Unable to verify Cashfree payment",
    });
  }
};