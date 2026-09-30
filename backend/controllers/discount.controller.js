import Discount from "../app/models/Discount.js";


// =====================================================
// HELPER
// =====================================================

const normalizeCode = (code) => {
  return String(code || "")
    .trim()
    .toUpperCase();
};


// =====================================================
// GET DISCOUNT STATUS
// =====================================================

const getDiscountStatus = (discount) => {
  const now = new Date();

  if (!discount.isActive) {
    return "inactive";
  }

  if (
    discount.startDate &&
    new Date(discount.startDate) > now
  ) {
    return "scheduled";
  }

  if (
    discount.endDate &&
    new Date(discount.endDate) < now
  ) {
    return "expired";
  }

  if (
    discount.usageLimit !== null &&
    discount.usedCount >=
      discount.usageLimit
  ) {
    return "expired";
  }

  return "active";
};


// =====================================================
// GET ALL DISCOUNTS
// GET /api/admin/discounts
// =====================================================

export const getDiscounts =
  async (req, res) => {
    try {
      const discounts =
        await Discount.find({})
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        discounts,
      });
    } catch (error) {
      console.error(
        "Get discounts error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch discounts",
      });
    }
  };


// =====================================================
// GET SINGLE DISCOUNT
// GET /api/admin/discounts/:id
// =====================================================

export const getDiscount =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const discount =
        await Discount.findById(id);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Discount not found",
        });
      }

      return res.status(200).json({
        success: true,
        discount,
      });
    } catch (error) {
      console.error(
        "Get discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch discount",
      });
    }
  };


// =====================================================
// CREATE DISCOUNT
// POST /api/admin/discounts
// =====================================================

export const createDiscount =
  async (req, res) => {
    try {
      const {
        code,
        name,
        description,
        type,
        value,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        perCustomerLimit,
        startDate,
        endDate,
        isActive,
        applicableProducts,
        applicableCategories,
      } = req.body;

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!code) {
        return res.status(400).json({
          success: false,
          message:
            "Discount code is required",
        });
      }

      if (
        !["percentage", "fixed"].includes(
          type
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid discount type",
        });
      }

      if (
        value === undefined ||
        Number(value) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount value must be greater than 0",
        });
      }

      if (
        type === "percentage" &&
        Number(value) > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Percentage cannot be greater than 100",
        });
      }

      // -----------------------------------------------
      // NORMALIZE CODE
      // -----------------------------------------------

      const normalizedCode =
        normalizeCode(code);

      // -----------------------------------------------
      // CHECK DUPLICATE
      // -----------------------------------------------

      const existing =
        await Discount.findOne({
          code: normalizedCode,
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Discount code already exists",
        });
      }

      // -----------------------------------------------
      // DATE VALIDATION
      // -----------------------------------------------

      if (
        startDate &&
        endDate &&
        new Date(startDate) >=
          new Date(endDate)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "End date must be after start date",
        });
      }

      // -----------------------------------------------
      // CREATE
      // -----------------------------------------------

      const discount =
        await Discount.create({
          code: normalizedCode,

          name:
            name?.trim() || "",

          description:
            description?.trim() || "",

          type,

          value: Number(value),

          minimumOrderValue:
            Number(
              minimumOrderValue || 0
            ),

          maximumDiscount:
            type === "percentage" &&
            maximumDiscount !==
              null &&
            maximumDiscount !==
              undefined &&
            maximumDiscount !== ""
              ? Number(
                  maximumDiscount
                )
              : null,

          usageLimit:
            usageLimit !==
              null &&
            usageLimit !==
              undefined &&
            usageLimit !== ""
              ? Number(
                  usageLimit
                )
              : null,

          perCustomerLimit:
            Number(
              perCustomerLimit || 1
            ),

          startDate:
            startDate || null,

          endDate:
            endDate || null,

          isActive:
            isActive !== undefined
              ? Boolean(isActive)
              : true,

          applicableProducts:
            Array.isArray(
              applicableProducts
            )
              ? applicableProducts
              : [],

          applicableCategories:
            Array.isArray(
              applicableCategories
            )
              ? applicableCategories
              : [],
        });

      return res.status(201).json({
        success: true,
        message:
          "Discount created successfully",
        discount,
      });
    } catch (error) {
      console.error(
        "Create discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create discount",
      });
    }
  };


// =====================================================
// UPDATE DISCOUNT
// PUT /api/admin/discounts/:id
// =====================================================

