import Product from "../app/models/Product.js";



const createSlug = (value) => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      category,
      subcategory,
      price,
      compareAtPrice,
      costPrice,
      stock,
      images,
      variants,
      qikinkProductId,
      qikinkSku,
      source,
      isActive,
      isFeatured,
      isNewArrival,
      isSale,
      tags,
    } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid product price is required",
      });
    }

    /* =====================================================
       SLUG
    ===================================================== */

    let finalSlug = slug
      ? createSlug(slug)
      : createSlug(name);

    const existingProduct = await Product.findOne({
      slug: finalSlug,
    });

    if (existingProduct) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    /* =====================================================
       VARIANTS
    ===================================================== */

    let formattedVariants = [];

    if (Array.isArray(variants)) {
      formattedVariants = variants.map((variant) => ({
        size: String(variant?.size || "").trim(),

        color: String(variant?.color || "").trim(),

        sku: String(variant?.sku || "").trim(),

        qikinkSku: String(
          variant?.qikinkSku || ""
        ).trim(),

        price:
          variant?.price !== undefined &&
          variant?.price !== ""
            ? Number(variant.price)
            : 0,

        stock:
          variant?.stock !== undefined &&
          variant?.stock !== ""
            ? Number(variant.stock)
            : 0,

        active:
          variant?.active !== undefined
            ? Boolean(variant.active)
            : true,
      }));
    }

    /* =====================================================
       PRODUCT
    ===================================================== */

    const product = await Product.create({
      name: String(name).trim(),

      slug: finalSlug,

      description:
        String(description || "").trim(),

      shortDescription:
        String(shortDescription || "").trim(),

      category:
        String(category).trim(),

      subcategory:
        String(subcategory || "").trim(),

      price: Number(price),

      compareAtPrice:
        compareAtPrice !== undefined
          ? Number(compareAtPrice) || 0
          : 0,

      costPrice:
        costPrice !== undefined
          ? Number(costPrice) || 0
          : 0,

      stock:
        stock !== undefined
          ? Number(stock) || 0
          : 0,

      images: Array.isArray(images)
        ? images.filter(
            (image) =>
              typeof image === "string" &&
              image.trim()
          )
        : [],

      variants: formattedVariants,

      qikinkProductId:
        String(qikinkProductId || "").trim(),

      qikinkSku:
        String(qikinkSku || "").trim(),

      source:
        source === "qikink"
          ? "qikink"
          : "manual",

      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : true,

      isFeatured:
        Boolean(isFeatured),

      isNewArrival:
        Boolean(isNewArrival),

      isSale:
        Boolean(isSale),

      tags: Array.isArray(tags)
        ? tags
            .map((tag) => String(tag).trim())
            .filter(Boolean)
        : [],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {

    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    /* Duplicate slug */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this slug already exists.",
      });
    }

    /* Mongoose validation */

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create product",
    });
  }
};
// ------------------------------------
// GET ALL PRODUCTS - ADMIN
// ------------------------------------

export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get admin products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ------------------------------------
// GET ALL PRODUCTS - PUBLIC
// ------------------------------------

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ------------------------------------
// GET SINGLE PRODUCT
// ------------------------------------

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// ------------------------------------
// CREATE OR UPDATE PRODUCT REVIEW
// ------------------------------------

export const submitProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const numericRating = Number(rating);
    const reviewComment = typeof comment === "string" ? comment.trim() : "";

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!reviewComment) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const userId = req.user._id;
    const reviewerName = [req.user.firstName, req.user.lastName]
      .filter(Boolean)
      .join(" ") || "Customer";
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      existingReview.name = reviewerName;
      existingReview.rating = numericRating;
      existingReview.title = typeof title === "string" ? title.trim().slice(0, 100) : "";
      existingReview.comment = reviewComment.slice(0, 2000);
    } else {
      product.reviews.push({
        user: userId,
        name: reviewerName,
        rating: numericRating,
        title: typeof title === "string" ? title.trim().slice(0, 100) : "",
        comment: reviewComment.slice(0, 2000),
      });
    }

    product.numReviews = product.reviews.length;
    product.rating = Number(
      (product.reviews.reduce((total, review) => total + review.rating, 0) /
        product.numReviews).toFixed(1)
    );

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review saved successfully",
      product,
    });
  } catch (error) {
    console.error("Submit product review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save review",
    });
  }
};

