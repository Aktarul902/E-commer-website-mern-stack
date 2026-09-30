import express from "express";
import {
	getAdminCustomer,
	getAdminCustomers,
} from "../controllers/customer.controller.js";
import protect from "../app/Middleware/auth.middleware.js";
import adminOnly from "../app/Middleware/adminmiddleware.js";
import { createAdmin } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/customers", protect, adminOnly, getAdminCustomers);
router.get("/customers/:email", protect, adminOnly, getAdminCustomer);
router.post(
  "/create-admin",
  protect,
  adminOnly,
  createAdmin
);

export default router;