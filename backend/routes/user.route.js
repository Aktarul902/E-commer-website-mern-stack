import express from "express";
// import protect from "../app/middleware/auth.middleware.js";
import protect from "../app/Middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;