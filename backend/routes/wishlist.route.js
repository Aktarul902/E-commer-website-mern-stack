import express from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";

import protect from "../app/Middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getWishlist);
router.post("/:productId", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);
router.get("/check/:productId", protect, checkWishlist);
router.delete("/", protect, clearWishlist);

export default router;
