
import { axiosinstance } from "./axios.js"
// -----------------------------------------
// GET ALL ADDRESSES
// -----------------------------------------

export const getAddresses = async () => {
  const response = await axiosinstance.get("/api/addresses");

  return response.data;
};

export const getDefaultAddress = async () => {
  const response = await getAddresses();
  const addresses = Array.isArray(response?.addresses)
    ? response.addresses
    : [];

  return addresses.find((address) => address.isDefault) || null;
};

// -----------------------------------------
// GET SINGLE ADDRESS
// -----------------------------------------

export const getAddressById = async (addressId) => {
  const response = await axiosinstance.get(
    `/api/addresses/${addressId}`
  );

  return response.data;
};

// -----------------------------------------
// CREATE ADDRESS
// -----------------------------------------

export const createAddress = async (addressData) => {
  const response = await axiosinstance.post(
    "/api/addresses",
    addressData
  );

  return response.data;
};

// -----------------------------------------
// UPDATE ADDRESS
// -----------------------------------------

export const updateAddress = async ({
  addressId,
  addressData,
}) => {
  const response = await axiosinstance.put(
    `/api/addresses/${addressId}`,
    addressData
  );

  return response.data;
};

// -----------------------------------------
// DELETE ADDRESS
// -----------------------------------------

export const deleteAddress = async (addressId) => {
  const response = await axiosinstance.delete(
    `/api/addresses/${addressId}`
  );

  return response.data;
};

// -----------------------------------------
// SET DEFAULT ADDRESS
// -----------------------------------------

export const setDefaultAddress = async (addressId) => {
  const response = await axiosinstance.patch(
    `/api/addresses/${addressId}/default`
  );

  return response.data;
};

