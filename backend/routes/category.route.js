import express from "express";
import protect from "../app/Middleware/auth.middleware.js";
import adminOnly from "../app/Middleware/adminmiddleware.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;