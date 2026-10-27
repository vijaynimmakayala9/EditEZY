
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiImage, FiArrowLeft } from "react-icons/fi";
import Navbar from "./Navbar";

const SingleCategoryPoster = () => {
  const { categoryName } = useParams();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryPosters = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          "https://api.editezy.com/api/poster/getposterbycategory",
          {
            params: { categoryName },
          }
        );

        setPosters(response.data?.posters || []);
      } catch (err) {
        console.error("Error fetching category posters:", err);
        setError("Failed to load posters. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryPosters();
    } else {
      setPosters([]);
      setLoading(false);
    }
  }, [categoryName]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Heading */}
          <div className="mb-7 sm:mb-9">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <FiArrowLeft />
              Back
            </button>

            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Explore Collection
            </p>

            <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {categoryName || "Category"} Posters
            </h1>

            {!loading && !error && posters.length > 0 && (
              <p className="mt-2 text-sm text-slate-500">
                Explore all {posters.length}{" "}
                {posters.length === 1 ? "poster" : "posters"} in this category.
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <div className="aspect-[3/4] animate-pulse bg-slate-200" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white px-5 py-10 text-center shadow-sm">
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

          {/* Empty state */}
          {!loading && !error && posters.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <FiImage className="mx-auto mb-3 text-4xl text-slate-300" />

              <h2 className="text-lg font-bold text-slate-800">
                No Posters Available
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no posters available in this category.
              </p>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-5 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                Explore Other Categories
              </button>
            </div>
          )}

          {/* All posters */}
          {!loading && !error && posters.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {posters.map((poster) => (
                <button
                  key={poster._id}
                  type="button"
                  onClick={() => navigate(`/posters/${poster._id}`)}
                  aria-label={`Open ${poster.name || "poster"}`}
                  className="group min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 sm:rounded-2xl"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img
                      src={poster.posterImage?.url || "/placeholder.png"}
                      alt={poster.name || `${categoryName} poster`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>

                  <div className="p-2.5 sm:p-3">
                    <p className="truncate text-xs font-semibold text-slate-700 transition group-hover:text-violet-700 sm:text-sm">
                      {poster.name || "Untitled Poster"}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-400 sm:text-xs">
                      {categoryName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SingleCategoryPoster;
