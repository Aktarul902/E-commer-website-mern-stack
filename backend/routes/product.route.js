import express from "express";
import protect from "../app/Middleware/auth.middleware.js";
import adminOnly from "../app/Middleware/adminmiddleware.js";

import {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  submitProductReview,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, submitProductReview);

// ADMIN
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminProducts
);

router.post(
  "/",
  protect,
  adminOnly,
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

export default router;