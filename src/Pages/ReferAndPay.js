import React, { useState } from "react";
import { FaGift, FaClipboard, FaShareAlt, FaCheckCircle } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";

const ReferModal = ({ isOpen, onClose, referralCode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const referralLink = `https://editezy.com/`;
    const shareMessage = `
        🎉 Join me on our amazing app and get instant rewards! 🎉

        Use my referral code: ${referralCode}

        
        Download the app now and start earning!

        #ReferAndEarn #InstantRewards
        ${referralLink}
        `;

    if (navigator.share) {
      navigator.share({
        title: "Join our platform!",
        text: shareMessage,
        url: referralLink,
      });
    } else {
      alert(`Share this link with your friends:\n\n${shareMessage}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 p-2 rounded-md">
              <FaGift className="text-white text-xl" />
            </span>
            <h2 className="text-white text-lg font-semibold">Refer and Earn</h2>
          </div>
          <button onClick={onClose} className="text-white text-2xl font-bold">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-yellow-100 text-yellow-900 text-sm font-medium px-4 py-3 rounded-lg flex items-center justify-center">
            <span className="mr-2">💰</span>
            Earn ₹200 when a friend upgrades
          </div>

          {/* Referral Code */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Your Referral Code
            </h3>
            <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 mx-auto max-w-xs">
              <p className="text-lg font-bold tracking-wider text-gray-800 font-mono">
                {referralCode}
              </p>
              <button
                onClick={handleCopy}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-xl p-5 shadow-md">
            <h4 className="font-semibold text-lg mb-4 text-gray-800">
              How it works
            </h4>
            <div className="space-y-4 text-sm">
              {[{
                step: 1,
                title: "Share your code",
                desc: "Send your referral code to friends"
              }, {
                step: 2,
                title: "Friend signs up",
                desc: "They use your code during registration"
              }].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full mt-1">
                    <span className="text-purple-600 font-bold text-sm">{step}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{title}</p>
                    <p className="text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center sm:space-x-3 space-y-3 sm:space-y-0">
            <button
              onClick={handleCopy}
              className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm hover:bg-gray-50 flex items-center justify-center space-x-2 transition"
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
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-purple-700 transition"
            >
              <FaShareAlt className="text-sm" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferModal;
