import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router";

import {
  ArrowLeft,
  ImagePlus,
  Package,
  DollarSign,
  Tags,
  Layers3,
  Settings2,
  CheckCircle2,
  X,
  Plus,
  Sparkles,
  Save,
  Eye,
  Trash2,
  Upload,
  Palette,
  Ruler,
} from "lucide-react";

import { createProduct } from "../../lib/productapi";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    category: "",
    subcategory: "",
    brand: "Printzenz",

    quantity: "0",

    status: "active",

    isFeatured: false,
    isNewArrival: false,
    isSale: false,

    trackInventory: true,
    allowBackorder: false,

    tags: [],
  });

  const [variants, setVariants] = useState([]);

  const [images, setImages] = useState([]);

  const [tagInput, setTagInput] = useState("");

  const [saving, setSaving] = useState(false);

  const [uploadingImages, setUploadingImages] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const categories = [
    "T-Shirts",
    "Hoodies",
    "Oversized T-Shirts",
    "Sweatshirts",
    "Shirts",
    "Tops",
    "Dresses",
    "Bottomwear",
    "Kids",
    "Accessories",
    "Home Decor",
    "Bags",
    "Drinkware",
    "Other",
  ];

  /* =========================================================
     CLEANUP IMAGE PREVIEWS
  ========================================================= */

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  /* =========================================================
     BASIC FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setError("");

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not a valid image.`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is larger than 10MB.`);
        return false;
      }

      return true;
    });

    const imagePreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      cloudinaryUrl: "",
    }));

    setImages((prev) => [...prev, ...imagePreviews]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];

      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview);
      }

      updated.splice(index, 1);

      return updated;
    });
  };

  /* =========================================================
     TAGS
  ========================================================= */

  const addTag = () => {
    const tag = tagInput.trim();

    if (!tag) return;

    if (
      formData.tags.some(
        (existingTag) =>
          existingTag.toLowerCase() === tag.toLowerCase()
      )
    ) {
      setTagInput("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));

    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  /* =========================================================
     VARIANTS
  ========================================================= */

  const createEmptyVariant = () => ({
    size: "",
    color: "",
    sku: "",
    qikinkSku: "",
    price: "",
    stock: "0",
    active: true,
  });

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (index) => {
    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index)
    );
  };

  const updateVariant = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  };

  /* =========================================================
     CLOUDINARY
  ========================================================= */

  const uploadProductImages = async () => {
    if (!images.length) {
      return [];
    }

    setUploadingImages(true);
    setUploadProgress(0);

    const uploadedUrls = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const cloudinaryUrl =
          await uploadImageToCloudinary(image.file);

        uploadedUrls.push(cloudinaryUrl);

        setImages((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  cloudinaryUrl,
                }
              : item
          )
        );

        const progress = Math.round(
          ((i + 1) / images.length) * 100
        );

        setUploadProgress(progress);
      }

      return uploadedUrls;
    } finally {
      setUploadingImages(false);
    }
  };

  /* =========================================================
     SLUG
  ========================================================= */

  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (!formData.category) {
      setError("Please select a product category.");
      return;
    }

    /* -------------------------------------------------------
       Validate variants
    ------------------------------------------------------- */

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      if (!variant.size.trim() && !variant.color.trim()) {
        setError(
          `Variant ${i + 1}: please enter a size or color.`
        );
        return;
      }

      if (
        variant.price !== "" &&
        Number(variant.price) < 0
      ) {
        setError(
          `Variant ${i + 1}: price cannot be negative.`
        );
        return;
      }

      if (
        variant.stock !== "" &&
        Number(variant.stock) < 0
      ) {
        setError(
          `Variant ${i + 1}: stock cannot be negative.`
        );
        return;
      }
    }

    /* -------------------------------------------------------
       Check duplicate variants
    ------------------------------------------------------- */

    const variantKeys = variants
      .map(
        (variant) =>
          `${variant.size.trim().toLowerCase()}|${variant.color
            .trim()
            .toLowerCase()}`
      )
      .filter((key) => key !== "|");

    const uniqueVariantKeys = new Set(variantKeys);

    if (uniqueVariantKeys.size !== variantKeys.length) {
      setError(
        "Duplicate variants found. Please use a unique Size + Color combination."
      );
      return;
    }

    try {
      setSaving(true);

      /* -----------------------------------------------------
         STEP 1
         Upload images to Cloudinary
      ----------------------------------------------------- */

      const imageUrls = await uploadProductImages();

      /* -----------------------------------------------------
         STEP 2
         Prepare variants
      ----------------------------------------------------- */

      const formattedVariants = variants.map((variant) => ({
        size: variant.size.trim(),
        color: variant.color.trim(),
        sku: variant.sku.trim(),
        qikinkSku: variant.qikinkSku.trim(),
        price:
          variant.price !== ""
            ? Number(variant.price)
            : 0,
        stock:
          variant.stock !== ""
            ? Number(variant.stock)
            : 0,
        active: Boolean(variant.active),
      }));

      /* -----------------------------------------------------
         STEP 3
         Prepare product
      ----------------------------------------------------- */

      const productData = {
        name: formData.name.trim(),

        slug: createSlug(formData.name),

        description: formData.description.trim(),

        shortDescription: "",

        category: formData.category,

        subcategory: formData.subcategory.trim(),

        price: Number(formData.price),

        compareAtPrice: formData.compareAtPrice
          ? Number(formData.compareAtPrice)
          : 0,

        costPrice: formData.costPrice
          ? Number(formData.costPrice)
          : 0,

        stock: Number(formData.quantity) || 0,

        images: imageUrls,

        variants: formattedVariants,

        qikinkProductId: "",

        qikinkSku: "",

        source: "manual",

        isActive: formData.status === "active",

        isFeatured: Boolean(formData.isFeatured),

        isNewArrival: Boolean(formData.isNewArrival),

        isSale: Boolean(formData.isSale),

        tags: formData.tags,
      };

      console.log(
        "CREATE PRODUCT PAYLOAD:",
        productData
      );

      /* -----------------------------------------------------
         STEP 4
         Create product
      ----------------------------------------------------- */

      await createProduct(productData);

      setSuccess("Product created successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (err) {
      console.error("Create product error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create product."
      );
    } finally {
      setSaving(false);
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1500px] mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">

          <div className="flex items-center gap-4">

            <Link
              to="/admin/products"
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Products
                </span>

                <span className="text-gray-300">
                  /
                </span>

                <span className="text-sm font-semibold">
                  Add product
                </span>
              </div>

              <h1 className="text-xl font-black mt-0.5">
                Create New Product
              </h1>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <Link
              to="/admin/products"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </Link>

            <button
              form="product-form"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white text-sm font-bold shadow-lg shadow-fuchsia-200 hover:shadow-xl transition disabled:opacity-60"
            >
              <Save size={17} />

              {uploadingImages
                ? `Uploading ${uploadProgress}%`
                : saving
                ? "Saving..."
                : "Save Product"}
            </button>

          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-[1500px] mx-auto px-5 lg:px-8 py-8">

        {/* ALERT */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
            <X size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 flex items-center gap-3">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* UPLOAD PROGRESS */}

        {uploadingImages && (
          <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4">

            <div className="flex items-center justify-between mb-2">

              <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
                <Upload size={17} />
                Uploading images to Cloudinary...
              </div>

              <span className="text-sm font-bold text-violet-700">
                {uploadProgress}%
              </span>

            </div>

            <div className="h-2 rounded-full bg-violet-100 overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 transition-all duration-300"
                style={{
                  width: `${uploadProgress}%`,
                }}
              />

            </div>
          </div>
        )}

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_370px] gap-6"
        >

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-6">

            {/* PRODUCT INFORMATION */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <SectionHeader
                icon={<Sparkles size={19} />}
                title="Product information"
                description="Give your product a clear name and description."
                color="violet"
              />

              <div className="p-6 space-y-5">

                <InputField
                  label="Product name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Oversized Graphic T-Shirt"
                  required
                />

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={7}
                    placeholder="Describe the product, material, fit, design and other important details..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none resize-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    A detailed description helps customers understand your product.
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                MEDIA
            ================================================= */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <SectionHeader
                icon={<ImagePlus size={19} />}
                title="Product media"
                description="Images are securely uploaded to Cloudinary."
                color="pink"
              />

              <div className="p-6">

                <label
                  htmlFor="product-images"
                  className="relative block border-2 border-dashed border-violet-200 rounded-[22px] bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-10 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition"
                >

                  <input
                    id="product-images"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-md flex items-center justify-center text-violet-600">
                    <ImagePlus size={28} />
                  </div>

                  <h3 className="font-bold mt-4">
                    Upload product images
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG or WEBP · Maximum 10MB per image
                  </p>

                  <span className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold">
                    <Plus size={16} />
                    Choose images
                  </span>

                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">

                    {images.map((image, index) => (

                      <div
                        key={`${image.preview}-${index}`}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border border-gray-100"
                      >

                        <img
                          src={image.preview}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={saving}
                          className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 backdrop-blur text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>

                        {image.cloudinaryUrl && (
                          <span className="absolute top-2 left-2 bg-emerald-500 text-white rounded-lg px-2 py-1 text-[10px] font-bold">
                            UPLOADED
                          </span>
                        )}

                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-gray-900/80 text-white rounded-lg px-2 py-1 text-[10px] font-bold">
                            MAIN IMAGE
                          </span>
                        )}

                      </div>

                    ))}

                  </div>
                )}

              </div>
            </section>

            {/* =================================================
                PRICING
            ================================================= */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <SectionHeader
                icon={<DollarSign size={19} />}
                title="Pricing"
                description="Set your selling price and compare-at price."
                color="emerald"
              />

              <div className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  <InputField
                    label="Selling price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="699"
                    prefix="₹"
                    type="number"
                    required
                  />

                  <InputField
                    label="Compare-at price"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    placeholder="999"
                    prefix="₹"
                    type="number"
                  />

                  <InputField
                    label="Cost per item"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="300"
                    prefix="₹"
                    type="number"
                  />

                </div>

                {formData.price &&
                  formData.compareAtPrice &&
                  Number(formData.compareAtPrice) >
                    Number(formData.price) && (

                    <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-xs text-gray-500">
                            Customer savings
                          </p>

                          <p className="text-xl font-black text-emerald-600">
                            ₹
                            {Math.max(
                              0,
                              Number(formData.compareAtPrice) -
                                Number(formData.price)
                            )}
                          </p>
                        </div>

                        <div className="text-right">

                          <p className="text-xs text-gray-500">
                            Discount
                          </p>

                          <p className="text-xl font-black text-emerald-600">

                            {Math.max(
                              0,
                              Math.round(
                                ((Number(formData.compareAtPrice) -
                                  Number(formData.price)) /
                                  Number(formData.compareAtPrice)) *
                                  100
                              )
                            )}

                            %

                          </p>

                        </div>

                      </div>
                    </div>
                  )}

              </div>
            </section>

            {/* =================================================
                VARIANTS
            ================================================= */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-gray-100">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <Palette size={19} />
                    </div>

                    <div>

                      <h2 className="font-bold">
                        Product variants
                      </h2>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Add different sizes, colors and variant inventory.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition"
                  >
                    <Plus size={17} />
                    Add Variant
                  </button>

                </div>

              </div>

              <div className="p-6">

                {variants.length === 0 ? (

                  <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                      <Layers3 size={25} />
                    </div>

                    <h3 className="mt-4 font-bold text-gray-900">
                      No variants added
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                      Add variants if your product has different sizes,
                      colors, prices or stock levels.
                    </p>

                    <button
                      type="button"
                      onClick={addVariant}
                      className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition"
                    >
                      <Plus size={16} />
                      Add first variant
                    </button>

                  </div>

                ) : (

                  <div className="space-y-5">

                    {variants.map((variant, index) => (

                      <div
                        key={index}
                        className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden"
                      >

                        {/* VARIANT HEADER */}

                        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-white">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                              <span className="text-sm font-black">
                                {index + 1}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold">
                                Variant {index + 1}
                              </h3>

                              <p className="text-xs text-gray-400">
                                {variant.size ||
                                  "No size"}{" "}
                                {variant.color &&
                                  `· ${variant.color}`}
                              </p>
                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(index)
                            }
                            className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                            title="Remove variant"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                        {/* VARIANT BODY */}

                        <div className="p-5">

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <InputField
                              label="Size"
                              name={`variant-size-${index}`}
                              value={variant.size}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "size",
                                  e.target.value
                                )
                              }
                              placeholder="S, M, L, XL"
                            />

                            <InputField
                              label="Color"
                              name={`variant-color-${index}`}
                              value={variant.color}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "color",
                                  e.target.value
                                )
                              }
                              placeholder="Black, White, Red"
                            />

                            <InputField
                              label="Variant price"
                              name={`variant-price-${index}`}
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="699"
                              type="number"
                              prefix="₹"
                            />

                            <InputField
                              label="Stock"
                              name={`variant-stock-${index}`}
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "stock",
                                  e.target.value
                                )
                              }
                              placeholder="50"
                              type="number"
                            />

                            <InputField
                              label="SKU"
                              name={`variant-sku-${index}`}
                              value={variant.sku}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "sku",
                                  e.target.value
                                )
                              }
                              placeholder="PRINT-BLK-M"
                            />

                            <InputField
                              label="Qikink SKU"
                              name={`variant-qikink-sku-${index}`}
                              value={variant.qikinkSku}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "qikinkSku",
                                  e.target.value
                                )
                              }
                              placeholder="QIKINK-BLK-M"
                            />

                          </div>

                          <label className="mt-5 flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 cursor-pointer">

                            <div>

                              <p className="text-sm font-semibold">
                                Active variant
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Customers can select this variant.
                              </p>

                            </div>

                            <div className="relative shrink-0">

                              <input
                                type="checkbox"
                                checked={variant.active}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "active",
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />

                              <div className="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-500 transition" />

                              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-5 transition" />

                            </div>

                          </label>

                        </div>

                      </div>

                    ))}

                    <button
                      type="button"
                      onClick={addVariant}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-violet-200 text-violet-600 text-sm font-bold hover:bg-violet-50 transition"
                    >
                      <Plus
                        size={16}
                        className="inline mr-2"
                      />
                      Add another variant
                    </button>

                  </div>

                )}

              </div>
            </section>

            {/* =================================================
                INVENTORY
            ================================================= */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <SectionHeader
                icon={<Package size={19} />}
                title="Inventory"
                description="Manage stock and inventory tracking."
                color="blue"
              />

              <div className="p-6">

                <InputField
                  label={
                    variants.length > 0
                      ? "Base available quantity"
                      : "Available quantity"
                  }
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="100"
                  type="number"
                />

                {variants.length > 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    Variant stock is managed separately above.
                    This value is the base product stock.
                  </p>
                )}

                <div className="mt-5 space-y-3">

                  <Toggle
                    name="trackInventory"
                    checked={formData.trackInventory}
                    onChange={handleChange}
                    title="Track inventory"
                    description="Automatically keep track of available stock."
                  />

                  <Toggle
                    name="allowBackorder"
                    checked={formData.allowBackorder}
                    onChange={handleChange}
                    title="Allow backorders"
                    description="Allow customers to order when inventory reaches zero."
                  />

                </div>

              </div>
            </section>

            {/* =================================================
                STORE VISIBILITY
            ================================================= */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <SectionHeader
                icon={<Eye size={19} />}
                title="Store visibility"
                description="Control where and how this product appears."
                color="orange"
              />

              <div className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <ToggleCard
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    title="Featured"
                    description="Show in featured products"
                  />

                  <ToggleCard
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleChange}
                    title="New arrival"
                    description="Show in new arrivals"
                  />

                  <ToggleCard
                    name="isSale"
                    checked={formData.isSale}
                    onChange={handleChange}
                    title="Sale"
                    description="Show in sale section"
                  />

                </div>

              </div>
            </section>

          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="space-y-6">

            {/* STATUS */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={19} />
                </div>

                <div>

                  <h3 className="font-bold">
                    Product status
                  </h3>

                  <p className="text-xs text-gray-400">
                    Control storefront visibility
                  </p>

                </div>

              </div>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              >

                <option value="active">
                  Active
                </option>

                <option value="draft">
                  Draft
                </option>

              </select>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">

                <span
                  className={`w-2 h-2 rounded-full ${
                    formData.status === "active"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />

                {formData.status === "active"
                  ? "Customers can see this product."
                  : "Product is saved as a draft."}

              </div>

            </section>

            {/* ORGANIZATION */}

            <section className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">

              <SectionHeader
                icon={<Layers3 size={19} />}
                title="Product organization"
                description="Organize your catalog."
                color="indigo"
              />

              <div className="p-6 space-y-5">

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}

                  </select>

                </div>

                <InputField
                  label="Subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="Graphic Tees"
                />

                <InputField
                  label="Brand / Vendor"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Printzenz"
                />

                {/* TAGS */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags
                  </label>

                  <div className="flex gap-2">

                    <input
                      value={tagInput}
                      onChange={(e) =>
                        setTagInput(e.target.value)
                      }
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag"
                      className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />

                    <button
                      type="button"
                      onClick={addTag}
                      className="w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition"
                    >
                      <Plus size={18} />
                    </button>

                  </div>

                  {formData.tags.length > 0 && (

                    <div className="flex flex-wrap gap-2 mt-3">

                      {formData.tags.map((tag) => (

                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                        >

                          <Tags size={12} />

                          {tag}

                          <button
                            type="button"
                            onClick={() =>
                              removeTag(tag)
                            }
                            className="hover:text-red-500"
                          >
                            <X size={13} />
                          </button>

                        </span>

                      ))}

                    </div>

                  )}

                </div>

              </div>
            </section>

            {/* PREVIEW */}

            <section className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 rounded-[24px] p-6 text-white shadow-xl shadow-fuchsia-100">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Eye size={19} />
                </div>

                <div>

                  <h3 className="font-bold">
                    Quick preview
                  </h3>

                  <p className="text-xs text-white/70">
                    How your product looks
                  </p>

                </div>

              </div>

              <div className="rounded-2xl overflow-hidden bg-white text-gray-900">

                <div className="aspect-[4/3] bg-gray-100">

                  {images[0]?.preview ? (

                    <img
                      src={images[0].preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImagePlus size={40} />
                    </div>

                  )}

                </div>

                <div className="p-4">

                  <p className="text-xs text-gray-400">
                    {formData.category ||
                      "Product category"}
                  </p>

                  <h4 className="font-bold mt-1 truncate">
                    {formData.name ||
                      "Your product name"}
                  </h4>

                  <div className="flex items-center gap-2 mt-3">

                    <span className="font-black">
                      ₹{formData.price || "0"}
                    </span>

                    {formData.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{formData.compareAtPrice}
                      </span>
                    )}

                  </div>

                  {variants.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                      <Ruler size={13} />

                      {variants.length} variant
                      {variants.length !== 1
                        ? "s"
                        : ""}

                    </div>
                  )}

                </div>

              </div>

            </section>

            {/* HELP */}

            <div className="rounded-[24px] bg-white border border-gray-100 p-5">

              <div className="flex gap-3">

                <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Settings2 size={18} />
                </div>

                <div>

                  <h4 className="font-bold text-sm">
                    Product setup tip
                  </h4>

                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Add a clear product name, high-quality
                    images, accurate pricing, variants and
                    the correct category before publishing.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
};

/* =============================================================
   INPUT FIELD
============================================================= */

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  required = false,
}) => {
  return (
    <div>

      <label className="block text-sm font-semibold text-gray-700 mb-2">

        {label}

        {required && (
          <span className="text-pink-500 ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={
            type === "number"
              ? "0"
              : undefined
          }
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 ${
            prefix
              ? "pl-9 pr-4"
              : "px-4"
          }`}
        />

      </div>

    </div>
  );
};

