import express from "express";
import {
  getAdminNotifications,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import protect from "../app/Middleware/auth.middleware.js";
import adminOnly from "../app/Middleware/adminmiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/admin", getAdminNotifications);
router.patch("/:notificationId/read", markNotificationRead);

export default router;