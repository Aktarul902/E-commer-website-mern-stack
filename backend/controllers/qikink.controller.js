import Order from "../app/models/Order.js";

import {
  getQikinkToken,
  createQikinkOrder,
  getQikinkOrder,
  getQikinkOrderList,
} from "../services/qikinkService.js";

import { mapQikinkStatus } from "../app/utils/qikinkStatus.js";
import {
  sendOrderDeliveredEmail,
  sendTrackingUpdateEmail,
} from "../services/emailServices.js";

/**
 * Test Qikink authentication
 *
 * GET /api/qikink/test
 */
const testQikinkConnection = async (req, res) => {
  try {
    const token = await getQikinkToken();

    return res.status(200).json({
      success: true,
      message: "Qikink authentication successful",
      tokenReceived: Boolean(token),
    });
  } catch (error) {
    console.error(
      "Qikink connection test failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create Printzenz order in Qikink
 *
 * POST /api/qikink/orders/:orderId/create
 */
const sendOrderToQikink = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Printzenz order not found",
      });
    }

    /*
     * Prevent duplicate Qikink orders.
     */
    if (order.qikink?.orderId) {
      return res.status(400).json({
        success: false,
        message: "Order has already been sent to Qikink",
        qikinkOrderId: order.qikink.orderId,
      });
    }

    /*
     * Every item needs a Qikink SKU.
     */
    for (const item of order.items) {
      if (!item.variant?.qikinkSku) {
        return res.status(400).json({
          success: false,
          message: `Qikink SKU missing for product: ${item.name}`,
        });
      }
    }

    /*
     * Payment check.
     *
     * COD can go directly.
     *
     * Razorpay must be paid before fulfillment.
     */
    if (
      order.paymentMethod === "RAZORPAY" &&
      order.paymentStatus !== "PAID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment must be confirmed before sending the order to Qikink",
      });
    }

    const result = await createQikinkOrder({
      order,
    });

    const qikinkOrderId =
      result.qikinkOrderId
        ? String(result.qikinkOrderId)
        : null;

    if (!qikinkOrderId) {
      return res.status(502).json({
        success: false,
        message:
          "Qikink did not return an order ID",
        qikinkResponse: result.response,
      });
    }

    order.qikink = {
      orderId: qikinkOrderId,

      orderNumber:
        result.qikinkOrderNumber || null,

      status:
        result.status || "Created",

      trackingNumber: null,

      trackingUrl: null,

      lastSyncedAt: new Date(),

      syncError: null,

      createdAt: new Date(),
    };

    order.orderStatus = "Processing";

    await order.save();

    return res.status(200).json({
      success: true,

      message: "Order successfully sent to Qikink",

      orderId: order.orderId,

      qikinkOrderId,

      qikinkOrderNumber:
        result.qikinkOrderNumber,

      qikinkStatus:
        result.status,

      qikinkResponse:
        result.response,
    });
  } catch (error) {
    console.error(
      "Send order to Qikink error:",
      error.responseData || error.message
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to create Qikink order",
      qikinkResponse:
        error.responseData || null,
    });
  }
};

/**
 * Sync one Printzenz order with Qikink
 *
 * GET /api/qikink/orders/:orderId/sync
 */
const syncQikinkOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Printzenz order not found",
      });
    }

    if (!order.qikink?.orderId) {
      return res.status(400).json({
        success: false,
        message:
          "This order has not been created in Qikink yet",
      });
    }

    const qikinkResponse =
      await getQikinkOrder({
        orderId: order.qikink.orderId,
      });

    const previousOrderStatus = order.orderStatus;
    const previousTrackingNumber = order.trackingNumber;
    const previousTrackingUrl = order.trackingUrl;

    const qikinkStatus =
      qikinkResponse?.status ||
      qikinkResponse?.order_status ||
      qikinkResponse?.data?.status ||
      order.qikink.status;

    const trackingNumber =
      qikinkResponse?.tracking_number ||
      qikinkResponse?.tracking_id ||
      qikinkResponse?.awb ||
      qikinkResponse?.data?.tracking_number ||
      null;

    const trackingUrl =
      qikinkResponse?.tracking_url ||
      qikinkResponse?.tracking_link ||
      qikinkResponse?.data?.tracking_url ||
      null;

    order.qikink.status =
      qikinkStatus || order.qikink.status;

    order.qikink.trackingNumber =
      trackingNumber;

    order.qikink.trackingUrl =
      trackingUrl;

    order.qikink.lastSyncedAt =
      new Date();

    order.qikink.syncError = null;

    /*
     * Keep Printzenz tracking fields synchronized.
     */
    if (trackingNumber) {
      order.trackingNumber =
        trackingNumber;
    }

    if (trackingUrl) {
      order.trackingUrl =
        trackingUrl;
    }

    if (qikinkStatus) {
      order.orderStatus =
        mapQikinkStatus(qikinkStatus);
    }

    if (
      order.orderStatus === "Delivered" &&
      !order.deliveredAt
    ) {
      order.deliveredAt = new Date();
    }

    await order.save();

    if (
      order.trackingNumber &&
      (order.trackingNumber !== previousTrackingNumber ||
        order.trackingUrl !== previousTrackingUrl)
    ) {
      await sendTrackingUpdateEmail({ order });
    }

    if (
      previousOrderStatus !== "Delivered" &&
      order.orderStatus === "Delivered"
    ) {
      await sendOrderDeliveredEmail({ order });
    }

    return res.status(200).json({
      success: true,

      message:
        "Qikink order synchronized",

      orderId: order.orderId,

      orderStatus:
        order.orderStatus,

      trackingNumber:
        order.trackingNumber,

      trackingUrl:
        order.trackingUrl,

      qikink: order.qikink,

      qikinkResponse,
    });
  } catch (error) {
    console.error(
      "Qikink sync error:",
      error.responseData || error.message
    );

    /*
     * Save synchronization failure.
     */
    try {
      const { orderId } = req.params;

      await Order.findOneAndUpdate(
        { orderId },
        {
          $set: {
            "qikink.syncError":
              error.message,
            "qikink.lastSyncedAt":
              new Date(),
          },
        }
      );
    } catch (saveError) {
      console.error(
        "Unable to save Qikink sync error:",
        saveError.message
      );
    }

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to synchronize Qikink order",
    });
  }
};

