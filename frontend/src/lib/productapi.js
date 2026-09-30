import {axiosinstance} from "./axios.js";
// ------------------------------------
// PUBLIC PRODUCTS
// ------------------------------------

export const getProducts = async () => {
  const response = await axiosinstance.get("/products");

  return response.data;
};

// ------------------------------------
// SINGLE PRODUCT
// ------------------------------------

export const getProductById = async (productId) => {
  const response = await axiosinstance.get(
    `/products/${productId}`
  );

  return response.data;
};

export const submitProductReview = async ({ productId, rating, title, comment }) => {
  const response = await axiosinstance.post(
    `/products/${productId}/reviews`,
    { rating, title, comment }
  );

  return response.data;
};

// ------------------------------------
// ADMIN PRODUCTS
// ------------------------------------

export const getAdminProducts = async () => {
  const response = await axiosinstance.get(
    "/products/admin/all"
  );

  return response.data;
};

// ------------------------------------
// CREATE
// ------------------------------------

export const createProduct = async (productData) => {
  const response = await axiosinstance.post(
    "/products",
    productData
  );

  return response.data;
};

// ------------------------------------
// UPDATE
// ------------------------------------

export const updateProduct = async ({
  productId,
  productData,
}) => {
  const response = await axiosinstance.put(
    `/products/${productId}`,
    productData
  );

  return response.data;
};

// ------------------------------------
// DELETE
// ------------------------------------

export const deleteProduct = async (productId) => {
  const response = await axiosinstance.delete(
    `/products/${productId}`
  );

  return response.data;
};