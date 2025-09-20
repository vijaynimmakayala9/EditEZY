// src/components/SingleCategoryPoster.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
          { params: { categoryName } } // 🔹 query param
        );

        if (response.data) {
          setPosters(response.data);
        } else {
          setPosters([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching category posters:", err);
        setError("Failed to load posters");
        setLoading(false);
      }
    };

    if (categoryName) fetchCategoryPosters();
  }, [categoryName]);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h2 className="font-bold text-xl mb-4">{categoryName} Posters</h2>

        {loading ? (
          <div className="text-center mt-10">Loading posters...</div>
        ) : error ? (
          <div className="text-center mt-10 text-red-500">{error}</div>
        ) : posters.length === 0 ? (
          <div className="text-center mt-10 text-gray-500">
            No posters available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posters.map((poster) => (
              <div
                key={poster._id}
                className="rounded-xl shadow-md overflow-hidden border hover:scale-105 transition-transform duration-200"
                onClick={() => navigate(`/posters/${poster._id}`)}
              >
                <img
                  src={poster.posterImage?.url || "/placeholder.png"}
                  alt={poster.name || "Poster"}
                  className="w-full h-56 object-cover"
                />
              </div>
            ))}
          </div>

        )}
      </div>
    </>
  );
};

export default SingleCategoryPoster;
