import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getProductById,
  updateProduct,
} from "../../lib/productapi";

import { uploadImageToCloudinary } from "../../lib/cloudinary";

const categories = [
  "T-Shirts",
  "Hoodies",
  "Sweatshirts",
  "Mugs",
  "Posters",
  "Phone Cases",
  "Accessories",
];

/* =========================================
   EMPTY VARIANT
========================================= */

const createEmptyVariant = () => ({
  size: "",
  color: "",
  sku: "",
  qikinkSku: "",
  price: "",
  stock: "0",
  active: true,
});

/* =========================================
   NORMALIZE VARIANT
========================================= */

const normalizeVariant = (variant = {}) => ({
  _id: variant._id,
  size: variant.size || "",
  color: variant.color || "",
  sku: variant.sku || "",
  qikinkSku: variant.qikinkSku || "",
  price: variant.price ?? "",
  stock: variant.stock ?? 0,
  active:
    typeof variant.active === "boolean"
      ? variant.active
      : true,
});

/* =========================================
   NORMALIZE IMAGE
========================================= */

const createImageObject = ({
  url,
  id,
  file = null,
  isExisting = true,
}) => ({
  id:
    id ||
    `image-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
  url,
  file,
  isExisting,
});

/* =========================================
   ADMIN PRODUCT EDIT
========================================= */

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* =========================================
     FORM STATE
  ========================================= */

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    category: "",
    quantity: "0",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isSale: false,
    tags: [],
  });

  /* =========================================
     VARIANTS
  ========================================= */

  const [variants, setVariants] = useState([]);

  /* =========================================
     TAGS
  ========================================= */

  const [tagInput, setTagInput] = useState("");

  /* =========================================
     IMAGES

     IMPORTANT:
     The order of this array is the
     order that will be saved to MongoDB.
  ========================================= */

  const [images, setImages] = useState([]);

  /* =========================================
     DRAGGED IMAGE
  ========================================= */

  const [draggedImageId, setDraggedImageId] =
    useState(null);

  /* =========================================
     UI STATE
  ========================================= */

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================================
     GET PRODUCT
  ========================================= */

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });

  const product = data?.product || data;

  /* =========================================
     LOAD PRODUCT
  ========================================= */

  useEffect(() => {
    if (!product) return;

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      compareAtPrice:
        product.compareAtPrice ?? "",
      costPrice:
        product.costPrice ?? "",
      category:
        product.category || "",
      quantity:
        product.stock ?? 0,
      isActive:
        Boolean(product.isActive),
      isFeatured:
        Boolean(product.isFeatured),
      isNewArrival:
        Boolean(product.isNewArrival),
      isSale:
        Boolean(product.isSale),
      tags:
        Array.isArray(product.tags)
          ? product.tags
          : [],
    });

    /* =========================================
       LOAD VARIANTS
    ========================================= */

    setVariants(
      Array.isArray(product.variants)
        ? product.variants.map(normalizeVariant)
        : []
    );

    /* =========================================
       LOAD EXISTING IMAGES
    ========================================= */

    setImages(
      Array.isArray(product.images)
        ? product.images.map((url, index) =>
            createImageObject({
              url,
              id: `existing-image-${index}-${url}`,
              file: null,
              isExisting: true,
            })
          )
        : []
    );
  }, [product]);

  /* =========================================
     UPDATE PRODUCT MUTATION
  ========================================= */

  const updateMutation = useMutation({
    mutationFn: (productData) =>
      updateProduct({
        productId: id,
        productData,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-product", id],
        }),

        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["admin-products"],
        }),
      ]);

      setSuccessMessage(
        "Product updated successfully."
      );

      setErrorMessage("");

      setTimeout(() => {
        navigate(`/admin/products/${id}`);
      }, 700);
    },

    onError: (error) => {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product."
      );
    },
  });

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     CHECKBOX CHANGE
  ========================================= */

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  /* =========================================
     VARIANT FUNCTIONS
  ========================================= */

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (index) => {
    setVariants((current) =>
      current.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );
  };

  const updateVariant = (
    index,
    field,
    value
  ) => {
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

  const toggleVariantActive = (index) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              active: !variant.active,
            }
          : variant
      )
    );
  };

  /* =========================================
     IMAGE SELECT
  ========================================= */

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter(
      (file) => {
        if (!file.type.startsWith("image/")) {
          return false;
        }

        if (
          file.size >
          10 * 1024 * 1024
        ) {
          return false;
        }

        return true;
      }
    );

    const newImages = validFiles.map(
      (file) =>
        createImageObject({
          id: `new-${file.name}-${file.lastModified}-${Math.random()}`,
          url: URL.createObjectURL(file),
          file,
          isExisting: false,
        })
    );

    setImages((previous) => [
      ...previous,
      ...newImages,
    ]);

    event.target.value = "";
  };

  /* =========================================
     REMOVE IMAGE
  ========================================= */

  const removeImage = (imageId) => {
    setImages((previous) => {
      const imageToRemove = previous.find(
        (image) => image.id === imageId
      );

      if (
        imageToRemove?.file &&
        imageToRemove.url?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imageToRemove.url
        );
      }

      return previous.filter(
        (image) => image.id !== imageId
      );
    });
  };

  /* =========================================
     DRAG START
  ========================================= */

  const handleImageDragStart = (
    event,
    imageId
  ) => {
    setDraggedImageId(imageId);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(
      "text/plain",
      imageId
    );
  };

  /* =========================================
     DRAG OVER
  ========================================= */

  const handleImageDragOver = (
    event
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";
  };

  /* =========================================
     DROP IMAGE
  ========================================= */

  const handleImageDrop = (
    event,
    targetImageId
  ) => {
    event.preventDefault();

    const sourceImageId =
      event.dataTransfer.getData(
        "text/plain"
      ) || draggedImageId;

    if (
      !sourceImageId ||
      sourceImageId === targetImageId
    ) {
      setDraggedImageId(null);
      return;
    }

    setImages((currentImages) => {
      const sourceIndex =
        currentImages.findIndex(
          (image) =>
            image.id === sourceImageId
        );

      const targetIndex =
        currentImages.findIndex(
          (image) =>
            image.id === targetImageId
        );

      if (
        sourceIndex === -1 ||
        targetIndex === -1
      ) {
        return currentImages;
      }

      const reorderedImages = [
        ...currentImages,
      ];

      const [movedImage] =
        reorderedImages.splice(
          sourceIndex,
          1
        );

      reorderedImages.splice(
        targetIndex,
        0,
        movedImage
      );

      return reorderedImages;
    });

    setDraggedImageId(null);
  };

  /* =========================================
     DRAG END
  ========================================= */

  const handleImageDragEnd = () => {
    setDraggedImageId(null);
  };

  /* =========================================
     ADD TAG
  ========================================= */

  const addTag = () => {
    const tag = tagInput.trim();

    if (!tag) return;

    if (
      formData.tags.some(
        (existingTag) =>
          existingTag.toLowerCase() ===
          tag.toLowerCase()
      )
    ) {
      setTagInput("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      tags: [
        ...previous.tags,
        tag,
      ],
    }));

    setTagInput("");
  };

  /* =========================================
     REMOVE TAG
  ========================================= */

  const removeTag = (tagToRemove) => {
    setFormData((previous) => ({
      ...previous,
      tags: previous.tags.filter(
        (tag) =>
          tag !== tagToRemove
      ),
    }));
  };

  /* =========================================
     TAG ENTER
  ========================================= */

  const handleTagKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  /* =========================================
     UPLOAD NEW IMAGES

     IMPORTANT:
     We upload images in the CURRENT
     drag-and-drop order.

     This fixes the old problem where
     existingImages and uploadedImages
     were separated and the drag order
     was lost.
  ========================================= */

  const uploadNewImages = async () => {
    const totalImages = images.length;

    if (!totalImages) {
      setUploadProgress(100);
      return [];
    }

    const finalImageUrls = [];

    let uploadedCount = 0;

    for (
      let index = 0;
      index < images.length;
      index++
    ) {
      const image = images[index];

      /* Existing Cloudinary image */

      if (
        image.isExisting &&
        image.url
      ) {
        finalImageUrls.push(
          image.url
        );

        uploadedCount++;

        setUploadProgress(
          Math.round(
            (uploadedCount /
              totalImages) *
              100
          )
        );

        continue;
      }

      /* New local image */

      if (image.file) {
        const cloudinaryUrl =
          await uploadImageToCloudinary(
            image.file
          );

        finalImageUrls.push(
          cloudinaryUrl
        );

        uploadedCount++;

        setUploadProgress(
          Math.round(
            (uploadedCount /
              totalImages) *
              100
          )
        );
      }
    }

    return finalImageUrls;
  };

  /* =========================================
     VARIANT VALIDATION
  ========================================= */

  const validateVariants = () => {
    const combinations = new Set();

    const skus = new Set();

    for (
      let index = 0;
      index < variants.length;
      index++
    ) {
      const variant = variants[index];

      const size = String(
        variant.size || ""
      ).trim();

      const color = String(
        variant.color || ""
      ).trim();

      const sku = String(
        variant.sku || ""
      ).trim();

      const stock =
        Number(variant.stock);

      const price =
        variant.price === ""
          ? 0
          : Number(variant.price);

      /* SIZE / COLOR */

      if (!size && !color) {
        return `Variant ${
          index + 1
        }: Please enter a size or color.`;
      }

      /* PRICE */

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return `Variant ${
          index + 1
        }: Price cannot be negative.`;
      }

      /* STOCK */

      if (
        !Number.isFinite(stock) ||
        stock < 0
      ) {
        return `Variant ${
          index + 1
        }: Stock cannot be negative.`;
      }

      /* SIZE + COLOR DUPLICATE */

      const combination = `${size
        .toLowerCase()}__${color.toLowerCase()}`;

      if (
        combinations.has(combination)
      ) {
        return `Variant ${
          index + 1
        }: Duplicate size and color combination.`;
      }

      combinations.add(combination);

      /* SKU DUPLICATE */

      if (sku) {
        const normalizedSku =
          sku.toLowerCase();

        if (skus.has(normalizedSku)) {
          return `Variant ${
            index + 1
          }: SKU must be unique.`;
        }

        skus.add(normalizedSku);
      }
    }

    return null;
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    /* BASIC VALIDATION */

    if (!formData.name.trim()) {
      setErrorMessage(
        "Product name is required."
      );
      return;
    }

    if (!formData.category) {
      setErrorMessage(
        "Please select a category."
      );
      return;
    }

    const productPrice =
      Number(formData.price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      setErrorMessage(
        "Price cannot be negative."
      );
      return;
    }

    const quantity =
      Number(formData.quantity);

    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      setErrorMessage(
        "Stock quantity cannot be negative."
      );
      return;
    }

    /* VARIANT VALIDATION */

    const variantError =
      validateVariants();

    if (variantError) {
      setErrorMessage(
        variantError
      );
      return;
    }

    try {
      setSaving(true);
      setUploadProgress(0);

      /* =====================================
         CLOUDINARY

         This preserves the exact
         drag-and-drop order.
      ===================================== */

      const imageUrls =
        await uploadNewImages();

      /* =====================================
         NORMALIZE VARIANTS
      ===================================== */

      const normalizedVariants =
        variants.map((variant) => ({
          ...(variant._id
            ? { _id: variant._id }
            : {}),

          size: String(
            variant.size || ""
          ).trim(),

          color: String(
            variant.color || ""
          ).trim(),

          sku: String(
            variant.sku || ""
          ).trim(),

          qikinkSku: String(
            variant.qikinkSku || ""
          ).trim(),

          price:
            variant.price === "" ||
            variant.price === null ||
            variant.price ===
              undefined
              ? 0
              : Number(
                  variant.price
                ),

          stock:
            variant.stock === "" ||
            variant.stock === null ||
            variant.stock ===
              undefined
              ? 0
              : Number(
                  variant.stock
                ),

          active:
            Boolean(
              variant.active
            ),
        }));

      /* =====================================
         PRODUCT DATA

         Notice:
         There is NO top-level SKU here.

         SKU belongs to variants.
      ===================================== */

      const productData = {
        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        category:
          formData.category,

        price:
          Number(formData.price) ||
          0,

        compareAtPrice:
          formData.compareAtPrice
            ? Number(
                formData.compareAtPrice
              )
            : 0,

        costPrice:
          formData.costPrice
            ? Number(
                formData.costPrice
              )
            : 0,

        stock:
          Number(
            formData.quantity
          ) || 0,

        /*
         * IMPORTANT:
         * imageUrls is already in the
         * user's drag-and-drop order.
         */
        images: imageUrls,

        tags: formData.tags,

        isActive:
          Boolean(
            formData.isActive
          ),

        isFeatured:
          Boolean(
            formData.isFeatured
          ),

        isNewArrival:
          Boolean(
            formData.isNewArrival
          ),

        isSale:
          Boolean(
            formData.isSale
          ),

        variants:
          normalizedVariants,

        /* QIKINK */

        source:
          product?.source ||
          "manual",

        qikinkProductId:
          product?.qikinkProductId ||
          "",

        qikinkSku:
          product?.qikinkSku ||
          "",
      };

      console.log(
        "Updating product:",
        productData
      );

      await updateMutation.mutateAsync(
        productData
      );
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-12 w-72 animate-pulse rounded-xl bg-slate-200" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="h-[650px] animate-pulse rounded-3xl bg-white" />

            <div className="h-[650px] animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     PRODUCT NOT FOUND
  ========================================= */

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error?.message ||
              "Unable to load this product."}
          </p>

          <Link
            to="/admin/products"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/products"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
              >
                ←
              </Link>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Link
                    to="/admin/products"
                    className="hover:text-indigo-600"
                  >
                    Products
                  </Link>

                  <span>/</span>

                  <span>
                    Edit product
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900">
                  Edit Product
                </h1>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to={`/admin/products/${id}`}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                form="edit-product-form"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? uploadProgress <
                    100
                    ? `Uploading ${uploadProgress}%`
                    : "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          UPLOAD PROGRESS
      ===================================== */}

      {saving && (
        <div className="mx-auto max-w-7xl px-6 pt-5">
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-violet-700">
                {uploadProgress <
                100
                  ? "Uploading new images to Cloudinary..."
                  : "Saving product changes..."}
              </span>

              <span className="text-sm font-bold text-violet-700">
                {uploadProgress}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                style={{
                  width: `${uploadProgress}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          MESSAGES
      ===================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-5">
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}
      </div>

      {/* =====================================
          FORM
      ===================================== */}

      <form
        id="edit-product-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-6 py-6"
      >
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* =================================
              LEFT
          ================================= */}

          <div className="space-y-6">
            {/* PRODUCT INFORMATION */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Product information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update your product name and description.
                </p>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product name *
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    rows={9}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>
            </section>

            {/* =================================
                MEDIA
            ================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Product media
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Drag and drop images to change their order. The first image is the main product image.
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                      {images.length}{" "}
                      {images.length ===
                      1
                        ? "image"
                        : "images"}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {images.length > 0 && (
                  <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
                        ↕
                      </div>

                      <div>
                        <p className="text-sm font-bold text-violet-900">
                          Rearrange product images
                        </p>

                        <p className="mt-1 text-xs leading-5 text-violet-600">
                          Drag any image and drop it onto another image. The image numbered 1 will be used as the main product image.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map(
                    (image, index) => {
                      const isDragging =
                        draggedImageId ===
                        image.id;

                      return (
                        <div
                          key={image.id}
                          draggable
                          onDragStart={(
                            event
                          ) =>
                            handleImageDragStart(
                              event,
                              image.id
                            )
                          }
                          onDragOver={
                            handleImageDragOver
                          }
                          onDrop={(
                            event
                          ) =>
                            handleImageDrop(
                              event,
                              image.id
                            )
                          }
                          onDragEnd={
                            handleImageDragEnd
                          }
                          className={`group relative aspect-square cursor-grab overflow-hidden rounded-2xl border-2 bg-slate-100 transition-all active:cursor-grabbing ${
                            isDragging
                              ? "scale-95 border-violet-500 opacity-50 shadow-xl"
                              : index ===
                                0
                              ? "border-violet-400 shadow-md"
                              : "border-slate-200 hover:border-violet-300 hover:shadow-md"
                          }`}
                        >
                          <img
                            src={
                              image.url
                            }
                            alt={`${formData.name} ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />

                          {/* IMAGE NUMBER */}

                          <div
                            className={`absolute left-2 top-2 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow ${
                              index ===
                              0
                                ? "bg-violet-600"
                                : "bg-black/65"
                            }`}
                          >
                            {index ===
                            0
                              ? "Main"
                              : index + 1}
                          </div>

                          {/* DRAG ICON */}

                          <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                            ⋮⋮
                          </div>

                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                image.id
                              )
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-sm font-bold text-white opacity-0 shadow-lg transition hover:bg-red-600 group-hover:opacity-100"
                          >
                            ×
                          </button>

                          {/* CLOUDINARY / NEW */}

                          {image.isExisting ? (
                            <div className="absolute bottom-2 left-2 rounded-lg bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white">
                              Cloudinary
                            </div>
                          ) : (
                            <div className="absolute bottom-2 left-2 rounded-lg bg-violet-500/90 px-2 py-1 text-[10px] font-bold text-white">
                              New image
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}

                  {/* ADD IMAGES */}

                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 text-center transition hover:border-violet-400 hover:bg-violet-100">
                    <div className="text-3xl text-violet-500">
                      ＋
                    </div>

                    <span className="mt-2 text-sm font-bold text-violet-700">
                      Add images
                    </span>

                    <span className="mt-1 px-3 text-xs text-violet-400">
                      JPG, PNG, WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {!images.length && (
                  <p className="mt-4 text-center text-sm text-slate-400">
                    No images selected.
                  </p>
                )}
              </div>
            </section>

            {/* PRICING */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Pricing
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set your selling and comparison prices.
                </p>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-3">
                <Input
                  label="Price"
                  name="price"
                  type="number"
                  min="0"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  prefix="₹"
                />

                <Input
                  label="Compare-at price"
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  value={
                    formData.compareAtPrice
                  }
                  onChange={
                    handleChange
                  }
                  prefix="₹"
                />

                <Input
                  label="Cost per item"
                  name="costPrice"
                  type="number"
                  min="0"
                  value={
                    formData.costPrice
                  }
                  onChange={
                    handleChange
                  }
                  prefix="₹"
                />
              </div>
            </section>

            {/* INVENTORY */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Inventory
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage the main product inventory.
                </p>
              </div>

              <div className="p-6">
                <Input
                  label="Stock quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleChange
                  }
                />

                <p className="mt-2 text-xs text-slate-400">
                  If this product has variants, each variant can have its own stock below.
                </p>
              </div>
            </section>

            {/* =================================
                VARIANTS
            ================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-pink-50 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        Product variants
                      </h2>

                      {variants.length >
                        0 && (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                          {
                            variants.length
                          }
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      Add sizes, colors, SKUs, prices and stock for this product.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addVariant
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-600"
                  >
                    <span className="text-lg leading-none">
                      +
                    </span>

                    Add variant
                  </button>
                </div>
              </div>

              <div className="p-6">
                {variants.length ===
                0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                      ◇
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                      No variants added
                    </h3>

                    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                      Add variants if your product has different sizes, colors or individual SKUs.
                    </p>

                    <button
                      type="button"
                      onClick={
                        addVariant
                      }
                      className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      + Add first variant
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {variants.map(
                      (
                        variant,
                        index
                      ) => (
                        <div
                          key={
                            variant._id ||
                            `variant-${index}`
                          }
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >
                          {/* VARIANT HEADER */}

                          <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
                                {index +
                                  1}
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                  Variant{" "}
                                  {index +
                                    1}
                                </h3>

                                <p className="text-xs text-slate-400">
                                  {variant.size ||
                                  variant.color
                                    ? [
                                        variant.size,
                                        variant.color,
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          " / "
                                        )
                                    : "Configure this variant"}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeVariant(
                                  index
                                )
                              }
                              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>

                          {/* VARIANT FIELDS */}

                          <div className="grid gap-4 md:grid-cols-2">
                            <Input
                              label="Size"
                              value={
                                variant.size
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "size",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="S, M, L, XL"
                            />

                            <Input
                              label="Color"
                              value={
                                variant.color
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "color",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Black, White, Red"
                            />

                            <Input
                              label="Variant price"
                              type="number"
                              min="0"
                              value={
                                variant.price
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "price",
                                  event
                                    .target
                                    .value
                                )
                              }
                              prefix="₹"
                            />

                            <Input
                              label="Variant stock"
                              type="number"
                              min="0"
                              value={
                                variant.stock
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "stock",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />

                            <Input
                              label="SKU"
                              value={
                                variant.sku
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "sku",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="TSH-BLK-M-001"
                            />

                            <Input
                              label="Qikink SKU"
                              value={
                                variant.qikinkSku
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "qikinkSku",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="QIKINK-SKU"
                            />
                          </div>

                          {/* ACTIVE */}

                          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                Variant status
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Inactive variants can remain saved but should not be offered to customers.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleVariantActive(
                                  index
                                )
                              }
                              className={`relative h-6 w-11 rounded-full transition ${
                                variant.active
                                  ? "bg-violet-500"
                                  : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                  variant.active
                                    ? "translate-x-5"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>

                          <div className="mt-2 text-right text-xs font-medium">
                            {variant.active ? (
                              <span className="text-emerald-600">
                                Active
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    <button
                      type="button"
                      onClick={
                        addVariant
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 py-4 text-sm font-bold text-violet-700 transition hover:border-violet-400 hover:bg-violet-100"
                    >
                      <span className="text-lg">
                        +
                      </span>

                      Add another variant
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================
              RIGHT
          ================================= */}

          <div className="space-y-6">
            {/* STATUS */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="font-bold text-slate-900">
                  Product status
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Control storefront visibility.
                </p>
              </div>

              <select
                name="isActive"
                value={
                  formData.isActive
                    ? "active"
                    : "draft"
                }
                onChange={(event) => {
                  setFormData(
                    (previous) => ({
                      ...previous,
                      isActive:
                        event.target
                          .value ===
                        "active",
                    })
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              >
                <option value="active">
                  Active
                </option>

                <option value="draft">
                  Draft
                </option>
              </select>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`h-2 w-2 rounded-full ${
                    formData.isActive
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />

                {formData.isActive
                  ? "Customers can see this product."
                  : "Product is hidden from customers."}
              </div>
            </section>

            {/* ORGANIZATION */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="font-bold text-slate-900">
                  Product organization
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Organize your catalog.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* BRAND */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Brand / Vendor
                </label>

                <input
                  value="Printzenz"
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />
              </div>

              {/* TAGS */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tags
                </label>

                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(
                      event
                    ) =>
                      setTagInput(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={
                      handleTagKeyDown
                    }
                    placeholder="Add a tag"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={
                      addTag
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white transition hover:bg-violet-600"
                  >
                    +
                  </button>
                </div>

                {formData.tags
                  .length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.tags.map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            removeTag(
                              tag
                            )
                          }
                          className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-red-50 hover:text-red-600"
                        >
                          #{tag} ×
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* STOREFRONT */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">
                Storefront settings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Control where this product appears.
              </p>

              <div className="mt-5 space-y-3">
                <Toggle
                  name="isFeatured"
                  checked={
                    formData.isFeatured
                  }
                  onChange={
                    handleCheckboxChange
                  }
                  title="Featured product"
                  description="Show in featured products."
                />

                <Toggle
                  name="isNewArrival"
                  checked={
                    formData.isNewArrival
                  }
                  onChange={
                    handleCheckboxChange
                  }
                  title="New arrival"
                  description="Show in new arrivals."
                />

                <Toggle
                  name="isSale"
                  checked={
                    formData.isSale
                  }
                  onChange={
                    handleCheckboxChange
                  }
                  title="Sale product"
                  description="Show in sale products."
                />
              </div>
            </section>

            {/* PRODUCT ID */}

            <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Product ID
              </p>

              <p className="mt-2 break-all font-mono text-sm text-slate-200">
                {product._id}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Created{" "}
                {product.createdAt
                  ? new Date(
                      product.createdAt
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "—"}
              </p>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
};

/* =========================================
   INPUT COMPONENT
========================================= */

const Input = ({
  label,
  prefix,
  ...props
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          {...props}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 ${
            prefix ? "pl-9" : ""
          }`}
        />
      </div>
    </div>
  );
};

/* =========================================
   TOGGLE COMPONENT
========================================= */

const Toggle = ({
  name,
  checked,
  onChange,
  title,
  description,
}) => {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-200 hover:bg-violet-50">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-violet-500" />

        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </div>
    </label>
  );
};

export default AdminProductEdit;