
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaUserFriends,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaVenusMars,
} from "react-icons/fa";
import {
  FiX,
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiCalendar,
  FiArrowUpRight,
  FiLock,
  FiUserPlus,
  FiMail,
  FiAlertCircle,
} from "react-icons/fi";
import { FaWandMagicSparkles } from "react-icons/fa6";
import Navbar from "./Navbar";

const INITIAL_FORM = {
  name: "",
  mobile: "",
  email: "",
  gender: "",
  dob: "",
  marriageAnniversaryDate: "",
  address: "",
};

const CustomerPage = () => {
  const userId = localStorage.getItem("userId");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);

  // Check subscription validity
  const hasValidPlan = () => {
    try {
      const plans = JSON.parse(
        localStorage.getItem("subscribedPlans") || "[]"
      );

      if (!Array.isArray(plans) || plans.length === 0) {
        return false;
      }

      const currentDate = new Date();

      return plans.some(
        (plan) =>
          plan.endDate &&
          !Number.isNaN(new Date(plan.endDate).getTime()) &&
          new Date(plan.endDate) > currentDate
      );
    } catch (err) {
      console.error("Unable to validate subscription:", err);
      return false;
    }
  };

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `https://api.editezy.com/api/users/allcustomers/${userId}`
      );

      const result = res.data.customers || res.data || [];
      setCustomers(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Unable to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Open add form
  const handleAddClick = () => {
    if (!hasValidPlan()) {
      setShowPopup(true);
      return;
    }

    setEditId(null);
    setForm({ ...INITIAL_FORM });
    setShowModal(true);
  };

  // Open edit form
  const handleEditClick = (customer) => {
    setEditId(customer._id);

    setForm({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      gender: customer.gender || "",
      dob: customer.dob
        ? String(customer.dob).slice(0, 10)
        : "",
      marriageAnniversaryDate: customer.marriageAnniversaryDate
        ? String(customer.marriageAnniversaryDate).slice(0, 10)
        : "",
      address: customer.address || "",
    });

    setShowModal(true);
  };

  // Save customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    try {
      setSaving(true);

      if (editId) {
        await axios.put(
          `https://api.editezy.com/api/users/update-customers/${userId}/${editId}`,
          { customer: form }
        );
      } else {
        await axios.post(
          `https://api.editezy.com/api/users/addcustomer/${userId}`,
          { customer: form }
        );
      }

      setShowModal(false);
      setForm({ ...INITIAL_FORM });
      setEditId(null);

      await fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      alert(
        err.response?.data?.message || "Error saving customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await axios.delete(
        `https://api.editezy.com/api/users/delete-customers/${userId}/${id}`
      );

      setCustomers((previous) =>
        previous.filter((customer) => customer._id !== id)
      );
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert(
        err.response?.data?.message ||
          "Error deleting customer. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      customer.name,
      customer.email,
      customer.mobile,
      customer.address,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  // Date formatter
  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Form field updater
  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8F8FC] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Colorful Header */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-purple-200/50 sm:p-9 lg:p-10">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10 sm:h-72 sm:w-72" />

            <div className="pointer-events-none absolute -bottom-20 right-36 h-48 w-48 rounded-full bg-pink-400/20 blur-3xl" />

            <div className="relative z-10">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <FaArrowLeft size={13} />
                Back
              </button>

              <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold tracking-wider backdrop-blur-sm">
                    <FaWandMagicSparkles size={14} />
                    CUSTOMER WORKSPACE
                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    Customer Management
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-purple-100 sm:text-base">
                    Manage your customer relationships in one place. Keep
                    contact details organized and stay connected with the
                    people who matter to your business.
                  </p>

                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-purple-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                  >
                    <FaPlus size={14} />
                    Add Customer
                    <FiArrowUpRight size={17} />
                  </button>
                </div>

                <div className="hidden shrink-0 items-center justify-center md:flex">
                  <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md lg:h-48 lg:w-48">
                    <div className="flex h-28 w-28 items-center justify-center rounded-[1.7rem] bg-white text-purple-600 shadow-xl lg:h-32 lg:w-32">
                      <FaUserFriends className="h-14 w-14 lg:h-16 lg:w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/70 sm:p-6">
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-blue-100/60 transition-transform group-hover:scale-125" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                  <FiUsers size={25} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Customers
                  </p>
                  <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                    {customers.length}
                  </h2>
                  <p className="mt-1 text-xs text-blue-700">
                    Your customer database
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/70 sm:p-6">
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-emerald-100/60 transition-transform group-hover:scale-125" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-200">
                  <FiUserPlus size={25} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Matching Customers
                  </p>
                  <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                    {filteredCustomers.length}
                  </h2>
                  <p className="mt-1 text-xs text-emerald-700">
                    Based on your search
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Customer List Header */}
          <section className="mt-9">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-purple-600">
                  <FiLayersIcon />
                  YOUR CONTACTS
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  All Customers
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  View, update, and organize your customer information.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchCustomers}
                disabled={loading}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* Search */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-100 sm:max-w-xl">
              <FiSearch className="shrink-0 text-gray-400" size={20} />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, mobile or address..."
                className="w-full min-w-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <FiX size={17} />
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && customers.length === 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white"
                  >
                    <div className="h-24 bg-gradient-to-r from-purple-100 to-blue-100" />
                    <div className="space-y-4 p-5">
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                      <div className="h-3 w-3/4 rounded bg-gray-100" />
                      <div className="h-3 w-2/3 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="mt-0.5 shrink-0 text-red-500" size={21} />
                  <div>
                    <h3 className="font-bold text-red-800">
                      Unable to load customers
                    </h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchCustomers}
                  className="w-fit rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Customer Cards */}
            {!loading && !error && filteredCustomers.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCustomers.map((customer, index) => {
                  const gradients = [
                    "from-violet-500 to-indigo-600",
                    "from-sky-400 to-blue-600",
                    "from-emerald-400 to-teal-600",
                    "from-pink-400 to-rose-600",
                    "from-amber-400 to-orange-500",
                    "from-fuchsia-500 to-purple-600",
                  ];

                  const gradient = gradients[index % gradients.length];

                  return (
                    <article
                      key={customer._id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/60"
                    >
                      {/* Card Header */}
                      <div
                        className={`relative flex min-w-0 items-center gap-3 overflow-hidden bg-gradient-to-br ${gradient} p-5 text-white`}
                      >
                        <div className="absolute -right-5 -top-10 h-28 w-28 rounded-full border-[16px] border-white/10" />

                        <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-xl font-extrabold shadow-lg backdrop-blur-sm">
                          {customer.name?.trim()?.[0]?.toUpperCase() || "?"}
                        </div>

                        <div className="relative z-10 min-w-0 flex-1">
                          <h3 className="break-words text-base font-extrabold sm:text-lg">
                            {customer.name || "Unnamed Customer"}
                          </h3>

                          <p className="mt-1 text-xs text-white/80">
                            Customer #{String(index + 1).padStart(2, "0")}
                          </p>
                        </div>

                        <div className="relative z-10 flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${customer.name || "customer"}`}
                            title="Edit customer"
                            onClick={() => handleEditClick(customer)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white hover:text-emerald-700"
                          >
                            <FaEdit size={15} />
                          </button>

                          <button
                            type="button"
                            aria-label={`Delete ${customer.name || "customer"}`}
                            title="Delete customer"
                            disabled={deletingId === customer._id}
                            onClick={() => deleteCustomer(customer._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === customer._id ? (
                              <FiRefreshCw className="animate-spin" size={15} />
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="flex flex-1 flex-col gap-4 p-5">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FaEnvelope size={14} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Email Address
                            </p>
                            <p className="mt-1 break-all text-sm font-medium text-gray-700">
                              {customer.email || "No email provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FaPhone size={14} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Mobile Number
                            </p>
                            <p className="mt-1 break-words text-sm font-medium text-gray-700">
                              {customer.mobile || "No mobile number"}
                            </p>
                          </div>
                        </div>

                        {customer.gender && (
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                              <FaVenusMars size={15} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Gender
                              </p>
                              <p className="mt-1 text-sm font-medium capitalize text-gray-700">
                                {customer.gender}
                              </p>
                            </div>
                          </div>
                        )}

                        {customer.dob && (
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                              <FaBirthdayCake size={15} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Date of Birth
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-700">
                                {formatDate(customer.dob) || "Not provided"}
                              </p>
                            </div>
                          </div>
                        )}

                        {customer.marriageAnniversaryDate && (
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                              <FiCalendar size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Marriage Anniversary
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-700">
                                {formatDate(customer.marriageAnniversaryDate)}
                              </p>
                            </div>
                          </div>
                        )}

                        {customer.address && (
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <FaMapMarkerAlt size={14} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Address
                              </p>
                              <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                {customer.address}
                              </p>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEditClick(customer)}
                          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50 py-3 text-sm font-bold text-purple-700 transition hover:border-purple-600 hover:bg-purple-600 hover:text-white"
                        >
                          <FaEdit size={14} />
                          Edit Customer Details
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredCustomers.length === 0 && (
              <div className="mt-6 rounded-3xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm sm:px-8 sm:py-16">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600">
                  {search ? (
                    <FiSearch size={32} />
                  ) : (
                    <FaUserFriends size={32} />
                  )}
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-gray-900">
                  {search ? "No matching customers" : "No customers yet"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {search
                    ? "Try another search term to find the customer you are looking for."
                    : "Start building your customer database by adding your first customer."}
                </p>

                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-6 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <FaPlus size={13} />
                    Add Your First Customer
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-5 py-6 text-white sm:px-8">
              <div className="absolute -right-5 -top-10 h-32 w-32 rounded-full border-[18px] border-white/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                    {editId ? (
                      <FaEdit size={21} />
                    ) : (
                      <FaUserFriends size={21} />
                    )}
                  </div>

                  <div>
                    <h2
                      id="customer-modal-title"
                      className="text-xl font-extrabold sm:text-2xl"
                    >
                      {editId ? "Edit Customer" : "Add New Customer"}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-purple-100 sm:text-sm">
                      {editId
                        ? "Update your customer's information."
                        : "Enter the details to add a new customer."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close modal"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-8">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Enter customer's full name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    required
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
                    <FaPhone className="shrink-0 text-emerald-500" size={14} />

                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={form.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      className="w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                    <FiMail className="shrink-0 text-blue-500" size={17} />

                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Gender
                  </label>

                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* DOB */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Date of Birth
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-50">
                    <FaBirthdayCake
                      className="shrink-0 text-amber-500"
                      size={15}
                    />

                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => updateField("dob", e.target.value)}
                      className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Anniversary */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Marriage Anniversary
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-rose-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-50">
                    <FiCalendar className="shrink-0 text-rose-500" size={17} />

                    <input
                      type="date"
                      value={form.marriageAnniversaryDate}
                      onChange={(e) =>
                        updateField(
                          "marriageAnniversaryDate",
                          e.target.value
                        )
                      }
                      className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Address
                  </label>

                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50">
                    <FaMapMarkerAlt
                      className="mt-3.5 shrink-0 text-violet-500"
                      size={15}
                    />

                    <textarea
                      rows={2}
                      placeholder="Enter customer address (optional)"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="w-full resize-y bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editId ? (
                        <FaEdit size={14} />
                      ) : (
                        <FaPlus size={14} />
                      )}
                      {editId ? "Update Customer" : "Save Customer"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Upgrade Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowPopup(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close popup"
              onClick={() => setShowPopup(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            >
              <FiX size={19} />
            </button>

            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-sm">
              <div className="absolute inset-0 rounded-3xl border border-amber-200/70" />
              <FiLock size={31} />
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
              <FaWandMagicSparkles size={12} />
              Premium Feature
            </div>

            <h2
              id="premium-title"
              className="text-xl font-extrabold text-gray-900 sm:text-2xl"
            >
              Unlock Customer Management
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Add and manage your customers with contact details and
              convenient organization tools. Upgrade your plan to access
              customer management.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Maybe Later
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  window.location.href = "/home";
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Upgrade Now
                <FiArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Small section icon
const FiLayersIcon = () => (
  <FiUsers size={16} />
);

export default CustomerPage;
