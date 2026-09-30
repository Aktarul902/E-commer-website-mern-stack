import mongoose from "mongoose";
// import Cart from "../app/models/Cart.js";
import Cart from '../app/models/Cart.js';
import Product from "../app/models/Product.js";


// =====================================================
// GET CART
// GET /api/cart
// =====================================================

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      select:
        "name slug price images stock variants sku isActive",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get cart",
    });
  }
};


// =====================================================
// ADD TO CART
// POST /api/cart/add
// =====================================================

export const addToCart = async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      variant = {},
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "This product is currently unavailable",
      });
    }

    /*
     * -----------------------------------------------
     * Determine stock
     * -----------------------------------------------
     */

    let availableStock = product.stock;

    let selectedVariant = null;

    if (variant?.sku || variant?.size || variant?.color) {
      selectedVariant = product.variants?.find((item) => {
        const sizeMatch =
          variant.size == null ||
          item.size === variant.size;

        const colorMatch =
          variant.color == null ||
          item.color === variant.color;

        const skuMatch =
          variant.sku == null ||
          item.sku === variant.sku;

        return sizeMatch && colorMatch && skuMatch;
      });

      if (!selectedVariant) {
        return res.status(400).json({
          success: false,
          message: "Selected product variant not found",
        });
      }

      if (selectedVariant.active === false) {
        return res.status(400).json({
          success: false,
          message: "Selected variant is unavailable",
        });
      }

      availableStock = selectedVariant.stock;
    }

    if (availableStock < requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} item(s) available`,
      });
    }

    /*
     * -----------------------------------------------
     * Find/Create cart
     * -----------------------------------------------
     */

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    /*
     * -----------------------------------------------
     * Find same product + same variant
     * -----------------------------------------------
     */

    const existingItem = cart.items.find((item) => {
      if (
        item.product.toString() !== productId.toString()
      ) {
        return false;
      }

      return (
        (item.variant?.size || null) ===
          (variant?.size || null) &&
        (item.variant?.color || null) ===
          (variant?.color || null) &&
        (item.variant?.sku || null) ===
          (variant?.sku || null)
      );
    });

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + requestedQuantity;

      if (newQuantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} item(s) available`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,

        variant: {
          size: variant?.size || null,
          color: variant?.color || null,
          sku:
            selectedVariant?.sku ||
            variant?.sku ||
            null,
          qikinkSku:
            selectedVariant?.qikinkSku ||
            variant?.qikinkSku ||
            null,
        },

        quantity: requestedQuantity,
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name slug price images stock variants sku isActive",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};


// =====================================================
// UPDATE CART ITEM
// PUT /api/cart/:productId
// =====================================================

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      quantity,
      variant = {},
    } = req.body;

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find((cartItem) => {
      if (
        cartItem.product.toString() !== productId.toString()
      ) {
        return false;
      }

      return (
        (cartItem.variant?.size || null) ===
          (variant?.size || null) &&
        (cartItem.variant?.color || null) ===
          (variant?.color || null) &&
        (cartItem.variant?.sku || null) ===
          (variant?.sku || null)
      );
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let availableStock = product.stock;

    if (item.variant?.sku) {
      const selectedVariant = product.variants?.find(
        (variantItem) =>
          variantItem.sku === item.variant.sku
      );

      if (!selectedVariant) {
        return res.status(400).json({
          success: false,
          message: "Product variant no longer exists",
        });
      }

      availableStock = selectedVariant.stock;
    }

    if (newQuantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} item(s) available`,
      });
    }

    item.quantity = newQuantity;

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name slug price images stock variants sku isActive",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};


// =====================================================
// REMOVE CART ITEM
// DELETE /api/cart/:productId
// =====================================================

export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId.toString()
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name slug price images stock variants sku isActive",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product",
    });
  }
};


// =====================================================
// CLEAR CART
// DELETE /api/cart
// =====================================================

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $set: {
          items: [],
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};