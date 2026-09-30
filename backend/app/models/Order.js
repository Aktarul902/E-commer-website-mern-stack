import mongoose from "mongoose";

// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    // Main product SKU
    sku: {
      type: String,
      default: "",
      trim: true,
    },

    // Product variant
    variant: {
      size: {
        type: String,
        default: "",
        trim: true,
      },

      color: {
        type: String,
        default: "",
        trim: true,
      },

      // Variant SKU
      sku: {
        type: String,
        default: "",
        trim: true,
      },

      // Qikink Store SKU
      qikinkSku: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // Price of one item at the time of purchase
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // price × quantity
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// SHIPPING ADDRESS SCHEMA
// ============================================================

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address1: {
      type: String,
      required: true,
      trim: true,
    },

    address2: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    countryCode: {
      type: String,
      default: "IN",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// QIKINK SCHEMA
// ============================================================

const qikinkSchema = new mongoose.Schema(
  {
    // Qikink order ID
    orderId: {
      type: String,
      default: null,
      trim: true,
    },

    // Qikink order number/reference
    orderNumber: {
      type: String,
      default: null,
      trim: true,
    },

    // Qikink fulfillment status
    status: {
      type: String,
      default: null,
      trim: true,
    },

    // Shipping tracking number received from Qikink
    trackingNumber: {
      type: String,
      default: null,
      trim: true,
    },

    // Shipping tracking URL
    trackingUrl: {
      type: String,
      default: null,
      trim: true,
    },

    // Last successful sync with Qikink
    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // Error from Qikink sync
    syncError: {
      type: String,
      default: null,
      trim: true,
    },

    // When Qikink order was created
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// CASHFREE PAYMENT SCHEMA
// ============================================================

const cashfreeSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // Cashfree Order ID
    // Example:
    // CF_PZ-20260929-ABC123
    // --------------------------------------------------------

    orderId: {
      type: String,
      default: null,
      trim: true,
    },

    // --------------------------------------------------------
    // Cashfree Payment Session ID
    //
    // Returned by Cashfree when creating the payment order.
    // Frontend uses this to open Cashfree Checkout.
    // --------------------------------------------------------

    paymentSessionId: {
      type: String,
      default: null,
      trim: true,
    },

    // --------------------------------------------------------
    // Cashfree payment ID
    // --------------------------------------------------------

    paymentId: {
      type: String,
      default: null,
      trim: true,
    },

    // --------------------------------------------------------
    // Cashfree cf_payment_id
    // --------------------------------------------------------

    cfPaymentId: {
      type: String,
      default: null,
      trim: true,
    },

    // --------------------------------------------------------
    // Cashfree payment status
    //
    // Examples:
    // SUCCESS
    // PENDING
    // FAILED
    // --------------------------------------------------------

    paymentStatus: {
      type: String,
      default: null,
      trim: true,
    },

    // --------------------------------------------------------
    // Last time Cashfree payment status was checked
    // --------------------------------------------------------

    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// ORDER SCHEMA
// ============================================================

const orderSchema = new mongoose.Schema(
  {
    // ========================================================
    // USER
    // ========================================================

    // Null for guest orders
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ========================================================
    // PRINTZENZ ORDER ID
    // ========================================================

    // Example:
    // PZ-20260929-A7K92X
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // ========================================================
    // ORDER TYPE
    // ========================================================

    orderType: {
      type: String,
      enum: ["authenticated", "guest"],
      required: true,
    },

    // ========================================================
    // CUSTOMER
    // ========================================================

    customer: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // ========================================================
    // SHIPPING ADDRESS
    // ========================================================

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ========================================================
    // ORDER ITEMS
    // ========================================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },

        message: "Order must contain at least one item.",
      },
    },

    // ========================================================
    // ORDER AMOUNTS
    // ========================================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    paymentMethod: {
      type: String,

      // COD = Cash on Delivery
      // CASHFREE = Online payment through Cashfree
      enum: ["COD", "CASHFREE"],

      required: true,
    },

    // ========================================================
    // PAYMENT STATUS
    // ========================================================

    paymentStatus: {
      type: String,

      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],

      default: "PENDING",
    },

    // ========================================================
    // GENERIC PAYMENT ID
    // ========================================================

    // This can contain the final payment reference.
    //
    // For Cashfree this can be populated after
    // successful payment verification.
    paymentId: {
      type: String,
      default: null,
      trim: true,
    },

    // ========================================================
    // CASHFREE
    // ========================================================

    cashfree: {
      type: cashfreeSchema,
      default: null,
    },

    // ========================================================
    // ORDER STATUS
    // ========================================================

    orderStatus: {
      type: String,

      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
        "Not Returned",
      ],

      default: "Pending",
    },

    // ========================================================
    // SHIPPING TRACKING
    // ========================================================

    trackingNumber: {
      type: String,
      default: null,
      trim: true,
    },

    trackingUrl: {
      type: String,
      default: null,
      trim: true,
    },

    // ========================================================
    // RETURN REQUEST
    // ========================================================

    returnRequest: {
      status: {
        type: String,

        enum: [
          "Requested",
          "Approved",
          "Rejected",
          "Completed",
        ],

        default: null,
      },

      reason: {
        type: String,
        default: "",
        maxlength: 500,
        trim: true,
      },

      requestedAt: {
        type: Date,
        default: null,
      },
    },

    // ========================================================
    // GUEST ORDER TRACKING TOKEN
    // ========================================================

    // Used by guest customers to track their order.
    trackingToken: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    // ========================================================
    // QIKINK
    // ========================================================

    qikink: {
      type: qikinkSchema,
      default: null,
    },

    // ========================================================
    // NOTES
    // ========================================================

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // CANCELLED AT
    // ========================================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    returnDecisionReason: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    // ========================================================
    // DELIVERED AT
    // ========================================================

    deliveredAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ============================================================
// EXPORT ORDER MODEL
// ============================================================
//
// Using mongoose.models.Order prevents:
// "OverwriteModelError: Cannot overwrite `Order` model once
// compiled."
// ============================================================

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;