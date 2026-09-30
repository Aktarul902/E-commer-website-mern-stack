import express from "express";

import {
  createOrder,
  getAllOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  getMyOrders,
  getMyOrder,
  trackOrder,
  cancelOrder,
  requestOrderReturn,
  getRecentOrders
} from "../controllers/order.controller.js";

import protect from "../app/Middleware/auth.middleware.js";
import optionalAuth from "../app/Middleware/optionalAuth.middleware.js";
import adminOnly from "../app/Middleware/adminmiddleware.js";

const router = express.Router();


// =====================================================
// CREATE ORDER
//
// IMPORTANT:
// This route intentionally does NOT use protect.
//
// Both logged-in and guest customers can order.
// =====================================================

router.post(
  "/",
  optionalAuth,
  createOrder
);


// =====================================================
// AUTHENTICATED CUSTOMER ORDERS
// =====================================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

router.get(
  "/admin/:orderId",
  protect,
  adminOnly,
  getAdminOrder
);

router.put(
  "/admin/:orderId/status",
  protect,
  adminOnly,
  updateAdminOrderStatus
);

router.put(
  "/admin/:orderId/tracking",
  protect,
  adminOnly,
  updateAdminOrderTracking
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);


router.get(
  "/my-orders/:orderId",
  protect,
  getMyOrder
);

router.get(
  "/recent",
  protect,
  getRecentOrders
);

// =====================================================
// TRACK ORDER
//
// Guest + authenticated
// =====================================================

router.post(
  "/track",
  trackOrder
);


// =====================================================
// CANCEL ORDER
//
// Authenticated customer
// =====================================================

router.put(
  "/:orderId/cancel",
  protect,
  cancelOrder
);

router.post(
  "/:orderId/return",
  protect,
  requestOrderReturn
);


export default router;