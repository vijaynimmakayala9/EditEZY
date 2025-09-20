import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [marriageAnniversaryDate, setMarriageAnniversaryDate] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check screen size and update state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile || !dob) {
      setError("Name, Mobile, and Date of Birth are required.");
      return;
    }

    try {
      const response = await axios.post(
        "https://api.editezy.com/api/users/register",
        { name, email, mobile, dob, marriageAnniversaryDate, referralCode }
      );

      if (response.status === 201) {
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed.");
    }
  };

  // Desktop Layout (shown on screens 768px and wider)
  const DesktopLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Illustration */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Creative Community</h2>
            <p className="mb-6">Sign up today to access exclusive features and content</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
              <img
                src="https://tse1.mm.bing.net/th/id/OIP.tmAZhRsXj4wCMaCSRzVqSQHaGl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Creative Community"
                className="rounded-lg shadow-lg mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join our creative community today</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="marriageAnniversaryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Marriage Anniversary (Optional)
              </label>
              <input
                type="date"
                id="marriageAnniversaryDate"
                value={marriageAnniversaryDate}
                onChange={(e) => setMarriageAnniversaryDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter referral code (if any)"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-md"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/" className="text-blue-600 font-medium hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Layout (shown on screens smaller than 768px)
  const MobileLayout = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-100">Join our creative community today</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Full Name</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Address */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Email Address (Optional)</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            {/* Mobile Number */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Mobile Number</h2>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Date of Birth</h2>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Referral Code */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Referral Code (Optional)</h2>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter referral code"
              />
            </div>

            {/* Marriage Anniversary */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Marriage Anniversary (Optional)</h2>
              <input
                type="date"
                value={marriageAnniversaryDate}
                onChange={(e) => setMarriageAnniversaryDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl font-bold text-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition mt-2"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/" className="text-blue-600 font-semibold hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the appropriate layout based on screen size
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default RegisterPage;