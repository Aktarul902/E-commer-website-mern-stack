import express from  "express"
import "dotenv/config"
import db from "../db/db.js"
import cors from "cors"
import authrouter from "../routes/auth.route.js"
import userrouter from "../routes/user.route.js"
import cookieParser from "cookie-parser"
import adress from "../routes/adress.route.js"
import qikink from "../routes/qikink.route.js"
import product from "../routes/product.route.js"
import category from "../routes/category.route.js"
import cartRoutes from "../routes/cart.route.js";
import orderRoutes from "../routes/order.route.js";
import wishlistRoutes from "../routes/wishlist.route.js";
import adminRoutes from "../routes/admin.route.js";
import discountRoutes from "../routes/discount.route.js";
import notificationRoutes from "../routes/notification.route.js";
import cashfreeRoutes from "../routes/cashfreePayment.route.js";
import storeSettingsRoutes from "../routes/storesettings.route.js";
import { verifyEmailTransporter } from "../services/emailServices.js";
verifyEmailTransporter()
  .then(() => {
    console.log("Email service connected successfully");
  })
  .catch((error) => {
    console.error(
      "Email service connection failed:",
      error.message
    );
  });
const app = express()
const port = Number(process.env.PORT || process.env.port || 5000);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth",authrouter)
app.use("/api/user",userrouter)
app.use("/api",adress)
app.use("/api/qikink",qikink)
app.use("/products",product)
app.use("/categories",category)
app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);
app.use("/api", discountRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(
  "/api/payments/cashfree",
  cashfreeRoutes
);
app.use("/api/store", storeSettingsRoutes);
const startServer = async () => {
  try {
    await db();

    app.listen(port, () => {
      console.log(`server running in port no ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();

export default app;