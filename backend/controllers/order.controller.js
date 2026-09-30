import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../app/models/Order.js";
import Cart from "../app/models/Cart.js";
import Product from "../app/models/Product.js";
import Notification from "../app/models/Notification.js";
import StoreSettings from "../app/models/Storesettings.js";
import {
  sendOrderEmails,
  sendOrderCancelledEmail,
  sendOrderDeliveredEmail,
  sendOrderNotReturnedEmail,
  sendOrderReturnedEmail,
  sendReturnRequestAdminEmail,
  sendTrackingUpdateEmail,
} from "../services/emailServices.js";


// =====================================================
// GENERATE ORDER ID
// =====================================================

const generateOrderId = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `PZ-${year}${month}${day}-${random}`;
};


// =====================================================
// GENERATE TRACKING TOKEN
// =====================================================

const generateTrackingToken = () => {
  return crypto
    .randomBytes(24)
    .toString("hex");
};


// =====================================================
// CREATE ORDER
//
// POST /api/orders
//
// Works for:
// authenticated + guest
// =====================================================

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      customer,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    const normalizedPaymentMethod =
      paymentMethod === "PREPAID" ? "CASHFREE" : paymentMethod;

    const normalizedShippingAddress = {
      firstName:
        shippingAddress?.firstName ||
        customer?.firstName ||
        "",

      lastName:
        shippingAddress?.lastName ||
        customer?.lastName ||
        "",

      email:
        shippingAddress?.email ||
        customer?.email ||
        "",

      phone:
        shippingAddress?.phone ||
        customer?.phone ||
        "",

      address1:
        shippingAddress?.address1 ||
        shippingAddress?.address ||
        shippingAddress?.line1 ||
        "",

      address2:
        shippingAddress?.address2 ||
        shippingAddress?.line2 ||
        "",

      city: shippingAddress?.city || "",
      state: shippingAddress?.state || "",
      pincode: shippingAddress?.pincode || "",
      country: shippingAddress?.country || "India",
      countryCode:
        shippingAddress?.countryCode || "IN",
    };


    // -----------------------------------------------
    // Validate customer
    // -----------------------------------------------

    if (!customer?.firstName) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!customer?.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }


    // -----------------------------------------------
    // Validate shipping address
    // -----------------------------------------------

    if (
      !normalizedShippingAddress.address1 ||
      !normalizedShippingAddress.city ||
      !normalizedShippingAddress.state ||
      !normalizedShippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }


    // -----------------------------------------------
    // Validate items
    // -----------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }


    // -----------------------------------------------
    // Validate payment method
    // -----------------------------------------------

    if (
      !["COD", "PREPAID", "CASHFREE"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }


    const orderItems = [];

    let subtotal = 0;


    // -----------------------------------------------
    // Verify every product from MongoDB
    // -----------------------------------------------

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is missing",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }


      const product = await Product.findById(
        item.productId
      );


      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }


      if (product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }


      // ---------------------------------------------
      // Determine product price + stock
      // ---------------------------------------------

      let finalPrice = product.price;

      let availableStock = product.stock;

      let selectedVariant = null;


      if (
        item.variant?.sku ||
        item.variant?.size ||
        item.variant?.color
      ) {
        selectedVariant =
          product.variants?.find((variant) => {

            const sizeMatch =
              item.variant?.size == null ||
              variant.size ===
                item.variant.size;

            const colorMatch =
              item.variant?.color == null ||
              variant.color ===
                item.variant.color;

            const skuMatch =
              item.variant?.sku == null ||
              variant.sku ===
                item.variant.sku;

            return (
              sizeMatch &&
              colorMatch &&
              skuMatch
            );
          });


        if (!selectedVariant) {
          return res.status(400).json({
            success: false,
            message: `Selected variant for ${product.name} is not available`,
          });
        }


        if (
          selectedVariant.active === false
        ) {
          return res.status(400).json({
            success: false,
            message: `Selected variant for ${product.name} is unavailable`,
          });
        }


        finalPrice =
          selectedVariant.price ??
          product.price;

        availableStock =
          selectedVariant.stock;
      }


      // ---------------------------------------------
      // Stock check
      // ---------------------------------------------

      if (availableStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has only ${availableStock} item(s) available`,
        });
      }


      // ---------------------------------------------
      // Calculate subtotal
      // ---------------------------------------------

      const itemSubtotal =
        finalPrice * quantity;

      subtotal += itemSubtotal;


      orderItems.push({
        product: product._id,

        name: product.name,

        image:
          product.images?.[0] || "",

        sku:
          selectedVariant?.sku ||
          product.sku ||
          "",

        variant: {
          size:
            selectedVariant?.size ||
            item.variant?.size ||
            null,

          color:
            selectedVariant?.color ||
            item.variant?.color ||
            null,

          sku:
            selectedVariant?.sku ||
            item.variant?.sku ||
            null,

          qikinkSku:
            selectedVariant?.qikinkSku ||
            item.variant?.qikinkSku ||
            null,
        },

        price: finalPrice,

        quantity,

        subtotal: itemSubtotal,
      });
    }


    // -----------------------------------------------
    // Shipping
    // -----------------------------------------------

    const shippingCharge = 0;


    // -----------------------------------------------
    // Discount
    // -----------------------------------------------

    const discount =
      normalizedPaymentMethod === "CASHFREE"
        ? subtotal * 0.1
        : 0;


    // -----------------------------------------------
    // Final total
    // -----------------------------------------------

    const totalAmount =
      Math.max(
        0,
        subtotal +
          shippingCharge -
          discount
      );


    // -----------------------------------------------
    // Determine customer type
    // -----------------------------------------------

    const isAuthenticated =
      !!req.user;


    const orderType =
      isAuthenticated
        ? "authenticated"
        : "guest";


    // -----------------------------------------------
    // Create order
    // -----------------------------------------------

    const order = await Order.create({
      user: isAuthenticated
        ? req.user._id
        : null,

      orderId:
        generateOrderId(),

      orderType,

      customer: {
        firstName:
          customer.firstName,

        lastName:
          customer.lastName || "",

        email:
          customer.email || "",

        phone:
          customer.phone,
      },

      shippingAddress:
        normalizedShippingAddress,

      items: orderItems,

      subtotal,

      shippingCharge,

      discount,

      totalAmount,

      paymentMethod: normalizedPaymentMethod,

      paymentStatus:
        "PENDING",

      orderStatus:
        "Pending",

      trackingToken:
        generateTrackingToken(),
    });

    try {
      const customerName = [
        order.customer.firstName,
        order.customer.lastName,
      ].filter(Boolean).join(" ");

      await Notification.create({
        type: "order_created",
        title: "New order received",
        message: `${customerName} placed an order for ₹${order.totalAmount.toLocaleString("en-IN")}.`,
        order: order._id,
        orderId: order.orderId,
      });
    } catch (notificationError) {
      console.error("Create order notification error:", notificationError);
    }

    try {
      const storeSettings = await StoreSettings.findOne().select("storeEmail");
      const adminEmail =
        process.env.ADMIN_ORDER_EMAIL ||
        storeSettings?.storeEmail ||
        process.env.EMAIL_USER;

      await sendOrderEmails({ order, adminEmail });
    } catch (emailError) {
      console.error("Send order emails error:", emailError);
    }


    // -----------------------------------------------
    // If authenticated, clear DB cart
    // -----------------------------------------------

    if (isAuthenticated) {
      await Cart.findOneAndUpdate(
        {
          user: req.user._id,
        },
        {
          $set: {
            items: [],
          },
        }
      );
    }


    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order: {
        id: order._id,

        orderId:
          order.orderId,

        orderType:
          order.orderType,

        totalAmount:
          order.totalAmount,

        paymentMethod:
          order.paymentMethod,

        trackingToken:
          order.trackingToken,

        paymentStatus:
          order.paymentStatus,

        orderStatus:
          order.orderStatus,

        trackingToken:
          order.trackingToken,
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};


// =====================================================
// GET MY ORDERS
//
// GET /api/orders/my-orders
//
// AUTHENTICATED ONLY
// =====================================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .select("-trackingToken");

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};

export const getAdminOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select("-trackingToken");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get admin order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get order",
    });
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const statusValues = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      returned: "Returned",
      "not returned": "Not Returned",
      notreturned: "Not Returned",
      cancelled: "Cancelled",
    };
    const requestedStatus = String(req.body.orderStatus || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");
    const orderStatus = statusValues[
      requestedStatus
    ];

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findOne({ orderId: req.params.orderId })
      .select("-trackingToken");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const wasDelivered = order.orderStatus === "Delivered";
    const wasCancelled = order.orderStatus === "Cancelled";
    const previousOrderStatus = order.orderStatus;
    const cancellationReason =
      String(req.body.cancellationReason || "").trim();
    const returnDecisionReason =
      String(req.body.returnDecisionReason || "").trim();

    if (orderStatus === "Cancelled" && !cancellationReason) {
      return res.status(400).json({
        success: false,
        message: "A cancellation reason is required",
      });
    }

    if (cancellationReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason must be 500 characters or fewer",
      });
    }

    if (orderStatus === "Not Returned" && !returnDecisionReason) {
      return res.status(400).json({
        success: false,
        message: "A reason is required when marking an order not returned",
      });
    }

    if (returnDecisionReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Return decision reason must be 500 characters or fewer",
      });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Cancelled") {
      order.cancelledAt = new Date();
      order.cancellationReason = cancellationReason;
    }
    if (orderStatus === "Not Returned") {
      order.returnDecisionReason = returnDecisionReason;
    }
    if (orderStatus === "Delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    if (!wasDelivered && orderStatus === "Delivered") {
      await sendOrderDeliveredEmail({ order });
    }
    if (!wasCancelled && orderStatus === "Cancelled") {
      await sendOrderCancelledEmail({ order, reason: cancellationReason });
    }
    if (previousOrderStatus !== "Returned" && orderStatus === "Returned") {
      await sendOrderReturnedEmail({ order });
    }
    if (
      previousOrderStatus !== "Not Returned" &&
      orderStatus === "Not Returned"
    ) {
      await sendOrderNotReturnedEmail({
        order,
        reason: returnDecisionReason,
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Update admin order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const updateAdminOrderTracking = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select("-trackingToken");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const trackingNumber =
      String(req.body.trackingNumber || "").trim() || null;
    const trackingUrl =
      String(req.body.trackingUrl || "").trim() || null;
    const trackingChanged =
      (order.trackingNumber || null) !== trackingNumber ||
      (order.trackingUrl || null) !== trackingUrl;

    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    await order.save();

    if (trackingChanged && order.trackingNumber) {
      await sendTrackingUpdateEmail({ order });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Update admin order tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tracking information",
    });
  }
};

export const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "-trackingToken"
        );

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};


// =====================================================
// GET SINGLE MY ORDER
//
// GET /api/orders/my-orders/:orderId
// =====================================================

export const getMyOrder = async (
  req,
  res
) => {
  try {
    const { orderId } =
      req.params;


    const order =
      await Order.findOne({
        orderId,

        user:
          req.user._id,
      });


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get my order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get order",
    });
  }
};


// =====================================================
// TRACK ORDER
//
// POST /api/orders/track
//
// Guest + authenticated
// =====================================================

export const trackOrder = async (
  req,
  res
) => {
  try {
    const {
      orderId,
      trackingToken,
    } = req.body;


    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }


    const query = {
      orderId,
    };


    /*
     * For guest orders we require
     * trackingToken as an additional
     * verification layer.
     */

    if (trackingToken) {
      query.trackingToken =
        trackingToken;
    }


    const order =
      await Order.findOne(query)
        .select(
          "-trackingToken"
        );


    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or tracking details are incorrect",
      });
    }


    return res.status(200).json({
      success: true,

      order: {
        orderId:
          order.orderId,

        orderType:
          order.orderType,

        customer:
          order.customer,

        shippingAddress:
          order.shippingAddress,

        items:
          order.items,

        subtotal:
          order.subtotal,

        shippingCharge:
          order.shippingCharge,

        discount:
          order.discount,

        totalAmount:
          order.totalAmount,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        orderStatus:
          order.orderStatus,

        trackingNumber:
          order.trackingNumber,

        trackingUrl:
          order.trackingUrl,

        createdAt:
          order.createdAt,

        updatedAt:
          order.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Track order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to track order",
    });
  }
};


// =====================================================
// CANCEL ORDER
//
// PUT /api/orders/:orderId/cancel
// =====================================================

export const cancelOrder = async (
  req,
  res
) => {
  try {
    const { orderId } =
      req.params;


    const order =
      await Order.findOne({
        orderId,

        user:
          req.user._id,
      });


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    const cancellableStatuses = [
      "Pending",
      "Confirmed",
    ];


    if (
      !cancellableStatuses.includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order can no longer be cancelled",
      });
    }


    order.orderStatus =
      "Cancelled";

    order.cancelledAt =
      new Date();


    await order.save();


    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel order",
    });
  }
};

export const requestOrderReturn = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "A return can only be requested for delivered orders",
      });
    }

    if (order.returnRequest?.status) {
      return res.status(409).json({
        success: false,
        message: "A return request already exists for this order",
        order,
      });
    }

    order.returnRequest = {
      status: "Requested",
      reason: String(req.body?.reason || "").trim().slice(0, 500),
      requestedAt: new Date(),
    };

    await order.save();

    try {
      const customerName = [
        order.customer.firstName,
        order.customer.lastName,
      ].filter(Boolean).join(" ");

      await Notification.create({
        type: "return_requested",
        title: "Customer requested a return",
        message: `${customerName} requested a return for order ${order.orderId}.`,
        order: order._id,
        orderId: order.orderId,
      });
    } catch (notificationError) {
      console.error("Create return request notification error:", notificationError);
    }

    try {
      const storeSettings = await StoreSettings.findOne().select("storeEmail");
      const adminEmail =
        process.env.ADMIN_ORDER_EMAIL ||
        storeSettings?.storeEmail ||
        process.env.EMAIL_USER;

      await sendReturnRequestAdminEmail({ order, adminEmail });
    } catch (emailError) {
      console.error("Send return request admin email error:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Return request submitted",
      order,
    });
  } catch (error) {
    console.error("Request order return error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit return request",
    });
  }
};
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select(
        "_id orderId createdAt orderStatus totalAmount items paymentStatus"
      )
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get recent orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
    });
  }
};