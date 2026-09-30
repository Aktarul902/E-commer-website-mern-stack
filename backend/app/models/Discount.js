import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // DISCOUNT TYPE
    // =====================================================

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    // Example:
    // 10% discount
    // or
    // ₹200 discount

    // =====================================================
    // ORDER CONDITIONS
    // =====================================================

    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    // =====================================================
    // USAGE LIMIT
    // =====================================================

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Maximum times one customer can use coupon
    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },

    // =====================================================
    // DATES
    // =====================================================

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    // =====================================================
    // STATUS
    // =====================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =====================================================
    // OPTIONAL PRODUCT / CATEGORY RESTRICTIONS
    // =====================================================

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // =====================================================
    // USAGE RECORDS
    // =====================================================

    usageHistory: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        email: {
          type: String,
          trim: true,
          lowercase: true,
          default: "",
        },

        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          default: null,
        },

        orderId: {
          type: String,
          default: "",
        },

        discountAmount: {
          type: Number,
          default: 0,
        },

        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


// =====================================================
// NORMALIZE CODE
// =====================================================

discountSchema.pre("save", function (next) {
  if (this.code) {
    this.code = this.code.trim().toUpperCase();
  }

  next();
});


// =====================================================
// VALIDATION
// =====================================================

discountSchema.pre("validate", function (next) {
  if (this.type === "percentage") {
    if (this.value > 100) {
      return next(
        new Error(
          "Percentage discount cannot be greater than 100"
        )
      );
    }
  }

  if (this.type === "fixed") {
    if (this.maximumDiscount !== null) {
      this.maximumDiscount = null;
    }
  }

  if (
    this.startDate &&
    this.endDate &&
    this.startDate >= this.endDate
  ) {
    return next(
      new Error(
        "End date must be after start date"
      )
    );
  }

  next();
});


const Discount =
  mongoose.models.Discount ||
  mongoose.model(
    "Discount",
    discountSchema
  );

export default Discount;