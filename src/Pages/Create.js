import React, { useState } from "react";
import { FaPalette } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const CreativeStudio = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");

  // ✅ Check plan validity from localStorage
  const hasValidPlan = () => {
    const plans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (plans.length === 0) return false;

    const currentDate = new Date();
    return plans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  const tools = [
    {
      title: "Create Template",
      description: "Design custom posts with templates",
      iconBg: "bg-blue-100",
      icon: "🟦",
      route: "/custom",
    },
    {
      title: "Logo Design",
      description: "Create professional logos",
      iconBg: "bg-green-100",
      icon: "✏️",
      route: "/logo",
    },
    {
      title: "Image to Video",
      description: "Transform images into videos",
      iconBg: "bg-purple-100",
      icon: "🎥",
      route: "#", // Coming soon
    },
  ];

  const handleToolClick = (tool) => {
    // Coming soon tool → show modal always
    if (tool.route === "#") {
      setModalText(`${tool.title} is coming soon!`);
      setShowModal(true);
      return;
    }

    // ✅ Check plan validity
    if (!hasValidPlan()) {
      // Show popup to upgrade
      setModalText(
        `You need a premium plan to use "${tool.title}". Upgrade now to access it!`
      );
      setShowModal(true);
    } else {
      navigate(tool.route);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-5 mb-5">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-6 relative overflow-hidden">
          <div>
            <h1 className="text-2xl font-bold">Creative Studio</h1>
            <p className="mt-2 text-sm opacity-90">
              Create stunning designs with professional tools
            </p>
            <button
              onClick={() => {
                if (!hasValidPlan()) {
                  setModalText(
                    "You need a premium plan to create a poster. Upgrade now!"
                  );
                  setShowModal(true);
                } else {
                  navigate("/custom");
                }
              }}
              className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
            >
              Create Poster
            </button>
          </div>
          <div className="absolute top-5 right-5 bg-white bg-opacity-20 p-3 rounded-full">
            <FaPalette size={24} />
          </div>
        </div>

        {/* Choose Tool */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Choose Your Tool</h2>
          <p className="text-gray-500 text-sm">
            Select from our professional design tools
          </p>

          <div className="mt-4 space-y-4">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl shadow flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                onClick={() => handleToolClick(tool)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-xl ${tool.iconBg}`}
                  >
                    <span className="text-2xl">{tool.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{tool.title}</h3>
                    <p className="text-gray-500 text-sm">{tool.description}</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400" size={22} />
              </div>
            ))}
          </div>
        </div>

        {/* Popup Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <div className="flex justify-center mb-3">
                <svg
                  className="w-12 h-12 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {modalText}
              </h2>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate("/plans");
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreativeStudio;
