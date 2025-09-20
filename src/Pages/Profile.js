import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaUser, FaClipboardList } from "react-icons/fa";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      fetchProfile(id);
    }
  }, []);

  const fetchProfile = (id) => {
    axios
      .get(`https://api.editezy.com/api/users/get-profile/${id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!newImage) return alert("Please select an image");
    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("profileImage", newImage);

    try {
      setLoading(true);
      await axios.put(
        `https://api.editezy.com/api/users/edit-profile/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Profile image updated!");
      setNewImage(null);
      setImagePreview(null);
      fetchProfile(userId);
    } catch (error) {
      console.error("Error uploading profile image", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Section with Back Arrow */}
        <div className="bg-indigo-600 text-white p-6 md:p-8 flex items-center gap-4">
          <FaArrowLeft className="cursor-pointer" onClick={() => window.history.back()} />
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        </div>

        <div className="p-6 md:p-8">
          {/* Profile Image Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="relative">
              <img
                src={imagePreview || profile.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full cursor-pointer shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold">Welcome Back!</h2>
              <p className="mt-2 text-black-600">{profile.name}</p>
              <p className="text-blue-600">Manage your profile settings</p>

              {newImage && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Uploading..." : "Save New Image"}
                </button>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Account Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaUser /> Account Information
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                <span className="text-gray-600 font-medium">Mobile Number</span>
                <span className="text-gray-800 font-semibold mt-1 sm:mt-0">{profile.mobile || "-"}</span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Subscription Details Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaClipboardList /> Subscription Details
            </h2>

            {profile.subscribedPlans.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                {(() => {
                  const plan = profile.subscribedPlans[0];
                  return (
                    <div>
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            plan.isPurchasedPlan ? "bg-green-500" : "bg-gray-400"
                          } mr-2`}
                        ></div>
                        <span className="text-sm font-medium">{plan.isPurchasedPlan ? "Active" : "Inactive"}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-sm">Current Plan</span>
                          <span className="text-gray-800 font-semibold">{plan.name}</span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-gray-600 text-sm">Expires On</span>
                          <span className="text-gray-800 font-semibold">
                            {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : "-"}
                          </span>
                        </div>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm block mb-1">Features:</span>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {plan.features.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">No active subscription plans</p>
                <button className="mt-3 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  Browse Plans
                </button>
              </div>
            )}
          </div>

          {/* Additional Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Personal Details</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">DOB:</span> {profile.dob || "-"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Anniversary:</span> {profile.marriageAnniversaryDate || "-"}
              </p>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
