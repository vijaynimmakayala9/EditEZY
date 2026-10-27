
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaClipboardList,
  FaCamera,
  FaCalendarAlt,
  FaMobileAlt,
  FaCrown,
  FaCheckCircle,
  FaArrowRight,
  FaSpinner,
  FaImage,
  FaExclamationCircle,
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId");

    if (id) {
      fetchProfile(id);
    } else {
      setError("User information not found. Please log in again.");
      setFetching(false);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      setFetching(true);
      setError("");

      const res = await axios.get(
        `https://api.editezy.com/api/users/get-profile/${id}`
      );

      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Unable to load your profile. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("");
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice("");
      setError("Please select an image smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setNotice("");
    setNewImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.onerror = () => {
      setError("Unable to preview this image. Please try another file.");
    };

    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!newImage) {
      setError("Please select an image first.");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", newImage);

    try {
      setLoading(true);
      setError("");
      setNotice("");

      await axios.put(
        `https://api.editezy.com/api/users/edit-profile/${userId}`,
        formData
      );

      setNewImage(null);
      setImagePreview(null);
      setNotice("Your profile image has been updated successfully.");

      await fetchProfile(userId);
    } catch (err) {
      console.error("Error uploading profile image:", err);
      setError(
        err.response?.data?.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const plans = Array.isArray(profile?.subscribedPlans)
    ? profile.subscribedPlans
    : [];

  const currentPlan = plans[0];

  const isPlanActive = (plan) =>
    Boolean(
      plan?.isPurchasedPlan &&
        plan?.endDate &&
        new Date(plan.endDate) > new Date()
    );

  const activePlan = plans.find(isPlanActive);
  const displayPlan = activePlan || currentPlan;

  const profileImage =
    imagePreview || profile?.profileImage || "/default-avatar.png";

  // Loading screen
  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-lg sm:p-8">
          <FaExclamationCircle className="mx-auto text-4xl text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Profile unavailable
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            {error || "Something went wrong while loading your profile."}
          </p>

          <button
            type="button"
            onClick={() => {
              const id = localStorage.getItem("userId");
              if (id) fetchProfile(id);
            }}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-3 w-full rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:h-12 sm:w-12"
          >
            <FaArrowLeft />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              My Profile
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Manage your personal information and subscription
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 sm:text-sm">
            <FaUser />
            <span className="hidden min-[380px]:inline">My Account</span>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 pt-5 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <FaExclamationCircle className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 break-words">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 font-bold"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <FaCheckCircle className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 break-words">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="shrink-0 font-bold"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-indigo-900/10 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl sm:h-72 sm:w-72" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={profileImage}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.png";
                }}
                className="h-28 w-28 rounded-full border-4 border-white/80 bg-white/20 object-cover shadow-xl sm:h-36 sm:w-36 lg:h-40 lg:w-40"
              />

              <label
                htmlFor="profile-upload"
                title="Change profile photo"
                className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-600 bg-white text-indigo-700 shadow-lg transition hover:scale-105 hover:bg-indigo-50 sm:h-11 sm:w-11"
              >
                <FaCamera className="text-base" />
              </label>

              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-50">
                <FaCheckCircle />
                Personal Account
              </span>

              <h2 className="mt-3 break-words text-2xl font-extrabold sm:text-3xl lg:text-4xl">
                {profile.name || "Welcome!"}
              </h2>

              <p className="mt-2 break-words text-sm leading-6 text-indigo-100 sm:text-base">
                Manage your profile, personal details and plan information.
              </p>

              {newImage && (
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
                  <p className="max-w-full break-all text-xs text-indigo-100">
                    {newImage.name}
                  </p>

                  <div className="flex w-full flex-col gap-2 min-[380px]:w-auto min-[380px]:flex-row">
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={loading}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          Save Image
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setNewImage(null);
                        setImagePreview(null);
                        setError("");
                      }}
                      className="min-h-11 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!newImage && (
                <p className="mt-3 text-xs text-indigo-100">
                  <FaImage className="mr-1 inline" />
                  JPG, PNG or other image formats, up to 5 MB
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Main Responsive Layout */}
        <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 lg:mt-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-7">
          {/* Account Information */}
          <section className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg text-blue-600 sm:h-12 sm:w-12">
                <FaUser />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Account Information
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Your registered account details
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <FaMobileAlt />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Mobile Number
                  </p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                    {profile.mobile || "-"}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <FaCalendarAlt />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Date of Birth
                  </p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                    {formatDate(profile.dob)}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                  <FaCalendarAlt />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Marriage Anniversary
                  </p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                    {formatDate(profile.marriageAnniversaryDate)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Subscription Details */}
          <section className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-lg text-amber-600 sm:h-12 sm:w-12">
                <FaClipboardList />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Subscription
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Your plan and membership details
                </p>
              </div>
            </div>

            {displayPlan ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-amber-500 shadow-sm sm:h-12 sm:w-12">
                      <FaCrown />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        Current Plan
                      </p>

                      <h3 className="mt-1 break-words text-lg font-extrabold text-slate-900 sm:text-xl">
                        {displayPlan.name || "Subscription Plan"}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${
                        isPlanActive(displayPlan)
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPlanActive(displayPlan)
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {isPlanActive(displayPlan) ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
                  <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                      Plan Name
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                      {displayPlan.name || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                      Expires On
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                      {formatDate(displayPlan.endDate)}
                    </p>
                  </div>
                </div>

                {Array.isArray(displayPlan.features) &&
                  displayPlan.features.length > 0 && (
                    <div className="border-t border-slate-100 p-4 sm:p-5">
                      <h4 className="mb-3 text-sm font-bold text-slate-800">
                        Included Features
                      </h4>

                      <ul className="space-y-2">
                        {displayPlan.features.map((feature, index) => (
                          <li
                            key={`${feature}-${index}`}
                            className="flex min-w-0 items-start gap-2 text-sm leading-5 text-slate-600"
                          >
                            <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
                            <span className="min-w-0 break-words">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {!isPlanActive(displayPlan) && (
                  <div className="border-t border-slate-100 p-4">
                    <p className="text-sm leading-6 text-slate-500">
                      Your displayed plan is not currently active. Explore
                      available plans to continue using premium features.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/plans")}
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      Browse Plans <FaArrowRight />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center sm:px-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-500">
                  <FaCrown />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No Subscription Found
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Choose a plan to unlock premium features and tools.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/plans")}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
                >
                  Browse Plans <FaArrowRight />
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-6 rounded-2xl border border-slate-100 bg-white px-4 py-5 text-center shadow-sm sm:mt-8 sm:px-6">
          <p className="text-xs leading-5 text-slate-500 sm:text-sm">
            Need help with your account?{" "}
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="font-semibold text-indigo-600 underline-offset-4 hover:underline"
            >
              Contact Support
            </button>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Profile;
