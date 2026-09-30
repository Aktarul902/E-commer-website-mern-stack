import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    storeEmail: {
      type: String,
      default: "support@printzenz.com",
      trim: true,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    maintenanceTitle: {
      type: String,
      default: "We'll be back soon!",
      trim: true,
    },

    maintenanceMessage: {
      type: String,
      default:
        "We're currently performing some maintenance. Please check back shortly.",
      trim: true,
    },

    maintenanceEndTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;