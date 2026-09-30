import StoreSettings from "../app/models/Storesettings.js";

/**
 * Get public store status
 * GET /api/store/status
 */
export const getStoreStatus = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({});
    }

    return res.status(200).json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      maintenanceTitle: settings.maintenanceTitle,
      maintenanceMessage: settings.maintenanceMessage,
      maintenanceEndTime: settings.maintenanceEndTime,
    });
  } catch (error) {
    console.error("Get store status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get store status",
    });
  }
};

/**
 * Get complete store settings
 * GET /api/store/settings
 */
export const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get store settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get store settings",
    });
  }
};

/**
 * Update store settings
 * PUT /api/store/settings
 */
export const updateStoreSettings = async (req, res) => {
  try {
    const {
      storeEmail,
      currency,
      timezone,
      maintenanceMode,
      maintenanceTitle,
      maintenanceMessage,
      maintenanceEndTime,
    } = req.body;

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = new StoreSettings();
    }

    if (storeEmail !== undefined) {
      const normalizedEmail = String(storeEmail).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid store email address",
        });
      }
      settings.storeEmail = normalizedEmail;
    }

    if (typeof currency === "string" && currency.trim()) {
      settings.currency = currency.trim();
    }

    if (typeof timezone === "string" && timezone.trim()) {
      settings.timezone = timezone.trim();
    }

    if (typeof maintenanceMode === "boolean") {
      settings.maintenanceMode = maintenanceMode;
    }

    if (maintenanceTitle !== undefined) {
      settings.maintenanceTitle = maintenanceTitle;
    }

    if (maintenanceMessage !== undefined) {
      settings.maintenanceMessage = maintenanceMessage;
    }

    if (maintenanceEndTime !== undefined) {
      settings.maintenanceEndTime =
        maintenanceEndTime === null || maintenanceEndTime === ""
          ? null
          : new Date(maintenanceEndTime);
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: settings.maintenanceMode
        ? "Maintenance mode enabled"
        : "Maintenance mode disabled",
      settings,
    });
  } catch (error) {
    console.error("Update store settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store settings",
    });
  }
};