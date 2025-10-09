import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTools, FaUserCircle, FaHeadset, FaArrowLeft, FaShieldAlt, FaFileContract, FaSignOutAlt, FaUndoAlt } from "react-icons/fa";
import {
  FaUser,
  FaGift,
  FaUsers,
  FaFileInvoice,
  FaBuilding,
  FaTrash,
  FaEnvelope,
  FaWandMagicSparkles,
  FaNoteSticky,
  FaImage,
} from "react-icons/fa6";
import Navbar from './Navbar';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Account");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("userId") || "9573817475";
    const name = localStorage.getItem("userName") || "Julee Perween";
    setUserId(id);
    setUserName(name);
  }, []);

  // ✅ Check plan validity from localStorage
  const hasValidPlan = () => {
    const plans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (plans.length === 0) return false;

    const currentDate = new Date();
    return plans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  // Tools tab items
  const tools = [
    {
      name: "Background Remover",
      desc: "Remove image backgrounds instantly",
      route: "/backgroundremoval",
      icon: <FaImage className="text-blue-500" />,
    },
    {
      name: "Caption Generator",
      desc: "Generate engaging captions",
      route: "#",
      icon: <FaWandMagicSparkles className="text-green-500" />,
      comingSoon: true,
    },
    {
      name: "WhatsApp Stickers",
      desc: "Create custom stickers",
      route: "#",
      icon: <FaNoteSticky className="text-pink-500" />,
      comingSoon: true,
    },
  ];

  // Account tab items
  const account = [
    {
      name: "My Profile",
      desc: "Manage your personal information",
      route: "/profile",
      icon: <FaUser className="text-blue-500" />,
    },
    {
      name: "Refer & Earn",
      desc: "Invite friends and earn rewards",
      route: "/referpage",
      icon: <FaGift className="text-yellow-500" />,
    },
    {
      name: "Add Customers",
      desc: "Manage your customer database",
      route: "/customer",
      icon: <FaUsers className="text-green-500" />,
    },
    {
      name: "Create Invoice",
      desc: "Generate professional invoices",
      route: "/invoice",
      icon: <FaFileInvoice className="text-purple-500" />,
    },
    {
      name: "Add Business",
      desc: "Register your business profile",
      route: "/businesscard",
      icon: <FaBuilding className="text-indigo-500" />,
    },
    {
      name: "Delete Account",
      desc: "Permanently remove your account",
      route: "/delete-account",
      icon: <FaTrash className="text-red-500" />,
    },
  ];

  // Support tab items
  const support = [
  {
    name: "Contact Support",
    desc: "Get help from our team",
    route: "/contact",
    icon: <FaEnvelope className="text-green-500" />,
  },
  {
    name: "Privacy Policy",
    desc: "Read our privacy guidelines",
    route: "https://editezy.onrender.com/privacy-and-policy",
    icon: <FaShieldAlt className="text-blue-500" />,
  },
  {
    name: "Terms & Conditions",
    desc: "View terms and conditions",
    route: "https://editezy.onrender.com/terms-and-conditions",
    icon: <FaFileContract className="text-purple-500" />,
  },
  {
    name: "Cancellation & Refund Policy",
    desc: "Understand our refund and cancellation terms",
    route: "https://editezy.onrender.com/cancel-refund",
    icon: <FaUndoAlt className="text-red-500" />,
  },
];

console.log(userId)
  const getItems = () => {
    if (activeTab === "Tools") return tools;
    if (activeTab === "Support") return support;
    return account;
  };

  // Handle item click
  const handleItemClick = (item) => {
    // Tools & Support → always accessible
    if (activeTab === "Tools" || activeTab === "Support") {
      if (item.comingSoon) {
        setModalText(`${item.name} is coming soon!`);
        setShowModal(true);
      } else if (item.route.startsWith("http")) {
        window.open(item.route, "_blank", "noopener,noreferrer");
      } else {
        navigate(item.route);
      }
      return;
    }

    // Account → check plan validity except My Profile & Refer & Earn
    if (
      !hasValidPlan() &&
      item.name !== "My Profile" &&
      item.name !== "Refer & Earn"
    ) {
      setModalText(
        `You need a premium plan to access "${item.name}". Upgrade now!`
      );
      setShowModal(true);
      return;
    }

    if (item.route.startsWith("http")) {
      window.open(item.route, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.route);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-md mx-auto mb-5">
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-lg">
          {/* Back Button */}
          <button
            onClick={() => navigate('/home')}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2 text-xl" />
          </button>

          {/* Title */}
          <h1 className="text-xl font-bold text-center flex-1">Dashboard</h1>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("userId");
              localStorage.removeItem("userName");
              localStorage.removeItem("userMobile");
              localStorage.removeItem("userEmail");
              localStorage.removeItem("subscribedPlans");
              navigate("/");
            }}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <FaSignOutAlt className="mr-2 text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-around mb-4">
          {[
            { name: "Tools", icon: <FaTools /> },
            { name: "Account", icon: <FaUserCircle /> },
            { name: "Support", icon: <FaHeadset /> },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex-1 mx-1 py-2 rounded-md font-medium flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${activeTab === tab.name
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-sm">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Blue Card for User */}
        {activeTab === "Account" && (
          <div
            className="bg-blue-500 rounded-xl shadow-md p-4 flex items-center space-x-3 text-white cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center text-blue-500 font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{userName}</h2>
              {/* <p className="font-semibold text-xs">{userId}</p> */}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="mt-4 space-y-3">
          {getItems().map((item, i) => (
            <div
              key={i}
              className="rounded-xl shadow-md border p-3 bg-white hover:bg-gray-50 transition cursor-pointer flex items-center gap-3"
              onClick={() => handleItemClick(item)}
            >
              {item.icon}
              <div>
                <h2 className="font-semibold text-lg">{item.name}</h2>
                {item.desc && (
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-900/40 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border border-white/30 flex flex-col items-center space-y-4 animate-modal-in">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-blue-400"
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

            <h2 className="text-xl font-bold text-center text-black drop-shadow-md">
              {modalText}
            </h2>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors backdrop-blur-sm shadow-md font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/home");
                }}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-500/60 transition-colors backdrop-blur-sm shadow-md font-semibold"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
