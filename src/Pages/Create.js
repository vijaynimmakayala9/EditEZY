
import React, { useState } from "react";
import { FaPalette } from "react-icons/fa";
import {
  FiChevronRight,
  FiCheckCircle,
  FiLock,
  FiArrowUpRight,
  FiX,
  FiSparkles,
  FiLayers,
} from "react-icons/fi";
import { FaWandMagicSparkles } from "react-icons/fa6";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const CreativeStudio = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalType, setModalType] = useState("upgrade");

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
    } catch (error) {
      console.error("Unable to validate subscription:", error);
      return false;
    }
  };

  // Creative tools
  const tools = [
    {
      title: "Create Template",
      description:
        "Design eye-catching posts with customizable templates.",
      icon: "🟦",
      route: "/custom",
      tag: "Popular",
      number: "01",
      gradient: "from-blue-500 via-indigo-500 to-violet-600",
      lightBg: "bg-blue-50",
      accent: "text-blue-700",
      glow: "hover:shadow-blue-200/70",
    },
    {
      title: "Logo Design",
      description:
        "Create a distinctive logo for your brand or business.",
      icon: "✏️",
      route: "/logo",
      tag: "Creative",
      number: "02",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      lightBg: "bg-emerald-50",
      accent: "text-emerald-700",
      glow: "hover:shadow-emerald-200/70",
    },
    {
      title: "Image to Video",
      description:
        "Bring your images to life with video creation tools.",
      icon: "🎥",
      route: "#",
      tag: "Coming Soon",
      number: "03",
      gradient: "from-fuchsia-500 via-purple-500 to-pink-500",
      lightBg: "bg-purple-50",
      accent: "text-purple-700",
      glow: "hover:shadow-purple-200/70",
    },
  ];

  const openModal = (message, type = "upgrade") => {
    setModalText(message);
    setModalType(type);
    setShowModal(true);
  };

  const handleToolClick = (tool) => {
    if (tool.route === "#") {
      openModal(`${tool.title} is coming soon!`, "coming");
      return;
    }

    if (!hasValidPlan()) {
      openModal(
        `You need a premium plan to use "${tool.title}". Upgrade now to access it!`
      );
      return;
    }

    navigate(tool.route);
  };

  const handleCreatePoster = () => {
    if (!hasValidPlan()) {
      openModal(
        "You need a premium plan to create a poster. Upgrade now!"
      );
    } else {
      navigate("/custom");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8F8FC] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B3CC4] via-[#6848D9] to-[#8B5CF6] p-6 text-white shadow-xl shadow-purple-200/40 sm:p-9 lg:p-12">
            {/* Decorative shapes */}
            <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />

            <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/5 blur-2xl" />

            <div className="pointer-events-none absolute right-24 top-10 hidden h-16 w-16 rotate-12 rounded-2xl border border-white/20 sm:block" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-sm">
                  <FaWandMagicSparkles size={15} />
                  YOUR CREATIVE SPACE
                </div>

                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Turn Your Ideas
                  <br className="hidden sm:block" /> Into Stunning Designs
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-purple-100 sm:text-base">
                  Welcome to your creative studio. Design beautiful posters,
                  build your brand identity, and explore tools that bring
                  your imagination to life.
                </p>

                <button
                  type="button"
                  onClick={handleCreatePoster}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#6545CE] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 sm:px-6"
                >
                  <FaPalette size={17} />
                  Create Poster
                  <FiArrowUpRight size={18} />
                </button>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-purple-100 sm:text-sm">
                  <span className="flex items-center gap-2">
                    <FiCheckCircle size={15} />
                    Easy to use
                  </span>

                  <span className="flex items-center gap-2">
                    <FiCheckCircle size={15} />
                    Creative freedom
                  </span>

                  <span className="flex items-center gap-2">
                    <FiCheckCircle size={15} />
                    Professional tools
                  </span>
                </div>
              </div>

              <div className="hidden shrink-0 items-center justify-center md:flex">
                <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md lg:h-52 lg:w-52">
                  <div className="flex h-28 w-28 items-center justify-center rounded-[1.6rem] bg-white text-[#6946D4] shadow-xl lg:h-36 lg:w-36">
                    <FaPalette className="h-14 w-14 lg:h-20 lg:w-20" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="mt-10 sm:mt-12">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7655D6]">
                  <FiLayers size={16} />
                  CREATIVE WORKSPACE
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Choose Your Tool
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Everything you need to transform your ideas into
                  impressive visual content.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-100 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                2 tools available
              </div>
            </div>

            {/* Colorful, responsive tool cards */}
            <div className="mt-7 pb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              {tools.map((tool) => (
                <button
                  key={tool.number}
                  type="button"
                  onClick={() => handleToolClick(tool)}
                  aria-label={`${tool.title}: ${tool.route === "#" ? "Coming soon" : "Open tool"}`}
                  className={`group relative flex min-h-[290px] w-full flex-col overflow-hidden rounded-3xl border border-white bg-white text-left shadow-lg shadow-gray-200/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${tool.glow} focus:outline-none focus:ring-4 focus:ring-purple-200`}
                >
                  {/* Gradient Header */}
                  <div
                    className={`relative flex h-36 w-full items-center justify-between overflow-hidden bg-gradient-to-br ${tool.gradient} p-5 sm:h-40 sm:p-6`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[18px] border-white/10 transition-transform duration-500 group-hover:scale-125" />

                    <div className="absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-white/10 blur-sm" />

                    <span className="absolute left-5 top-5 text-xs font-bold tracking-[0.2em] text-white/75 sm:left-6 sm:top-6">
                      TOOL {tool.number}
                    </span>

                    {/* Tool Icon */}
                    <div className="relative z-10 mt-7 flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-4xl shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:h-[76px] sm:w-[76px]">
                      {tool.icon}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`relative z-10 mt-7 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide shadow-sm sm:text-xs ${
                        tool.tag === "Coming Soon"
                          ? "bg-amber-300 text-amber-950"
                          : "bg-white/95 text-gray-800"
                      }`}
                    >
                      {tool.tag}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-extrabold text-gray-900 transition-colors duration-200 group-hover:text-purple-700 sm:text-xl">
                      {tool.title}
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
                      {tool.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className={`text-sm font-bold ${tool.accent}`}>
                        {tool.route === "#"
                          ? "Coming soon"
                          : "Start creating"}
                      </span>

                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tool.lightBg} ${tool.accent} transition-all duration-300 group-hover:translate-x-1 group-hover:bg-gray-900 group-hover:text-white`}
                      >
                        {tool.route === "#" ? (
                          <FiLock size={17} />
                        ) : (
                          <FiChevronRight size={22} />
                        )}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="creative-modal-title"
            className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            >
              <FiX size={19} />
            </button>

            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                modalType === "coming"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-purple-50 text-[#6946D4]"
              }`}
            >
              {modalType === "coming" ? (
                <FaWandMagicSparkles size={30} />
              ) : (
                <FiLock size={28} />
              )}
            </div>

            <h2
              id="creative-modal-title"
              className="text-xl font-extrabold text-gray-900 sm:text-2xl"
            >
              {modalType === "coming"
                ? "Something Exciting Is Coming!"
                : "Unlock Your Creativity"}
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              {modalText}
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Maybe Later
              </button>

              {modalType !== "coming" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    navigate("/plans");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6946D4] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5736BE]"
                >
                  Upgrade Now
                  <FiArrowUpRight size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreativeStudio;
