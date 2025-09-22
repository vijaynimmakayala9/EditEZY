import React, { useState, useEffect } from "react";
import { FaGift, FaClipboard, FaShareAlt, FaCheckCircle, FaUserFriends, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const ReferAndPay = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("G0ZD178W");
  const [userId, setUserId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to manage modal visibility
  const navigate = useNavigate();

  useEffect(() => {
    // Show the modal on refresh (could add condition if needed, like check if already shown or not)
    setIsModalOpen(true);

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const referralLink = `https://your-app.com/referral/${referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: "Join our platform!",
        text: `Use my referral code: ${referralCode} to get benefits.`,
        url: referralLink,
      });
    } else {
      alert(`Share this link: ${referralLink}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);  // Close the modal when clicked outside or on close button
  };

  return (
    <>
      <Navbar />

      {/* Modal for Refer and Earn */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}  // Prevent modal from closing when clicking inside
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 p-2 rounded-md">
                  <FaGift className="text-white text-xl" />
                </span>
                <h2 className="text-white text-lg font-semibold">Refer and Earn</h2>
              </div>

              <button onClick={closeModal} className="text-white text-2xl font-bold">
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Top Balance Card */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-5 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Earn Now</h2>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">₹100</p>
                    <p className="text-xs opacity-80">Total Earning till date</p>
                  </div>
                  <div className="text-center flex-1 border-l border-white border-opacity-20">
                    <p className="text-2xl font-bold">₹100</p>
                    <p className="text-xs opacity-80">Current Balance</p>
                  </div>
                </div>
                <button className="w-full bg-white text-purple-600 font-semibold py-3 rounded-lg shadow hover:bg-gray-100 transition-colors">
                  Redeem Now
                </button>
              </div>

              {/* Referral Code Box */}
              <div className="flex flex-col sm:flex-row items-center bg-purple-50 rounded-lg p-3 sm:p-4 justify-between gap-3 sm:gap-0 mt-6">
                <div className="flex items-center space-x-2">
                  <FaGift className="text-purple-600 text-xl sm:text-2xl" />
                  <p className="font-mono text-base sm:text-lg font-semibold break-all">
                    {referralCode}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
                    aria-label="Copy referral code"
                  >
                    {copied ? (
                      <FaCheckCircle className="text-green-500 text-lg sm:text-xl" />
                    ) : (
                      <FaClipboard className="text-gray-600 text-lg sm:text-xl" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-1 hover:bg-purple-700 transition-colors text-sm sm:text-base"
                  >
                    <FaShareAlt className="text-sm sm:text-base" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Info Text */}
              <p className="text-xs sm:text-sm text-gray-600 mt-3 text-center sm:text-left">
                Did you know you can earn up to ₹3000 by referring 10 friends in a
                month? That's equal to a month's subscription.
              </p>

              {/* Bonus Info */}
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-5 shadow-md mt-6 border border-indigo-100">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-600 p-2 rounded-full">
                    <FaUserFriends className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-1">
                      Introduce a Friend & Get Rewards!
                    </h4>
                    <p className="text-sm text-gray-700">
                      Get <span className="font-semibold text-purple-600">30 Credit</span>{" "}
                      INSTANTLY! Bonus: Get{" "}
                      <span className="font-semibold text-purple-600">50 Credit</span>{" "}
                      More When They Make a Purchase!
                    </p>
                  </div>
                </div>
              </div>

              {/* How it Works Section */}
              <div className="mt-6 bg-white rounded-xl p-5 shadow-md">
                <h4 className="font-semibold text-lg mb-4 text-gray-800">How it works</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full mt-1">
                      <span className="text-purple-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Invite a friend</p>
                      <p className="text-sm text-gray-600">
                        Share your code using the Share button.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full mt-1">
                      <span className="text-purple-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Friend signs up</p>
                      <p className="text-sm text-gray-600">
                        They enter your code during signup or in settings.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full mt-1">
                      <span className="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Both get rewards</p>
                      <p className="text-sm text-gray-600">
                        Credits are added after successful first purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row justify-center sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  onClick={handleCopy}
                  className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaClipboard className="text-gray-600" />
                  )}
                  <span className="text-sm font-medium">Copy Code</span>
                </button>
                <button
                  onClick={handleShare}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors"
                >
                  <FaShareAlt className="text-sm" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferAndPay;
