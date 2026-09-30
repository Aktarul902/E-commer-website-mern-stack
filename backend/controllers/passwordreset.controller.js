import crypto from "crypto";
import bcrypt from "bcryptjs";

import User from "../app/models/User.js";
import { sendPasswordResetEmail } from "../services/emailServices.js";

const CODE_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESET_ATTEMPTS = 5;

// ============================================================
// Helper: Generate 6-digit verification code
// ============================================================

const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// ============================================================
// Helper: Hash reset token
// ============================================================

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ============================================================
// 1. FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    // Always return the same public response.
    // This prevents account/email enumeration.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for this email, a verification code has been sent.",
    };

    const user = await User.findOne({ email }).select(
      "+passwordResetCodeHash " +
        "+passwordResetCodeExpiresAt " +
        "+passwordResetAttempts " +
        "+passwordResetVerifiedAt " +
        "+passwordResetTokenHash " +
        "+passwordResetTokenExpiresAt " +
        "+passwordResetLastSentAt"
    );

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Google-only accounts should use Google Sign-In.
    if (user.authProvider === "google") {
      return res.status(200).json(genericResponse);
    }

    if (!user.isActive) {
      return res.status(200).json(genericResponse);
    }

    // ========================================================
    // Resend cooldown
    // ========================================================

    if (user.passwordResetLastSentAt) {
      const elapsed =
        Date.now() -
        new Date(user.passwordResetLastSentAt).getTime();

      const cooldown =
        RESEND_COOLDOWN_SECONDS * 1000;

      if (elapsed < cooldown) {
        return res.status(200).json(genericResponse);
      }
    }

    // ========================================================
    // Generate code
    // ========================================================

    const code = generateVerificationCode();

    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(
      Date.now() +
        CODE_EXPIRY_MINUTES * 60 * 1000
    );

    user.passwordResetCodeHash = codeHash;
    user.passwordResetCodeExpiresAt = expiresAt;
    user.passwordResetAttempts = 0;
    user.passwordResetVerifiedAt = null;
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    user.passwordResetLastSentAt = new Date();

    await user.save();

    // ========================================================
    // Send email
    // ========================================================

    try {
      await sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        code,
      });
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError
      );

      // Clear reset information if email wasn't sent.
      user.passwordResetCodeHash = null;
      user.passwordResetCodeExpiresAt = null;
      user.passwordResetAttempts = 0;
      user.passwordResetLastSentAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the verification email. Please try again later.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

// ============================================================
// 2. VERIFY RESET CODE
// POST /api/auth/verify-reset-code
// ============================================================

export const verifyResetCode = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const code = String(req.body.code || "")
      .trim();

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Email and verification code are required.",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message:
          "Verification code must contain 6 digits.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetCodeHash " +
        "+passwordResetCodeExpiresAt " +
        "+passwordResetAttempts " +
        "+passwordResetVerifiedAt " +
        "+passwordResetTokenHash " +
        "+passwordResetTokenExpiresAt"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    // ========================================================
    // Check attempts
    // ========================================================

    if (
      user.passwordResetAttempts >=
      MAX_RESET_ATTEMPTS
    ) {
      user.passwordResetCodeHash = null;
      user.passwordResetCodeExpiresAt = null;
      user.passwordResetAttempts = 0;

      await user.save();

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new code.",
      });
    }

    // ========================================================
    // Check expiry
    // ========================================================

    if (
      !user.passwordResetCodeExpiresAt ||
      user.passwordResetCodeExpiresAt.getTime() <
        Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This verification code has expired. Please request a new code.",
      });
    }

    if (!user.passwordResetCodeHash) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired verification code.",
      });
    }

    // ========================================================
    // Compare code
    // ========================================================

    const isValid = await bcrypt.compare(
      code,
      user.passwordResetCodeHash
    );

    if (!isValid) {
      user.passwordResetAttempts += 1;

      await user.save();

      const remaining =
        MAX_RESET_ATTEMPTS -
        user.passwordResetAttempts;

      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Incorrect verification code. ${remaining} attempt${
                remaining === 1 ? "" : "s"
              } remaining.`
            : "Too many incorrect attempts. Please request a new code.",
      });
    }

    // ========================================================
    // Code is correct
    // ========================================================

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    const resetTokenHash =
      hashResetToken(resetToken);

    const resetTokenExpiresAt = new Date(
      Date.now() +
        RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    user.passwordResetVerifiedAt = new Date();

    user.passwordResetTokenHash =
      resetTokenHash;

    user.passwordResetTokenExpiresAt =
      resetTokenExpiresAt;

    // Code cannot be used again.
    user.passwordResetCodeHash = null;
    user.passwordResetCodeExpiresAt = null;
    user.passwordResetAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Verification successful. You can now create a new password.",
      resetToken,
      expiresInMinutes:
        RESET_TOKEN_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error(
      "Verify reset code error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

// ============================================================
// 3. RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

export const resetPassword = async (req, res) => {
  try {
    const resetToken = String(
      req.body.resetToken || ""
    ).trim();

    const password = String(
      req.body.password || ""
    );

    const confirmPassword = String(
      req.body.confirmPassword || ""
    );

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const resetTokenHash =
      hashResetToken(resetToken);

    const user = await User.findOne({
      passwordResetTokenHash: resetTokenHash,
      passwordResetTokenExpiresAt: {
        $gt: new Date(),
      },
    }).select(
      "+password " +
        "+passwordResetTokenHash " +
        "+passwordResetTokenExpiresAt"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset session is invalid or expired. Please start again.",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In.",
      });
    }

    // ========================================================
    // Hash new password
    // ========================================================

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    user.password = hashedPassword;

    // ========================================================
    // Invalidate reset information
    // ========================================================

    user.passwordResetCodeHash = null;
    user.passwordResetCodeExpiresAt = null;
    user.passwordResetAttempts = 0;
    user.passwordResetVerifiedAt = null;
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    user.passwordResetLastSentAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your password has been changed successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};