export const updateDiscount =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const discount =
        await Discount.findById(id);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Discount not found",
        });
      }

      const {
        code,
        name,
        description,
        type,
        value,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        perCustomerLimit,
        startDate,
        endDate,
        isActive,
        applicableProducts,
        applicableCategories,
      } = req.body;

      // -----------------------------------------------
      // CODE
      // -----------------------------------------------

      if (code !== undefined) {
        const normalizedCode =
          normalizeCode(code);

        const duplicate =
          await Discount.findOne({
            code: normalizedCode,
            _id: {
              $ne: id,
            },
          });

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message:
              "Another discount already uses this code",
          });
        }

        discount.code =
          normalizedCode;
      }

      // -----------------------------------------------
      // BASIC
      // -----------------------------------------------

      if (name !== undefined) {
        discount.name =
          String(name).trim();
      }

      if (
        description !==
        undefined
      ) {
        discount.description =
          String(
            description
          ).trim();
      }

      if (type !== undefined) {
        if (
          ![
            "percentage",
            "fixed",
          ].includes(type)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid discount type",
          });
        }

        discount.type =
          type;
      }

      if (value !== undefined) {
        const numericValue =
          Number(value);

        if (
          !Number.isFinite(
            numericValue
          ) ||
          numericValue <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid discount value",
          });
        }

        discount.value =
          numericValue;
      }

      // -----------------------------------------------
      // PERCENTAGE VALIDATION
      // -----------------------------------------------

      if (
        discount.type ===
          "percentage" &&
        discount.value > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Percentage cannot be greater than 100",
        });
      }

      // -----------------------------------------------
      // CONDITIONS
      // -----------------------------------------------

      if (
        minimumOrderValue !==
        undefined
      ) {
        discount.minimumOrderValue =
          Number(
            minimumOrderValue || 0
          );
      }

      if (
        maximumDiscount !==
        undefined
      ) {
        discount.maximumDiscount =
          discount.type ===
          "percentage"
            ? maximumDiscount ===
                "" ||
              maximumDiscount ===
                null
              ? null
              : Number(
                  maximumDiscount
                )
            : null;
      }

      if (
        usageLimit !==
        undefined
      ) {
        discount.usageLimit =
          usageLimit ===
            "" ||
          usageLimit === null
            ? null
            : Number(
                usageLimit
              );
      }

      if (
        perCustomerLimit !==
        undefined
      ) {
        discount.perCustomerLimit =
          Number(
            perCustomerLimit || 1
          );
      }

      // -----------------------------------------------
      // DATES
      // -----------------------------------------------

      if (
        startDate !==
        undefined
      ) {
        discount.startDate =
          startDate || null;
      }

      if (
        endDate !==
        undefined
      ) {
        discount.endDate =
          endDate || null;
      }

      if (
        discount.startDate &&
        discount.endDate &&
        new Date(
          discount.startDate
        ) >=
          new Date(
            discount.endDate
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "End date must be after start date",
        });
      }

      // -----------------------------------------------
      // ACTIVE
      // -----------------------------------------------

      if (
        isActive !==
        undefined
      ) {
        discount.isActive =
          Boolean(isActive);
      }

      // -----------------------------------------------
      // PRODUCT/CATEGORY
      // -----------------------------------------------

      if (
        Array.isArray(
          applicableProducts
        )
      ) {
        discount.applicableProducts =
          applicableProducts;
      }

      if (
        Array.isArray(
          applicableCategories
        )
      ) {
        discount.applicableCategories =
          applicableCategories;
      }

      await discount.save();

      return res.status(200).json({
        success: true,
        message:
          "Discount updated successfully",
        discount,
      });
    } catch (error) {
      console.error(
        "Update discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update discount",
      });
    }
  };


// =====================================================
// DELETE DISCOUNT
// DELETE /api/admin/discounts/:id
// =====================================================

export const deleteDiscount =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const discount =
        await Discount.findById(id);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Discount not found",
        });
      }

      await Discount.findByIdAndDelete(
        id
      );

      return res.status(200).json({
        success: true,
        message:
          "Discount deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete discount",
      });
    }
  };


// =====================================================
// ACTIVATE / DEACTIVATE
// PUT /api/admin/discounts/:id/status
// =====================================================

