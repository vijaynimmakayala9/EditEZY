import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.editezy.com/api/users/verify-otp",
        { userId, otp }
      );

      if (response.status === 200) {
        const { user } = response.data;
        const { _id, name, mobile } = user;

        localStorage.setItem("userId", _id);
        localStorage.setItem("userName", name);
        localStorage.setItem("userMobile", mobile);
        console.log("userId", _id, );
        console.log("Name", name, );
        console.log("mobile", mobile, );

        navigate("/home");
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side Image / Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-indigo-600 items-center justify-center p-8">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-lg opacity-90">
              Enter your OTP to continue creating amazing content
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center md:text-left">
            Verify OTP
          </h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter OTP"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Didn't receive OTP?{" "}
            <button
              type="button"
              className="text-indigo-600 font-medium hover:text-indigo-500"
              onClick={() => navigate("/")}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;