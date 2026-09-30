import bcrypt from "bcryptjs";
import User from "../app/models/User.js";

/**
 * CREATE ADMIN
 * Only an existing admin can create another admin.
 */
export const createAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (!firstName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!lastName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Last name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // -----------------------------------------
    // Validate password
    // -----------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // -----------------------------------------
    // Normalize email
    // -----------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------------
    // Check existing user
    // -----------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // -----------------------------------------
    // Hash password
    // -----------------------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // -----------------------------------------
    // Create admin
    // -----------------------------------------

    const adminUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    // Handle MongoDB duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};