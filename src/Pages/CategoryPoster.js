
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiImage, FiArrowRight } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import Navbar from "./Navbar";

const CategoryPoster = () => {
  const [postersByCategory, setPostersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  // Fetch and group all posters category-wise
  useEffect(() => {
    const fetchPosters = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          "https://api.editezy.com/api/poster/canvasposters"
        );

        const posters = response.data?.posters || [];

        const grouped = posters.reduce((acc, poster) => {
          const category = poster.categoryName || "Uncategorized";

          if (!acc[category]) {
            acc[category] = [];
          }

          acc[category].push(poster);
          return acc;
        }, {});

        setPostersByCategory(grouped);
      } catch (err) {
        console.error("Error fetching posters:", err);
        setError("Failed to load posters. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

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
        (plan) => plan.endDate && new Date(plan.endDate) > currentDate
      );
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  // Handle poster selection
  const handlePosterClick = (posterId) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
      return;
    }

    navigate(`/posters/${posterId}`);
  };

  // Handle category View All
  const handleCategoryClick = (category) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
      return;
    }

    navigate(`/category/${category}`);
  };

  // Search categories
  const filteredCategories = Object.entries(postersByCategory).filter(
    ([category]) =>
      category.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Heading and search */}
          <div className="mb-7 flex flex-col gap-4 sm:mb-9 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                Explore Collections
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Categories
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Discover posters for every occasion and creative idea.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />

              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
                >
                  <div className="aspect-[3/4] animate-pulse bg-slate-200" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white px-5 py-10 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty results */}
          {!loading && !error && filteredCategories.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
              <FiImage className="mx-auto mb-3 text-4xl text-slate-300" />

              <h2 className="text-lg font-bold text-slate-800">
                No Categories Found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try searching with another category name.
              </p>
            </div>
          )}

          {/* Every category and every poster */}
          {!loading &&
            !error &&
            filteredCategories.map(([category, posters]) => (
              <section
                key={category}
                className="mb-8 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:mb-10 sm:rounded-3xl sm:p-5 lg:p-6"
              >
                {/* Category heading */}
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-bold text-slate-900 sm:text-xl">
                      {category}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {posters.length}{" "}
                      {posters.length === 1 ? "poster" : "posters"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCategoryClick(category)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 sm:gap-2 sm:px-3 sm:text-sm"
                  >
                    View All
                    <FiArrowRight />
                  </button>
                </div>

                {/* All posters in this category */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {posters.slice(0, 6).map((poster) => (
                    <button
                      key={poster._id}
                      type="button"
                      onClick={() => handlePosterClick(poster._id)}
                      aria-label={`Open ${poster.name || "poster"}`}
                      className="group min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 sm:rounded-2xl"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                        <img
                          src={poster.posterImage?.url || "/placeholder.png"}
                          alt={poster.name || `${category} poster`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      </div>

                      <div className="p-2.5 sm:p-3">
                        <p className="truncate text-xs font-semibold text-slate-700 transition group-hover:text-violet-700 sm:text-sm">
                          {poster.name || "Untitled Poster"}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-400 sm:text-xs">
                          {category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>

      {/* Subscription popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setShowPopup(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-popup-title"
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-700 px-5 py-6 text-center sm:px-7">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <FaCrown className="text-2xl text-amber-300" />
              </div>

              <h2
                id="upgrade-popup-title"
                className="text-xl font-bold text-white"
              >
                Unlock Premium
              </h2>

              <p className="mt-2 text-sm leading-6 text-violet-100">
                Get access to posters and explore your creative possibilities
                with a premium plan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Maybe Later
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/home");
                }}
                className="rounded-xl bg-violet-700 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
              >
                Upgrade Now
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default CategoryPoster;
