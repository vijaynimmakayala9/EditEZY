
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTools,
  FaUserCircle,
  FaHeadset,
  FaArrowLeft,
  FaShieldAlt,
  FaFileContract,
  FaSignOutAlt,
  FaUndoAlt,
} from "react-icons/fa";
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
import Navbar from "./Navbar";

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
        (plan) => plan?.endDate && new Date(plan.endDate) > currentDate
      );
    } catch {
      return false;
    }
  };

  const tools = [
    {
      name: "Background Remover",
      desc: "Remove image backgrounds instantly",
      route: "/backgroundremoval",
      icon: <FaImage />,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      name: "Caption Generator",
      desc: "Generate engaging captions",
      route: "#",
      icon: <FaWandMagicSparkles />,
      color: "from-emerald-500 to-green-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      comingSoon: true,
    },
    {
      name: "WhatsApp Stickers",
      desc: "Create custom stickers",
      route: "#",
      icon: <FaNoteSticky />,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
      iconColor: "text-pink-600",
      comingSoon: true,
    },
  ];

  const account = [
    {
      name: "My Profile",
      desc: "Manage your personal information",
      route: "/profile",
      icon: <FaUser />,
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      name: "Refer & Earn",
      desc: "Invite friends and earn rewards",
      route: "/referpage",
      icon: <FaGift />,
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      name: "Add Customers",
      desc: "Manage your customer database",
      route: "/customer",
      icon: <FaUsers />,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      name: "Create Invoice",
      desc: "Generate professional invoices",
      route: "/invoice",
      icon: <FaFileInvoice />,
      color: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      name: "Add Business",
      desc: "Register your business profile",
      route: "/businesscard",
      icon: <FaBuilding />,
      color: "from-indigo-500 to-blue-600",
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      name: "Delete Account",
      desc: "Permanently remove your account",
      route: "/delete-account",
      icon: <FaTrash />,
      color: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  const support = [
    {
      name: "Contact Support",
      desc: "Get help from our team",
      route: "/contact",
      icon: <FaEnvelope />,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      name: "Privacy Policy",
      desc: "Read our privacy guidelines",
      route: "https://editezy.onrender.com/privacy-and-policy",
      icon: <FaShieldAlt />,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      name: "Terms & Conditions",
      desc: "View terms and conditions",
      route: "https://editezy.onrender.com/terms-and-conditions",
      icon: <FaFileContract />,
      color: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      name: "Cancellation & Refund Policy",
      desc: "Understand our refund and cancellation terms",
      route: "https://editezy.onrender.com/cancel-refund",
      icon: <FaUndoAlt />,
      color: "from-rose-500 to-red-500",
      bg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  const getItems = () => {
    if (activeTab === "Tools") return tools;
    if (activeTab === "Support") return support;
    return account;
  };

  const handleItemClick = (item) => {
    // Tools and Support are always accessible.
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

    // Premium plan is required for account features,
    // except My Profile and Refer & Earn.
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

  const tabs = [
    { name: "Tools", icon: <FaTools /> },
    { name: "Account", icon: <FaUserCircle /> },
    { name: "Support", icon: <FaHeadset /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userMobile");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("subscribedPlans");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full pb-12 overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Page Header */}
        <header className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:mb-8 sm:gap-4 sm:p-5">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:h-12 sm:w-12"
          >
            <FaArrowLeft className="text-base sm:text-lg" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              My Dashboard
            </h1>
            <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
              Manage your account, tools and support
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 sm:h-12 sm:w-12"
          >
            <FaSignOutAlt className="text-base sm:text-lg" />
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          {/* Sidebar / User Profile */}
          <aside className="min-w-0">
            {activeTab === "Account" && (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-4 text-left text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl sm:p-5 lg:flex-col lg:items-start lg:p-6"
              >
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-2xl font-bold shadow-inner sm:h-16 sm:w-16 sm:text-3xl lg:h-20 lg:w-20 lg:text-4xl">
                  {(userName.trim().charAt(0) || "U").toUpperCase()}
                </div>

                <div className="relative min-w-0 flex-1 lg:w-full">
                  <p className="text-xs font-medium uppercase tracking-widest text-blue-100">
                    Welcome back
                  </p>
                  <h2 className="mt-1 break-words text-lg font-bold sm:text-xl">
                    {userName}
                  </h2>
                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    Manage your profile
                  </p>
                </div>

                <span className="relative shrink-0 text-xl transition-transform group-hover:translate-x-1 lg:absolute lg:right-5 lg:top-5">
                  &rarr;
                </span>
              </button>
            )}

            {/* Responsive Tabs */}
            <nav
              aria-label="Dashboard sections"
              className={`mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm sm:mt-5 sm:gap-3 sm:p-3 lg:mt-5 ${
                activeTab === "Account" ? "" : "lg:mt-0"
              }`}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.name;

                return (
                  <button
                    type="button"
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    aria-pressed={isActive}
                    className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-3 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:gap-2 sm:py-4 sm:text-sm ${
                      isActive
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{tab.icon}</span>
                    <span className="break-words">{tab.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Helpful Note */}
            <div className="mt-4 hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-4 lg:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <FaUserCircle />
                Your workspace
              </div>
              <p className="mt-2 text-xs leading-5 text-blue-800/80">
                Access your account features, creative tools and support
                resources from one place.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 sm:mb-5">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                  {activeTab === "Account"
                    ? "Account Settings"
                    : activeTab === "Tools"
                    ? "Creative Tools"
                    : "Help & Support"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  {activeTab === "Account"
                    ? "Everything you need to manage your account."
                    : activeTab === "Tools"
                    ? "Explore tools to simplify your creative workflow."
                    : "Find information and get the help you need."}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
                {getItems().length} items
              </span>
            </div>

            {/* Responsive Card Grid */}
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {getItems().map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleItemClick(item)}
                  className="group flex min-h-[104px] min-w-0 items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:min-h-[120px] sm:gap-4 sm:p-4 lg:p-5"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.iconColor} transition duration-200 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl`}
                  >
                    <span className="text-lg sm:text-xl">{item.icon}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-bold leading-5 text-gray-900 transition group-hover:text-blue-700 sm:text-base sm:leading-6">
                      {item.name}
                    </h3>

                    <p className="mt-1 break-words text-xs leading-5 text-gray-500 sm:text-sm">
                      {item.desc}
                    </p>

                    {item.comingSoon && (
                      <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 sm:text-[11px]">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <span className="shrink-0 text-lg text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600">
                    &rsaquo;
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile-Friendly Footer */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-center shadow-sm sm:mt-8 sm:px-6">
              <p className="text-xs leading-5 text-gray-500 sm:text-sm">
                Need assistance?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="font-semibold text-blue-600 underline-offset-4 hover:underline"
                >
                  Contact our support team
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Responsive Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-modal-title"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            <div className="p-5 sm:p-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-16 sm:w-16">
                <svg
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>

              <h2
                id="dashboard-modal-title"
                className="mt-4 break-words text-center text-lg font-extrabold leading-7 text-gray-900 sm:mt-5 sm:text-xl"
              >
                {modalText}
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-gray-500">
                Upgrade your plan to unlock premium features and get more
                from your workspace.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="min-h-11 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    navigate("/home");
                  }}
                  className="min-h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
