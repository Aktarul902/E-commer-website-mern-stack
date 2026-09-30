import express from "express"
import { signup, login, getMe, logout, updateProfile } from "../controllers/auth.controller.js";
import { googleLogin } from "../controllers/googleauth.controller.js";
import { forgotPassword, verifyResetCode, resetPassword } from "../controllers/passwordreset.controller.js"
import protect from "../app/Middleware/auth.middleware.js";
const router = express.Router()
router.post("/signup", signup); 
router.post("/login", login); 
router.post("/google", googleLogin);

router.get("/me", protect, getMe); 
router.post("/logout", logout);
router.patch("/profile", protect, updateProfile);
router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-code",
  verifyResetCode
);

router.post(
  "/reset-password",
  resetPassword
);
export default router