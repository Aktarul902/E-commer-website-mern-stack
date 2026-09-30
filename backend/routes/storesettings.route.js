import express from "express";

import {
  getStoreStatus,
  getStoreSettings,
  updateStoreSettings,
} from "../controllers/storesettings.controller.js";

import  protect  from "../app/Middleware/auth.middleware.js";
import  admin  from "../app/Middleware/adminmiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.get("/status", getStoreStatus);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

router.get(
  "/settings",
  protect,
  admin,
  getStoreSettings
);

router.put(
  "/settings",
  protect,
  admin,
  updateStoreSettings
);

export default router;