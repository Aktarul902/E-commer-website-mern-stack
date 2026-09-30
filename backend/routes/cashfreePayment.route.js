import express from "express";
import {
  createCashfreeCheckout,
  verifyCashfreePayment,
} from "../controllers/cashfree.controller.js";
import optionalAuth from "../app/Middleware/optionalAuth.middleware.js";

const router = express.Router();

router.use(optionalAuth);
router.post("/create-order", createCashfreeCheckout);
router.get("/verify/:orderId", verifyCashfreePayment);

export default router;