const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";

export const getAdminNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications/admin`, {
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load notifications");
  }

  return data;
};

export const markAdminNotificationRead = async (notificationId) => {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    { method: "PATCH", credentials: "include" }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update notification");
  }

  return data;
};

export const createAdmin = async (adminData) => {
  const response = await fetch(
    `${API_URL}/admin/create-admin`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify(adminData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create admin"
    );
  }

  return data;
};