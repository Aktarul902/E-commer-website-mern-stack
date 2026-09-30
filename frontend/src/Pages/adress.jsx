
import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../lib/adressapi.js";

import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  ArrowLeft,
} from "lucide-react";
import useAuthuser from "../hooks/authuser.js";

export default function Address() {
  const queryClient = useQueryClient();
  const { authuser } = useAuthuser();

  // -----------------------------------------
  // FORM STATE
  // -----------------------------------------

  const emptyForm = {
    addressType: "home",
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  };

  const [form, setForm] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  // -----------------------------------------
  // GET ADDRESSES
  // -----------------------------------------

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    retry: false,
  });

  const addresses = data?.addresses || [];

  // -----------------------------------------
  // CREATE ADDRESS
  // -----------------------------------------

  const createMutation = useMutation({
    mutationFn: createAddress,

    onSuccess: () => {
      toast.success("Address added successfully.");
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });

      resetForm();
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to save address"
      );
    },
  });

  // -----------------------------------------
  // UPDATE ADDRESS
  // -----------------------------------------

  const updateMutation = useMutation({
    mutationFn: updateAddress,

    onSuccess: () => {
      toast.success("Address updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });

      resetForm();
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update address"
      );
    },
  });

  // -----------------------------------------
  // DELETE ADDRESS
  // -----------------------------------------

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,

    onSuccess: () => {
      toast.success("Address deleted successfully.");
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete address"
      );
    },
  });

  // -----------------------------------------
  // SET DEFAULT ADDRESS
  // -----------------------------------------

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,

    onSuccess: () => {
      toast.success("Default address updated.");
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to set default address"
      );
    },
  });

  // -----------------------------------------
  // FORM CHANGE
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // RESET FORM
  // -----------------------------------------

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  // -----------------------------------------
  // SUBMIT
  // -----------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({
        addressId: editingId,
        addressData: form,
      });
    } else {
      createMutation.mutate(form);
    }
  };

  // -----------------------------------------
  // EDIT ADDRESS
  // -----------------------------------------

  const editAddress = (address) => {
    setForm({
      addressType: address.addressType || "home",
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      isDefault: address.isDefault || false,
    });

    setEditingId(address._id);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------------------
  // DELETE ADDRESS
  // -----------------------------------------

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    deleteMutation.mutate(id);
  };

  // -----------------------------------------
  // MAKE DEFAULT
  // -----------------------------------------

  const makeDefault = (id) => {
    defaultMutation.mutate(id);
  };
  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-500">
            Loading your addresses...
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // ERROR
  // -----------------------------------------

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md w-full">
          <MapPin
            size={40}
            className="mx-auto text-red-400"
          />

          <h2 className="text-xl font-black mt-4">
            Unable to load addresses
          </h2>

          <p className="text-gray-500 mt-2">
            {error?.response?.data?.message ||
              "Something went wrong. Please try again."}
          </p>

          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["addresses"],
              })
            }
            className="mt-5 px-5 py-3 rounded-xl bg-black text-white font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // RENDER
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <section className="bg-white border-b border-gray-100">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <Link
            to={authuser?._id ? `/myaccount/${authuser._id}` : "/myaccount"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black mb-5"
          >
            <ArrowLeft size={17} />
            Back to Account
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                My Account
              </p>

              <h1 className="text-3xl sm:text-4xl font-black mt-1">
                My Addresses
              </h1>

              <p className="text-gray-500 mt-2">
                Manage your delivery addresses.
              </p>

            </div>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition"
            >
              <Plus size={18} />
              Add New Address
            </button>

          </div>
        </div>

      </section>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 mb-7">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  {editingId
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p className="text-sm text-gray-500">
                  Enter your complete delivery details.
                </p>
              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ADDRESS TYPE */}
              <div>

                <label className="block text-sm font-bold mb-2">
                  Address Type
                </label>

                <div className="flex gap-3 flex-wrap">

                  {[
                    {
                      label: "Home",
                      value: "home",
                    },
                    {
                      label: "Work",
                      value: "work",
                    },
                    {
                      label: "Other",
                      value: "other",
                    },
                  ].map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          addressType: type.value,
                        }))
                      }
                      className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm ${
                        form.addressType === type.value
                          ? "bg-black text-white border-black"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}

                </div>

              </div>

              {/* FIRST + LAST NAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-bold mb-2">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                  />
                </div>

              </div>

              {/* PHONE */}
              <div>

                <label className="block text-sm font-bold mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                />

              </div>

              {/* ADDRESS LINE 1 */}
              <div>

                <label className="block text-sm font-bold mb-2">
                  Address
                </label>

                <textarea
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="House number, street, area..."
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black resize-none"
                />

              </div>

              {/* ADDRESS LINE 2 */}
              <div>

                <label className="block text-sm font-bold mb-2">
                  Address Line 2
                  <span className="font-normal text-gray-400 ml-1">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, landmark, etc."
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                />

              </div>

              {/* CITY / STATE / PINCODE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                <div>

                  <label className="block text-sm font-bold mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                  />

                </div>

                <div>

                  <label className="block text-sm font-bold mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                  />

                </div>

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="700001"
                    maxLength={6}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                  />

                </div>

              </div>

              {/* COUNTRY */}
              <div>

                <label className="block text-sm font-bold mb-2">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                />

              </div>

              {/* DEFAULT */}
              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      isDefault: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />

                <span className="text-sm font-semibold">
                  Make this my default address
                </span>

              </label>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">

                <button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                  {createMutation.isPending ||
                  updateMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Address"
                    : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ADDRESS LIST */}
        {addresses.length === 0 ? (

          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">

              <MapPin
                size={27}
                className="text-gray-400"
              />

            </div>

            <h2 className="text-xl font-black mt-5">
              No addresses yet
            </h2>

            <p className="text-gray-500 mt-2">
              Add an address for faster checkout.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 px-5 py-3 rounded-xl bg-black text-white font-bold"
            >
              Add Address
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {addresses.map((address) => (

              <div
                key={address._id}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6"
              >

                {/* TOP */}
                <div className="flex items-center justify-between mb-5">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <MapPin size={19} />
                    </div>

                    <div>

                      <h3 className="font-black capitalize">
                        {address.addressType}
                      </h3>

                      {address.isDefault && (
                        <span className="text-xs text-green-600 font-bold">
                          Default address
                        </span>
                      )}

                    </div>

                  </div>

                  {address.isDefault && (
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Check size={15} />
                    </div>
                  )}

                </div>

                {/* DETAILS */}
                <div className="text-sm text-gray-600 leading-6">

                  <p className="font-bold text-gray-900">
                    {address.firstName}{" "}
                    {address.lastName}
                  </p>

                  <p>{address.phone}</p>

                  <p className="mt-2">
                    {address.addressLine1}
                  </p>

                  {address.addressLine2 && (
                    <p>
                      {address.addressLine2}
                    </p>
                  )}

                  <p>
                    {address.city},{" "}
                    {address.state} -{" "}
                    {address.postalCode}
                  </p>

                  <p>{address.country}</p>

                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100">

                  <button
                    onClick={() =>
                      editAddress(address)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold hover:border-black"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(address._id)
                    }
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-red-500 hover:border-red-300 disabled:opacity-50"
                  >
                    <Trash2 size={15} />

                    {deleteMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                  {!address.isDefault && (
                    <button
                      onClick={() =>
                        makeDefault(address._id)
                      }
                      disabled={
                        defaultMutation.isPending
                      }
                      className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-black disabled:opacity-50"
                    >
                      {defaultMutation.isPending
                        ? "Updating..."
                        : "Make Default"}
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  );
}

