import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategoryWisePoster = () => {
  const [postersByCategory, setPostersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.editezy.com/api/poster/canvasposters"
        );
        const posters = response.data.posters || [];

        // Group posters by categoryName
        const grouped = posters.reduce((acc, poster) => {
          const category = poster.categoryName || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(poster);
          return acc;
        }, {});

        setPostersByCategory(grouped);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posters:", err);
        setError("Failed to load Premium posters");
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  const hasValidPlan = () => {
    const plans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (plans.length === 0) return false;

    const currentDate = new Date();
    return plans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  const handlePosterClick = (posterId) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
    } else {
      navigate(`/posters/${posterId}`);
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="text-center mt-10">Loading posters...</div>
      ) : error ? (
        <div className="text-center mt-10 text-red-500">{error}</div>
      ) : Object.keys(postersByCategory).length === 0 ? (
        <div className="text-center mt-10 text-gray-500">No posters available</div>
      ) : (
        <>
          {Object.entries(postersByCategory).map(([category, posters]) => {
            // Limit posters per screen size
            const displayedPosters = posters.slice(0, 4); // Show up to 4 for large screens

            return (
              <div key={category} className="mb-8">
                {/* Category Title + View All */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{category}</h3>
                  <button
                    onClick={() => navigate(`/category/${category}`)}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>

                {/* Posters Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedPosters.map((poster) => (
                    <div
                      key={poster._id}
                      onClick={() => handlePosterClick(poster._id)}
                      className="relative cursor-pointer rounded-xl shadow-md overflow-hidden border hover:scale-105 transition-transform duration-200"
                    >
                      <img
                        src={poster.posterImage?.url || "/placeholder.png"}
                        alt={poster.name || poster.title || "Poster"}
                        className="w-full h-56 object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                        PRO
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-yellow-100 mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.59V7h2v9.59l2.3-2.3 1.4 1.42-4 4-4-4 1.4-1.42 2.3 2.3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Premium Customer Management
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Add and manage unlimited customers with contact details, purchase
              history, and advanced organization tools.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowPopup(false);
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
  );
};

export default CategoryWisePoster;
