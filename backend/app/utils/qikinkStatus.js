export const mapQikinkStatus = (status = "") => {
  const normalized = String(status)
    .trim()
    .toLowerCase();

  if (
    normalized.includes("cancel") ||
    normalized.includes("canceled")
  ) {
    return "Cancelled";
  }

  if (
    normalized.includes("return") ||
    normalized.includes("rto")
  ) {
    return "Returned";
  }

  if (
    normalized === "delivered" ||
    normalized.includes("delivered successfully") ||
    normalized.includes("delivery completed") ||
    normalized.includes("delivery complete")
  ) {
    return "Delivered";
  }

  if (
    normalized.includes("out for delivery") ||
    normalized.includes("delivery attempted") ||
    normalized.includes("transit") ||
    normalized.includes("shipped") ||
    normalized.includes("manifest")
  ) {
    return "Shipped";
  }

  if (
    normalized.includes("print") ||
    normalized.includes("live") ||
    normalized.includes("process")
  ) {
    return "Processing";
  }

  return "Pending";
};

export default {
  mapQikinkStatus,
};