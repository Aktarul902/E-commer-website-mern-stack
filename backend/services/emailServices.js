import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async ({
  email,
  firstName,
  code,
}) => {
  const from =
    process.env.EMAIL_FROM ||
    `Printzenz <${process.env.EMAIL_USER}>`;

  const mailOptions = {
    from,
    to: email,
    subject: `${code} - Printzenz verification code`,

    text: `Hello ${firstName || "Customer"},

Your Printzenz verification code is:

${code}

This code expires in 10 minutes.

If you did not request a password reset, you can ignore this email.

Printzenz`,
  };

  const result = await transporter.sendMail(mailOptions);

  console.log("Password reset email sent:", {
    to: email,
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  });

  return result;
};

export const sendOrderEmails = async ({ order, adminEmail }) => {
  const from =
    process.env.EMAIL_FROM ||
    `Printzenz <${process.env.EMAIL_USER}>`;

  const customerName = [
    order.customer.firstName,
    order.customer.lastName,
  ].filter(Boolean).join(" ");

  const itemLines = order.items.map((item) => {
    const variant = [item.variant?.size, item.variant?.color]
      .filter(Boolean)
      .join(" / ");
    const description = variant ? `${item.name} (${variant})` : item.name;

    return `- ${description} x ${item.quantity}: ₹${item.subtotal.toLocaleString("en-IN")}`;
  });

  const address = order.shippingAddress;
  const shippingLines = [
    `${address.firstName} ${address.lastName}`.trim(),
    address.phone,
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.pincode}`,
    address.country,
  ].filter(Boolean);

  const orderDetails = [
    `Order ID: ${order.orderId}`,
    `Customer: ${customerName}`,
    `Email: ${order.customer.email || address.email}`,
    `Phone: ${order.customer.phone}`,
    "",
    "Items:",
    ...itemLines,
    "",
    `Subtotal: ₹${order.subtotal.toLocaleString("en-IN")}`,
    `Shipping: ₹${order.shippingCharge.toLocaleString("en-IN")}`,
    `Discount: ₹${order.discount.toLocaleString("en-IN")}`,
    `Total: ₹${order.totalAmount.toLocaleString("en-IN")}`,
    `Payment method: ${order.paymentMethod}`,
    `Payment status: ${order.paymentStatus}`,
    "",
    "Shipping address:",
    ...shippingLines,
  ].join("\n");

  const messages = [
    {
      to: order.customer.email || address.email,
      subject: `Order confirmed: ${order.orderId}`,
      text: `Hello ${customerName || "Customer"},\n\nThank you for your order. Here are your order details:\n\n${orderDetails}\n\nPrintzenz`,
    },
    {
      to: adminEmail,
      subject: `New order received: ${order.orderId}`,
      text: `A new order has been placed.\n\n${orderDetails}\n`,
    },
  ].filter((message) => message.to);

  const results = await Promise.allSettled(
    messages.map((message) =>
      transporter.sendMail({ from, ...message })
    )
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Order email failed for ${messages[index].to}:`, result.reason);
    }
  });
};

const sendCustomerOrderUpdateEmail = async ({ order, subject, text }) => {
  const email = order.customer?.email || order.shippingAddress?.email;
  if (!email) return;

  const from =
    process.env.EMAIL_FROM ||
    `Printzenz <${process.env.EMAIL_USER}>`;

  try {
    const result = await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
    });

    console.log("Order update email sent:", {
      to: email,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error(`Order update email failed for ${email}:`, error);
  }
};

export const sendTrackingUpdateEmail = async ({ order }) => {
  const customerName = order.customer?.firstName || "Customer";
  const trackingDetails = [
    `Order ID: ${order.orderId}`,
    `Tracking number: ${order.trackingNumber}`,
    order.trackingUrl ? `Tracking URL: ${order.trackingUrl}` : null,
  ].filter(Boolean).join("\n");

  await sendCustomerOrderUpdateEmail({
    order,
    subject: `Your order has shipped: ${order.orderId}`,
    text: `Hello ${customerName},\n\nYour order tracking information is available:\n\n${trackingDetails}\n\nPrintzenz`,
  });
};

export const sendOrderDeliveredEmail = async ({ order }) => {
  const customerName = order.customer?.firstName || "Customer";

  await sendCustomerOrderUpdateEmail({
    order,
    subject: `Your order was delivered: ${order.orderId}`,
    text: `Hello ${customerName},\n\nOur records show that your order ${order.orderId} has been delivered.\n\nThank you for shopping with Printzenz.`,
  });
};

export const sendOrderCancelledEmail = async ({ order, reason }) => {
  const customerName = order.customer?.firstName || "Customer";
  const reasonLine = reason ? `\n\nReason: ${reason}` : "";

  await sendCustomerOrderUpdateEmail({
    order,
    subject: `Your order has been cancelled: ${order.orderId}`,
    text: `Hello ${customerName},\n\nYour order ${order.orderId} has been cancelled.${reasonLine}\n\nPlease contact Printzenz support if you have any questions.`,
  });
};

export const sendOrderReturnedEmail = async ({ order }) => {
  const customerName = order.customer?.firstName || "Customer";

  await sendCustomerOrderUpdateEmail({
    order,
    subject: `Your order has been returned: ${order.orderId}`,
    text: `Hello ${customerName},\n\nYour order ${order.orderId} has been returned.\n\nPlease contact Printzenz support if you have any questions.`,
  });
};

export const sendOrderNotReturnedEmail = async ({ order, reason }) => {
  const customerName = order.customer?.firstName || "Customer";

  await sendCustomerOrderUpdateEmail({
    order,
    subject: `Return update for order ${order.orderId}`,
    text: `Hello ${customerName},\n\nYour order ${order.orderId} has not been returned.${reason ? `\n\nReason: ${reason}` : ""}\n\nPlease contact Printzenz support if you have any questions.`,
  });
};

export const sendReturnRequestAdminEmail = async ({ order, adminEmail }) => {
  if (!adminEmail) return;

  const from =
    process.env.EMAIL_FROM ||
    `Printzenz <${process.env.EMAIL_USER}>`;
  const customerName = [
    order.customer?.firstName,
    order.customer?.lastName,
  ].filter(Boolean).join(" ") || "Customer";
  const reason = order.returnRequest?.reason || "No reason provided";
  const requestedAt = order.returnRequest?.requestedAt
    ? new Date(order.returnRequest.requestedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : "Not specified";

  try {
    const result = await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `Return request received: ${order.orderId}`,
      text: `A customer has requested a return.\n\nOrder ID: ${order.orderId}\nCustomer: ${customerName}\nCustomer email: ${order.customer?.email || order.shippingAddress?.email || "Not provided"}\nReturn reason: ${reason}\nRequested at: ${requestedAt}\nOrder total: ₹${Number(order.totalAmount || 0).toLocaleString("en-IN")}\n\nReview this request in the admin order details page.`,
    });

    console.log("Return request admin email sent:", {
      to: adminEmail,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error(`Return request admin email failed for ${adminEmail}:`, error);
  }
};

export const verifyEmailTransporter = async () => {
  await transporter.verify();
  return true;
};