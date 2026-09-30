import express from "express";

import {
  testQikinkConnection,
  sendOrderToQikink,
  syncQikinkOrder,
  getQikinkOrders,
  syncAllQikinkOrders,
} from "../controllers/qikink.controller.js";

import protect from "../app/Middleware/auth.middleware.js";
import adminOnly from "../app/Middleware/adminmiddleware.js";

const router = express.Router();

/*
 * All Qikink operations are admin-only.
 */

router.get("/test", protect, adminOnly, testQikinkConnection);

router.post(
  "/orders/:orderId/create",
  protect,
  adminOnly,
  sendOrderToQikink
);

router.get(
  "/orders/:orderId/sync",
  protect,
  adminOnly,
  syncQikinkOrder
);

router.get("/orders", protect, adminOnly, getQikinkOrders);

router.post(
  "/orders/sync-all",
  protect,
  adminOnly,
  syncAllQikinkOrders
);

export default router;