export const updateDiscountStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        status,
        isActive,
      } = req.body;

      const discount =
        await Discount.findById(id);

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Discount not found",
        });
      }

      if (
        isActive !==
        undefined
      ) {
        discount.isActive =
          Boolean(isActive);
      } else {
        discount.isActive =
          status ===
          "active";
      }

      await discount.save();

      return res.status(200).json({
        success: true,
        message:
          discount.isActive
            ? "Discount activated"
            : "Discount deactivated",
        discount,
      });
    } catch (error) {
      console.error(
        "Discount status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update discount status",
      });
    }
  };


// =====================================================
// VALIDATE COUPON
// POST /api/discounts/validate
// =====================================================

export const validateDiscount =
  async (req, res) => {
    try {
      const {
        code,
        subtotal,
      } = req.body;

      const userId =
        req.user?._id || null;

      const email =
        String(
          req.body.email ||
            req.user?.email ||
            ""
        )
          .trim()
          .toLowerCase();

      if (!code) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code is required",
        });
      }

      const cartSubtotal =
        Number(subtotal);

      if (
        !Number.isFinite(
          cartSubtotal
        ) ||
        cartSubtotal < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subtotal",
        });
      }

      const normalizedCode =
        normalizeCode(code);

      const discount =
        await Discount.findOne({
          code: normalizedCode,
        });

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Invalid coupon code",
        });
      }

      // -----------------------------------------------
      // ACTIVE
      // -----------------------------------------------

      if (!discount.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon is inactive",
        });
      }

      // -----------------------------------------------
      // START DATE
      // -----------------------------------------------

      const now = new Date();

      if (
        discount.startDate &&
        now <
          new Date(
            discount.startDate
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon is not active yet",
        });
      }

      // -----------------------------------------------
      // EXPIRY
      // -----------------------------------------------

      if (
        discount.endDate &&
        now >
          new Date(
            discount.endDate
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has expired",
        });
      }

      // -----------------------------------------------
      // TOTAL USAGE
      // -----------------------------------------------

      if (
        discount.usageLimit !==
          null &&
        discount.usedCount >=
          discount.usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has reached its usage limit",
        });
      }

      // -----------------------------------------------
      // MINIMUM ORDER
      // -----------------------------------------------

      if (
        cartSubtotal <
        discount.minimumOrderValue
      ) {
        return res.status(400).json({
          success: false,
          message: `Minimum order value is ₹${discount.minimumOrderValue}`,
        });
      }

      // -----------------------------------------------
      // CUSTOMER USAGE LIMIT
      // -----------------------------------------------

      if (
        discount.perCustomerLimit
      ) {
        const customerUsage =
          discount.usageHistory.filter(
            (usage) => {
              if (
                userId &&
                usage.user
              ) {
                return (
                  String(
                    usage.user
                  ) ===
                  String(
                    userId
                  )
                );
              }

              if (
                email &&
                usage.email
              ) {
                return (
                  usage.email.toLowerCase() ===
                  email
                );
              }

              return false;
            }
          ).length;

        if (
          customerUsage >=
          discount.perCustomerLimit
        ) {
          return res.status(400).json({
            success: false,
            message:
              "You have already used this coupon the maximum allowed times",
          });
        }
      }

      // -----------------------------------------------
      // CALCULATE
      // -----------------------------------------------

      let discountAmount = 0;

      if (
        discount.type ===
        "percentage"
      ) {
        discountAmount =
          (cartSubtotal *
            discount.value) /
          100;

        if (
          discount.maximumDiscount !==
            null &&
          discount.maximumDiscount !==
            undefined
        ) {
          discountAmount =
            Math.min(
              discountAmount,
              discount.maximumDiscount
            );
        }
      } else {
        discountAmount =
          discount.value;
      }

      discountAmount =
        Math.min(
          discountAmount,
          cartSubtotal
        );

      discountAmount =
        Math.round(
          discountAmount * 100
        ) / 100;

      const finalSubtotal =
        Math.max(
          0,
          cartSubtotal -
            discountAmount
        );

      return res.status(200).json({
        success: true,

        message:
          "Coupon applied successfully",

        discount: {
          id: discount._id,
          code: discount.code,
          name: discount.name,
          type: discount.type,
          value: discount.value,
        },

        calculation: {
          subtotal:
            cartSubtotal,

          discountAmount,

          finalSubtotal,
        },
      });
    } catch (error) {
      console.error(
        "Validate discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to validate coupon",
      });
    }
  };