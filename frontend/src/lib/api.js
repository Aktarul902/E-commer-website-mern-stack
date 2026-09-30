
const API_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

// ============================
// SIGNUP
// ============================

export const signupUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

// ============================
// LOGIN
// ============================

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// ============================
// GOOGLE LOGIN
// ============================

export const googleLogin = async ({ credential }) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ credential }),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Google login endpoint returned ${response.status}. Check VITE_API_URL and restart the backend.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Google login failed");
  }

  return data;
};

// ============================
// CURRENT USER
// ============================
import { axiosinstance } from "./axios";

export const getCurrentUser = async () => {
     try {
           const res = await axiosinstance.get(`${API_URL}/auth/me`)

           return res.data
          
     } catch (error) {
             console.log("Error in getAuthUser:", error);
    return null;
     }
       }

// ============================
// LOGOUT
// ============================

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",

    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
};
export const updateProfile = async (profileData) => {
  const response = await axiosinstance.patch(
    `${API_URL}/auth/profile`,
    profileData
  );

  return response.data;
};
export const forgotPassword = async (email) => {
  const response = await fetch(
    `${API_URL}/auth/forgot-password`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        email,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to send verification code."
    );
  }

  return data;
};

// ============================================================
// VERIFY RESET CODE
// ============================================================

export const verifyResetCode = async ({
  email,
  code,
}) => {
  const response = await fetch(
    `${API_URL}/auth/verify-reset-code`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        email,
        code,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to verify the code."
    );
  }

  return data;
};

// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = async ({
  resetToken,
  password,
  confirmPassword,
}) => {
  const response = await fetch(
    `${API_URL}/auth/reset-password`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        resetToken,
        password,
        confirmPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to reset password."
    );
  }

  return data;
};