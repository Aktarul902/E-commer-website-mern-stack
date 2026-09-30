
import Wishlist from "../app/models/Wishlist.js";
import Product from "../app/models/Product.js";

/**
 * GET /api/wishlist
 * Get logged-in user's wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user._id,
    })
      .populate("product")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get wishlist",
    });
  }
};

/**
 * POST /api/wishlist/:productId
 * Add product to wishlist
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
        wishlist: existingWishlist,
      });
    }

    const wishlist = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    // Populate product before returning
    await wishlist.populate("product");

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    // Handles MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

/**
 * DELETE /api/wishlist/:productId
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

/**
 * GET /api/wishlist/check/:productId
 * Check whether a product is in wishlist
 */
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    res.status(200).json({
      success: true,
      isWishlisted: Boolean(wishlist),
    });
  } catch (error) {
    console.error("Check wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
    });
  }
};

/**
 * DELETE /api/wishlist
 * Remove all wishlist products
 */
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.deleteMany({
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};