/**
 * Get Qikink order list
 *
 * GET /api/qikink/orders
 *
 * Example:
 *
 * /api/qikink/orders?pageNo=1&status=Live
 *
 * /api/qikink/orders?pageNo=1&orderReferenceNo=PZ123
 */
const getQikinkOrders = async (req, res) => {
  try {
    const {
      orderReferenceNo,
      status,
      pageNo = 1,
    } = req.query;

    const result =
      await getQikinkOrderList({
        orderReferenceNo,
        status,
        pageNo: Number(pageNo) || 1,
      });

    return res.status(200).json({
      success: true,

      data: result,
    });
  } catch (error) {
    console.error(
      "Get Qikink orders error:",
      error.responseData || error.message
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to get Qikink orders",
    });
  }
};

/**
 * Sync all Printzenz orders that have Qikink IDs
 *
 * POST /api/qikink/orders/sync-all
 */
const syncAllQikinkOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "qikink.orderId": {
        $exists: true,
        $ne: null,
      },
    })
      .sort({
        createdAt: -1,
      })
      .limit(50);

    const results = [];

    for (const order of orders) {
      try {
        const qikinkResponse =
          await getQikinkOrder({
            orderId:
              order.qikink.orderId,
          });

        const qikinkStatus =
          qikinkResponse?.status ||
          qikinkResponse?.order_status ||
          qikinkResponse?.data?.status ||
          order.qikink.status;

        const trackingNumber =
          qikinkResponse?.tracking_number ||
          qikinkResponse?.tracking_id ||
          qikinkResponse?.awb ||
          qikinkResponse?.data?.tracking_number ||
          null;

        const trackingUrl =
          qikinkResponse?.tracking_url ||
          qikinkResponse?.tracking_link ||
          qikinkResponse?.data?.tracking_url ||
          null;

        order.qikink.status =
          qikinkStatus;

        order.qikink.trackingNumber =
          trackingNumber;

        order.qikink.trackingUrl =
          trackingUrl;

        order.qikink.lastSyncedAt =
          new Date();

        order.qikink.syncError = null;

        if (trackingNumber) {
          order.trackingNumber =
            trackingNumber;
        }

        if (trackingUrl) {
          order.trackingUrl =
            trackingUrl;
        }

        if (qikinkStatus) {
          order.orderStatus =
            mapQikinkStatus(
              qikinkStatus
            );
        }

        if (
          order.orderStatus === "Delivered" &&
          !order.deliveredAt
        ) {
          order.deliveredAt =
            new Date();
        }

        await order.save();

        results.push({
          orderId: order.orderId,
          success: true,
          status:
            order.orderStatus,
        });
      } catch (error) {
        results.push({
          orderId: order.orderId,
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,

      message:
        "Qikink orders synchronization completed",

      total: orders.length,

      results,
    });
  } catch (error) {
    console.error(
      "Sync all Qikink orders error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to synchronize Qikink orders",
    });
  }
};

export {
  testQikinkConnection,
  sendOrderToQikink,
  syncQikinkOrder,
  getQikinkOrders,
  syncAllQikinkOrders,
};

export default {
  testQikinkConnection,
  sendOrderToQikink,
  syncQikinkOrder,
  getQikinkOrders,
  syncAllQikinkOrders,
};