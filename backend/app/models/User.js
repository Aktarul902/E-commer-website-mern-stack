import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =========================================================
    // BASIC USER INFORMATION
    // =========================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================================================
    // PASSWORD
    // =========================================================

    password: {
      type: String,

      required() {
        return this.authProvider !== "google";
      },

      minlength: 6,

      // Password should not normally be returned by queries.
      // When needed for login/reset, use .select("+password")
      select: false,
    },

    // =========================================================
    // GOOGLE AUTHENTICATION
    // =========================================================

    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // =========================================================
    // PROFILE
    // =========================================================

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================================================
    // USER ROLE
    // =========================================================

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // =========================================================
    // ACCOUNT STATUS
    // =========================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    // Hashed 6-digit verification code.
    // We never store the actual verification code.
    passwordResetCodeHash: {
      type: String,
      default: null,
      select: false,
    },

    // Verification code expiration time.
    passwordResetCodeExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    // Number of incorrect verification attempts.
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // Time at which the verification code was successfully verified.
    passwordResetVerifiedAt: {
      type: Date,
      default: null,
      select: false,
    },

    // Hashed temporary reset token.
    // This token is created only after the verification code
    // has been successfully verified.
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    // Temporary reset token expiration time.
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    // =========================================================
    // PASSWORD RESET RESEND PROTECTION
    // =========================================================

    // Used to prevent repeatedly requesting reset emails.
    passwordResetLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },
  },

  {
    timestamps: true,
  }
);

// =============================================================
// MODEL
// =============================================================

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;