/* =============================================================
   SECTION HEADER
============================================================= */

const SectionHeader = ({
  icon,
  title,
  description,
  color = "violet",
}) => {

  const colors = {
    violet:
      "bg-violet-50 text-violet-600",

    pink:
      "bg-pink-50 text-pink-600",

    emerald:
      "bg-emerald-50 text-emerald-600",

    blue:
      "bg-blue-50 text-blue-600",

    orange:
      "bg-orange-50 text-orange-600",

    indigo:
      "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>

      <div>

        <h2 className="font-bold">
          {title}
        </h2>

        <p className="text-xs text-gray-400 mt-0.5">
          {description}
        </p>

      </div>

    </div>
  );
};

/* =============================================================
   TOGGLE
============================================================= */

const Toggle = ({
  name,
  checked,
  onChange,
  title,
  description,
}) => {

  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition">

      <div>

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {description}
        </p>

      </div>

      <div className="relative shrink-0">

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />

        <div className="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-500 transition" />

        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-5 transition" />

      </div>

    </label>
  );
};

/* =============================================================
   TOGGLE CARD
============================================================= */

const ToggleCard = ({
  name,
  checked,
  onChange,
  title,
  description,
}) => {

  return (
    <label
      className={`block cursor-pointer rounded-2xl border p-4 transition ${
        checked
          ? "border-violet-300 bg-violet-50"
          : "border-gray-100 bg-gray-50 hover:bg-white"
      }`}
    >

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      <div className="flex items-center justify-between">

        <span className="text-sm font-bold">
          {title}
        </span>

        <span
          className={`w-5 h-5 rounded-md flex items-center justify-center ${
            checked
              ? "bg-violet-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          {checked && (
            <CheckCircle2 size={15} />
          )}
        </span>

      </div>

      <p className="text-xs text-gray-400 mt-2">
        {description}
      </p>

    </label>
  );
};

export default AddProduct;