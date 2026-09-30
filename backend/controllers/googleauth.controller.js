import { OAuth2Client } from "google-auth-library";
import User from "../app/models/User.js";
import jwt from "jsonwebtoken";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured on the server. Set GOOGLE_CLIENT_ID to the frontend Google client ID.",
      });
    }

    // --------------------------------------------------
    // Verify Google ID token
    // --------------------------------------------------

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const {
      sub: googleId,
      email,
      email_verified: emailVerified,
      given_name: firstName,
      family_name: lastName,
      picture,
    } = payload;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: "Google account information is incomplete",
      });
    }

    if (!emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // --------------------------------------------------
    // Find existing user
    // --------------------------------------------------

    let user = await User.findOne({
      $or: [
        { googleId },
        { email: normalizedEmail },
      ],
    });

    // --------------------------------------------------
    // Existing user
    // --------------------------------------------------

    if (user) {
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Your account has been disabled",
        });
      }

      // Link Google to an existing email/password account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.authProvider) {
        user.authProvider = "google";
      }

      // Optional profile update
      if (picture && !user.avatar) {
        user.avatar = picture;
      }

      await user.save();
    }

    // --------------------------------------------------
    // New user
    // --------------------------------------------------

    if (!user) {
      user = await User.create({
        firstName: firstName || normalizedEmail.split("@")[0],
        lastName: lastName || "User",
        email: normalizedEmail,

        googleId,
        authProvider: "google",

        avatar: picture || "",

        role: "customer",
        isActive: true,
      });
    }

    // --------------------------------------------------
    // Create Printzenz JWT
    // --------------------------------------------------

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // --------------------------------------------------
    // Set same cookie used by normal login
    // --------------------------------------------------

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};