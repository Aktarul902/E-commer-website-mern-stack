import express from "express";

import {
  getDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  updateDiscountStatus,
  validateDiscount,
} from "../controllers/discount.controller.js";

import protect from "../app/Middleware/auth.middleware.js";
import admin from "../app/Middleware/adminmiddleware.js";


const router =
  express.Router();


// =====================================================
// ADMIN
// =====================================================

router.get(
  "/admin/discounts",
  protect,
  admin,
  getDiscounts
);


router.get(
  "/admin/discounts/:id",
  protect,
  admin,
  getDiscount
);


router.post(
  "/admin/discounts",
  protect,
  admin,
  createDiscount
);


router.put(
  "/admin/discounts/:id",
  protect,
  admin,
  updateDiscount
);


router.delete(
  "/admin/discounts/:id",
  protect,
  admin,
  deleteDiscount
);


router.put(
  "/admin/discounts/:id/status",
  protect,
  admin,
  updateDiscountStatus
);


// =====================================================
// CUSTOMER
// =====================================================

// This endpoint can work for guest users.
// Therefore protect middleware is intentionally
// NOT used here.

router.post(
  "/discounts/validate",
  validateDiscount
);


export default router;