// ------------------------------------
// UPDATE PRODUCT
// ------------------------------------





export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // =========================================================
    // FIND PRODUCT
    // =========================================================

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =========================================================
    // REQUEST DATA
    // =========================================================

    const {
      name,
      description,
      shortDescription,
      category,
      subcategory,

      price,
      compareAtPrice,
      costPrice,

      stock,

      images,
      variants,

      qikinkProductId,
      qikinkSku,

      source,

      isActive,
      isFeatured,
      isNewArrival,
      isSale,

      tags,
    } = req.body;

    // =========================================================
    // BASIC PRODUCT INFORMATION
    // =========================================================

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      product.name = cleanName;
    }

    if (description !== undefined) {
      product.description = String(description).trim();
    }

    if (shortDescription !== undefined) {
      product.shortDescription = String(shortDescription).trim();
    }

    if (category !== undefined) {
      const cleanCategory = String(category).trim();

      if (!cleanCategory) {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      product.category = cleanCategory;
    }

    if (subcategory !== undefined) {
      product.subcategory = String(subcategory).trim();
    }

    // =========================================================
    // PRICING
    // =========================================================

    if (price !== undefined) {
      const newPrice = Number(price);

      if (!Number.isFinite(newPrice) || newPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid number greater than or equal to 0",
        });
      }

      product.price = newPrice;
    }

    if (compareAtPrice !== undefined) {
      const newCompareAtPrice =
        compareAtPrice === "" || compareAtPrice === null
          ? 0
          : Number(compareAtPrice);

      if (
        !Number.isFinite(newCompareAtPrice) ||
        newCompareAtPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Compare-at price must be a valid number greater than or equal to 0",
        });
      }

      product.compareAtPrice = newCompareAtPrice;
    }

    if (costPrice !== undefined) {
      const newCostPrice =
        costPrice === "" || costPrice === null
          ? 0
          : Number(costPrice);

      if (!Number.isFinite(newCostPrice) || newCostPrice < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cost price must be a valid number greater than or equal to 0",
        });
      }

      product.costPrice = newCostPrice;
    }

    // =========================================================
    // STOCK
    // =========================================================

    if (stock !== undefined) {
      const newStock =
        stock === "" || stock === null
          ? 0
          : Number(stock);

      if (!Number.isFinite(newStock) || newStock < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Stock must be a valid number greater than or equal to 0",
        });
      }

      product.stock = newStock;
    }

    // =========================================================
    // IMAGES
    // =========================================================
    //
    // IMPORTANT:
    // The order received here is preserved exactly.
    //
    // Example:
    //
    // [
    //   "image-3.jpg",
    //   "image-1.jpg",
    //   "image-2.jpg"
    // ]
    //
    // The first image becomes the first image in MongoDB.
    // Your frontend can therefore use images[0] as the
    // primary product image.
    // =========================================================

    if (Array.isArray(images)) {
      const cleanImages = images
        .filter(
          (image) =>
            typeof image === "string" &&
            image.trim().length > 0
        )
        .map((image) => image.trim());

      product.images = cleanImages;
    }

    // =========================================================
    // VARIANTS
    // =========================================================

    if (Array.isArray(variants)) {
      const normalizedVariants = [];

      const skuSet = new Set();
      const combinationSet = new Set();

      for (let index = 0; index < variants.length; index++) {
        const variant = variants[index];

        // -----------------------------------------------------
        // VALIDATE VARIANT OBJECT
        // -----------------------------------------------------

        if (!variant || typeof variant !== "object") {
          return res.status(400).json({
            success: false,
            message: `Invalid variant at position ${index + 1}`,
          });
        }

        // -----------------------------------------------------
        // BASIC VALUES
        // -----------------------------------------------------

        const size = String(variant.size || "").trim();

        const color = String(variant.color || "").trim();

        const sku = String(variant.sku || "").trim();

        const qikinkVariantSku = String(
          variant.qikinkSku || ""
        ).trim();

        const variantPrice =
          variant.price === "" ||
          variant.price === null ||
          variant.price === undefined
            ? 0
            : Number(variant.price);

        const variantStock =
          variant.stock === "" ||
          variant.stock === null ||
          variant.stock === undefined
            ? 0
            : Number(variant.stock);

        const active =
          typeof variant.active === "boolean"
            ? variant.active
            : true;

        // -----------------------------------------------------
        // SIZE / COLOR VALIDATION
        // -----------------------------------------------------

        if (!size && !color) {
          return res.status(400).json({
            success: false,
            message: `Variant ${
              index + 1
            } must have a size or color`,
          });
        }

        // -----------------------------------------------------
        // PRICE VALIDATION
        // -----------------------------------------------------

        if (
          !Number.isFinite(variantPrice) ||
          variantPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid price for variant ${
              index + 1
            }`,
          });
        }

        // -----------------------------------------------------
        // STOCK VALIDATION
        // -----------------------------------------------------

        if (
          !Number.isFinite(variantStock) ||
          variantStock < 0
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid stock for variant ${
              index + 1
            }`,
          });
        }

        // -----------------------------------------------------
        // DUPLICATE SKU
        // -----------------------------------------------------

        if (sku) {
          const normalizedSku = sku.toLowerCase();

          if (skuSet.has(normalizedSku)) {
            return res.status(400).json({
              success: false,
              message: `Duplicate SKU "${sku}"`,
            });
          }

          skuSet.add(normalizedSku);
        }

        // -----------------------------------------------------
        // DUPLICATE SIZE + COLOR
        // -----------------------------------------------------

        const combination =
          `${size.toLowerCase()}__${color.toLowerCase()}`;

        if (combinationSet.has(combination)) {
          return res.status(400).json({
            success: false,
            message: `Duplicate variant: ${
              size || ""
            }${color ? ` / ${color}` : ""}`,
          });
        }

        combinationSet.add(combination);

        // -----------------------------------------------------
        // PRESERVE EXISTING VARIANT ID
        // -----------------------------------------------------

        const normalizedVariant = {
          size,
          color,
          sku,
          qikinkSku: qikinkVariantSku,
          price: variantPrice,
          stock: variantStock,
          active,
        };

        // Preserve MongoDB subdocument _id when editing
        if (variant._id) {
          normalizedVariant._id = variant._id;
        }

        normalizedVariants.push(normalizedVariant);
      }

      // This also allows [] to intentionally remove all variants.
      product.variants = normalizedVariants;
    }

    // =========================================================
    // QIKINK
    // =========================================================

    if (qikinkProductId !== undefined) {
      product.qikinkProductId = String(
        qikinkProductId
      ).trim();
    }

    if (qikinkSku !== undefined) {
      product.qikinkSku = String(qikinkSku).trim();
    }

    // =========================================================
    // SOURCE
    // =========================================================

    if (source !== undefined) {
      if (!["manual", "qikink"].includes(source)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product source",
        });
      }

      product.source = source;
    }

    // =========================================================
    // PRODUCT STATUS
    // =========================================================

    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    if (isNewArrival !== undefined) {
      product.isNewArrival = Boolean(isNewArrival);
    }

    if (isSale !== undefined) {
      product.isSale = Boolean(isSale);
    }

    // =========================================================
    // TAGS
    // =========================================================

    if (Array.isArray(tags)) {
      product.tags = tags
        .map((tag) => String(tag).trim())
        .filter(Boolean);
    }

    // =========================================================
    // SAVE PRODUCT
    // =========================================================

    const updatedProduct = await product.save();

    // =========================================================
    // SUCCESS RESPONSE
    // =========================================================

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};
// ------------------------------------
// DELETE PRODUCT
// ------------------------------------

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
