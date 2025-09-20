// src/components/CategoryWisePoster.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import Navbar from "./Navbar";

const CategoryPoster = () => {
  const [postersByCategory, setPostersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false); // 🔔 popup state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.editezy.com/api/poster/canvasposters"
        );
        const posters = response.data.posters || [];

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
        setError("Failed to load posters");
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  // ✅ Check plan validity (localStorage se)
  const hasValidPlan = () => {
    const plans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (plans.length === 0) return false;

    const currentDate = new Date();
    return plans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  // ✅ Poster click handler
  const handlePosterClick = (posterId) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
    } else {
      navigate(`/posters/${posterId}`);
    }
  };

  // ✅ Category click handler
  const handleCategoryClick = (category) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
    } else {
      navigate(`/category/${category}`);
    }
  };

  // Filter categories based on search term
  const filteredCategories = Object.entries(postersByCategory).filter(
    ([category]) =>
      category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="p-4 mb-5">
        {/* Heading + Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Categories</h1>
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center mt-10">Loading posters...</div>
        ) : error ? (
          <div className="text-center mt-10 text-red-500">{error}</div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center mt-10 text-gray-500">
            No categories found
          </div>
        ) : (
          <>
            {filteredCategories.map(([category, posters]) => (
              <div key={category} className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">{category}</h3>
                  <button
                    className="text-blue-600 text-sm"
                    onClick={() => handleCategoryClick(category)}
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {posters.slice(0, 4).map((poster) => (
                    <div
                      key={poster._id}
                      className="rounded-xl shadow-md overflow-hidden border hover:scale-105 transition-transform duration-200 cursor-pointer"
                      onClick={() => handlePosterClick(poster._id)}
                    >
                      <img
                        src={poster.posterImage?.url || "/placeholder.png"}
                        alt={poster.name || "Poster"}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

    {/* 🔔 Popup Modal */}
{showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
      {/* Icon */}
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-yellow-100 mx-auto mb-4">
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.59V7h2v9.59l2.3-2.3 1.4 1.42-4 4-4-4 1.4-1.42 2.3 2.3z" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        Premium Customer Management
      </h2>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        Add and manage unlimited customers with contact details, purchase
        history, and advanced organization tools.
      </p>

      {/* Buttons */}
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
            navigate("/home"); // 👉 redirect to upgrade page
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default CategoryPoster;
