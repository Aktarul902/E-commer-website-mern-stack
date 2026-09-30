import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import protect from "../app/Middleware/auth.middleware.js";

const router = express.Router();


// All cart routes require authentication

router.get("/", protect, getCart);

router.post("/add", protect, addToCart);

router.put(
  "/:productId",
  protect,
  updateCartItem
);

router.delete(
  "/:productId",
  protect,
  removeCartItem
);

router.delete(
  "/",
  protect,
  clearCart
);

export default router;