import axios from "axios";

import {
  QIKINK_BASE_URL,
  QIKINK_CLIENT_ID,
  QIKINK_CLIENT_SECRET,
} from "../app/config/qikink.js";

let cachedAccessToken = null;
let tokenExpiresAt = null;

const getQikinkToken = async (forceRefresh = false) => {
  if (
    !forceRefresh &&
    cachedAccessToken &&
    tokenExpiresAt &&
    Date.now() < tokenExpiresAt
  ) {
    return cachedAccessToken;
  }

  if (!QIKINK_CLIENT_ID || !QIKINK_CLIENT_SECRET) {
    throw new Error("Qikink API credentials are not configured");
  }

  try {
    const params = new URLSearchParams();
    params.append("ClientId", QIKINK_CLIENT_ID);
    params.append("client_secret", QIKINK_CLIENT_SECRET);

    const response = await axios.post(
      `${QIKINK_BASE_URL}/api/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 30000,
      }
    );

    const accessToken = response.data?.Accesstoken;

    if (!accessToken) {
      throw new Error(
        `Qikink token was not returned: ${JSON.stringify(response.data)}`
      );
    }

    cachedAccessToken = accessToken;

    const expiresIn =
      Number(response.data?.expires_in) > 0
        ? Number(response.data.expires_in)
        : 3600;

    tokenExpiresAt = Date.now() + (expiresIn - 60) * 1000;

    return cachedAccessToken;
  } catch (error) {
    console.error(
      "Qikink authentication error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to authenticate with Qikink"
    );
  }
};

const clearQikinkToken = () => {
  cachedAccessToken = null;
  tokenExpiresAt = null;
};

const qikinkRequest = async ({
  method,
  url,
  params,
  data,
  retry = true,
}) => {
  let token = await getQikinkToken();

  try {
    const response = await axios({
      method,
      url: `${QIKINK_BASE_URL}${url}`,
      params,
      data,
      headers: {
        ClientId: QIKINK_CLIENT_ID,
        Accesstoken: token,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && retry) {
      clearQikinkToken();
      token = await getQikinkToken(true);

      const retryResponse = await axios({
        method,
        url: `${QIKINK_BASE_URL}${url}`,
        params,
        data,
        headers: {
          ClientId: QIKINK_CLIENT_ID,
          Accesstoken: token,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      return retryResponse.data;
    }

    console.error(
      "Qikink API error:",
      error.response?.data || error.message
    );

    const qikinkError =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Qikink API request failed";

    const apiError = new Error(qikinkError);
    apiError.status = error.response?.status || 500;
    apiError.responseData = error.response?.data;

    throw apiError;
  }
};

const generateQikinkOrderNumber = (orderId) => {
  const clean = String(orderId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  return `PZ${clean.slice(-13)}`;
};

const createQikinkOrder = async ({ order }) => {
  if (!order) {
    throw new Error("Order is required");
  }

  if (!order.items || order.items.length === 0) {
    throw new Error("Order has no items");
  }

  if (!order.shippingAddress) {
    throw new Error("Shipping address is required");
  }

  const shippingAddress = order.shippingAddress;
  const qikinkOrderNumber = generateQikinkOrderNumber(order.orderId);
  const gateway = order.paymentMethod === "COD" ? "COD" : "Prepaid";
  const totalOrderValue = Number(order.totalAmount || 0);

  if (totalOrderValue <= 0) {
    throw new Error("Invalid order total");
  }

  const lineItems = order.items.map((item) => {
    if (!item.variant?.qikinkSku) {
      throw new Error(
        `Qikink SKU missing for product: ${item.name}`
      );
    }

    return {
      sku: String(item.variant.qikinkSku),
      quantity: String(item.quantity || 1),
      price: String(item.price || item.total || 0),
      product_name: item.name,
      product_id: item.product?._id || item.product || null,
      product_url: item.image || "",
      variant: item.variant?.name || "Default",
    };
  });

  const payload = {
    order_id: qikinkOrderNumber,
    order_reference_no: qikinkOrderNumber,
    customer_name: [
      order.customer?.firstName || "",
      order.customer?.lastName || "",
    ]
      .filter(Boolean)
      .join(" ") || "Customer",
    customer_email: order.customer?.email || "",
    customer_phone: order.customer?.phone || "",
    shipping_address: {
      name: [
        order.customer?.firstName || "",
        order.customer?.lastName || "",
      ]
        .filter(Boolean)
        .join(" ") || "Customer",
      address: shippingAddress.line1 || "",
      address2: shippingAddress.line2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      pincode: shippingAddress.pincode || "",
      country: shippingAddress.country || "India",
      phone: order.customer?.phone || shippingAddress.phone || "",
    },
    billing_address: {
      name: [
        order.customer?.firstName || "",
        order.customer?.lastName || "",
      ]
        .filter(Boolean)
        .join(" ") || "Customer",
      address: shippingAddress.line1 || "",
      address2: shippingAddress.line2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      pincode: shippingAddress.pincode || "",
      country: shippingAddress.country || "India",
      phone: order.customer?.phone || shippingAddress.phone || "",
    },
    order_items: lineItems,
    subtotal: Number(order.subtotal || 0),
    shipping_charge: Number(order.shippingCharge || 0),
    discount: Number(order.discount || 0),
    total_amount: totalOrderValue,
    payment_method: gateway,
    order_type: order.orderType || "standard",
    notes: order.notes || "",
    search_from_my_products: 1,
  };

  const response = await qikinkRequest({
    method: "post",
    url: "/api/order",
    data: payload,
  });

  const createdOrderId =
    response?.order_id ||
    response?.orderId ||
    response?.data?.order_id ||
    response?.data?.orderId ||
    null;

  const createdOrderNumber =
    response?.order_number ||
    response?.orderNumber ||
    response?.data?.order_number ||
    response?.data?.orderNumber ||
    null;

  const createdStatus =
    response?.status ||
    response?.order_status ||
    response?.data?.status ||
    response?.data?.order_status ||
    "Created";

  return {
    qikinkOrderId: createdOrderId,
    qikinkOrderNumber: createdOrderNumber,
    status: createdStatus,
    response,
  };
};

const getQikinkOrder = async ({ orderId }) => {
  if (!orderId) {
    throw new Error("Qikink order ID is required");
  }

  const response = await qikinkRequest({
    method: "get",
    url: "/api/order",
    params: {
      order_id: orderId,
    },
  });

  return response?.data || response;
};

const getQikinkOrderList = async ({
  orderReferenceNo,
  status,
  pageNo = 1,
}) => {
  const params = {
    page_no: Number(pageNo) || 1,
  };

  if (orderReferenceNo) {
    params.order_reference_no = orderReferenceNo;
  }

  if (status) {
    params.status = status;
  }

  const response = await qikinkRequest({
    method: "get",
    url: "/api/orders",
    params,
  });

  return response?.data || response;
};

export {
  getQikinkToken,
  clearQikinkToken,
  qikinkRequest,
  createQikinkOrder,
  getQikinkOrder,
  getQikinkOrderList,
};

export default {
  getQikinkToken,
  clearQikinkToken,
  qikinkRequest,
  createQikinkOrder,
  getQikinkOrder,
  getQikinkOrderList,
};