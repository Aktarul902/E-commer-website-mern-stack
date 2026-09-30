import Order from "../app/models/Order.js";
import Address from "../app/models/Address.js";
import User from "../app/models/User.js";

export const getAdminCustomers = async (req, res) => {
  try {
    const [users, orderGroups] = await Promise.all([
      User.find({ role: "user" })
        .select("firstName lastName email createdAt")
        .lean(),
      Order.aggregate([
        {
          $addFields: {
            customerEmail: {
              $toLower: {
                $trim: {
                  input: { $ifNull: ["$customer.email", ""] },
                },
              },
            },
          },
        },
        { $match: { customerEmail: { $ne: "" } } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$customerEmail",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: { $ifNull: ["$totalAmount", 0] } },
            lastOrderAt: { $max: "$createdAt" },
            firstName: { $last: "$customer.firstName" },
            lastName: { $last: "$customer.lastName" },
            phone: { $last: "$customer.phone" },
          },
        },
      ]),
    ]);

    const ordersByEmail = new Map(
      orderGroups.map((group) => [group._id, group])
    );
    const registeredEmails = new Set();

    const customers = users.map((user) => {
      const email = user.email.trim().toLowerCase();
      registeredEmails.add(email);
      const orderData = ordersByEmail.get(email);

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: orderData?.phone || "",
        createdAt: user.createdAt,
        orderCount: orderData?.orderCount || 0,
        totalSpent: orderData?.totalSpent || 0,
        lastOrderAt: orderData?.lastOrderAt || null,
      };
    });

    for (const orderData of orderGroups) {
      if (registeredEmails.has(orderData._id)) {
        continue;
      }

      customers.push({
        _id: `guest-${orderData._id}`,
        firstName: orderData.firstName || "Guest",
        lastName: orderData.lastName || "Customer",
        email: orderData._id,
        phone: orderData.phone || "",
        createdAt: orderData.lastOrderAt,
        orderCount: orderData.orderCount,
        totalSpent: orderData.totalSpent,
        lastOrderAt: orderData.lastOrderAt,
      });
    }

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get admin customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get customers",
    });
  }
};

export const getAdminCustomer = async (req, res) => {
  try {
    const email = String(req.params.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
    }

    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const emailPattern = new RegExp(`^${escapedEmail}$`, "i");
    const [user, orders] = await Promise.all([
      User.findOne({ email }).select("firstName lastName email createdAt").lean(),
      Order.find({ "customer.email": emailPattern })
        .select("-trackingToken")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!user && orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const addresses = user
      ? await Address.find({ user: user._id }).sort({ isDefault: -1, createdAt: -1 }).lean()
      : [];
    const latestOrder = orders[0];
    const orderCustomer = latestOrder?.customer || {};
    const totalSpent = orders.reduce(
      (total, order) => total + Number(order.totalAmount || 0),
      0
    );

    const customer = {
      _id: user?._id || `guest-${email}`,
      firstName: user?.firstName || orderCustomer.firstName || "Guest",
      lastName: user?.lastName || orderCustomer.lastName || "Customer",
      email: user?.email || orderCustomer.email || email,
      phone: orderCustomer.phone || latestOrder?.shippingAddress?.phone || "",
      createdAt: user?.createdAt || orders[orders.length - 1]?.createdAt || null,
      orderCount: orders.length,
      totalSpent,
      lastOrderAt: latestOrder?.createdAt || null,
      orders,
      addresses,
    };

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get admin customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get customer",
    });
  }
};