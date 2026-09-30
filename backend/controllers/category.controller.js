import Category from "../app/models/Category.js";
import Product from "../app/models/Product.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => ({
        ...category,
        productCount: await Product.countDocuments({
          category: category.name,
        }),
      }))
    );

    return res.status(200).json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image, active } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      image: typeof image === "string" ? image.trim() : "",
      active: active !== false,
    });

    return res.status(201).json({
      success: true,
      category: { ...category.toObject(), productCount: 0 },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { name, description, image, active } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = typeof description === "string" ? description.trim() : "";
    }
    if (image !== undefined) {
      category.image = typeof image === "string" ? image.trim() : "";
    }
    if (typeof active === "boolean") {
      category.active = active;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        productCount: await Product.countDocuments({ category: category.name }),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};