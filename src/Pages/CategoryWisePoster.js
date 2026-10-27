import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategoryWisePoster = () => {
  const [postersByCategory, setPostersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          "https://api.editezy.com/api/poster/canvasposters"
        );
        const posters = response.data?.posters || [];

        // Group posters by categoryName.
        const grouped = posters.reduce((acc, poster) => {
          const category = poster.categoryName || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(poster);
          return acc;
        }, {});

        setPostersByCategory(grouped);
      } catch (err) {
        console.error("Error fetching posters:", err);
        setError("Failed to load premium posters. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  const hasValidPlan = () => {
    try {
      const plans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
      if (!Array.isArray(plans) || plans.length === 0) return false;

      const currentDate = new Date();
      return plans.some(
        (plan) => plan?.endDate && new Date(plan.endDate) > currentDate
      );
    } catch (err) {
      console.error("Unable to read subscription plans:", err);
      return false;
    }
  };

  const handlePosterClick = (posterId) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
    } else {
      navigate(`/posters/${posterId}`);
    }
  };

  const categories = Object.entries(postersByCategory);
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Discover your next design
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Posters by Category
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Explore curated poster collections for every occasion.
            </p>
          </div>

          {!loading && !error && categories.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllCategories((current) => !current)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto"
            >
              {showAllCategories ? "Show First 5" : "View All Categories"}
              <svg
                className={`h-4 w-4 transition-transform ${showAllCategories ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>
          )}
        </header>

        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"
              role="status"
              aria-label="Loading posters"
            />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading poster collections...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-3 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              🎨
            </div>
            <h2 className="font-bold text-slate-900">No posters available</h2>
            <p className="mt-1 text-sm text-slate-500">
              Please check back later for new designs.
            </p>
          </div>
        ) : (
          <div className="space-y-9 sm:space-y-12">
            {visibleCategories.map(([category, posters], categoryIndex) => (
              <section
                key={category}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5 lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500 sm:text-xs">
                      Collection {String(categoryIndex + 1).padStart(2, "0")}
                    </p>
                    <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                      {category}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {posters.length} {posters.length === 1 ? "poster" : "posters"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm"
                  >
                    View All <span aria-hidden="true">→</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                  {posters.slice(0, 4).map((poster) => (
                    <button
                      key={poster._id}
                      type="button"
                      onClick={() => handlePosterClick(poster._id)}
                      aria-label={`Open ${poster.name || poster.title || "poster"}`}
                      className="group relative overflow-hidden rounded-xl bg-slate-100 text-left shadow-sm ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <img
                        src={poster.posterImage?.url || "/placeholder.png"}
                        alt={poster.name || poster.title || "Poster"}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute right-2 top-2 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-bold tracking-wide text-white shadow sm:text-xs">
                        PRO
                      </span>
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {poster.name || poster.title || "View poster"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {categories.length > 5 && (
              <div className="flex flex-col items-center gap-3 pt-1 text-center">
                <p className="text-sm text-slate-500">
                  {showAllCategories
                    ? `Showing all ${categories.length} categories`
                    : `Showing 5 of ${categories.length} categories`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllCategories((current) => !current);
                    if (showAllCategories) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  {showAllCategories ? "Show First 5 Categories" : "Explore All Categories"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowPopup(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-posters-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-7"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v10m0 0 4-4m-4 4-4-4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
                />
              </svg>
            </div>
            <h2
              id="premium-posters-title"
              className="mb-2 text-lg font-bold text-slate-900"
            >
              Premium Posters
            </h2>
            <p className="mb-6 text-sm leading-6 text-slate-500">
              Unlock premium poster designs with a subscription plan and explore
              the full collection.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="flex-1 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/plans");
                }}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Upgrade Now
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default CategoryWisePoster;
