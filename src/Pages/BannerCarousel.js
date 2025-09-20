import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch banners from the API
  useEffect(() => {
    axios
      .get("https://api.editezy.com/api/poster/getbanners")
      .then((response) => {
        setBanners(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching banners:", error);
        setError("Failed to load banners. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 max-w-md mx-auto">
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <p className="text-gray-600">No banners available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(59,130,246,0.25)]">
    <Carousel
      interval={4000}
      controls={banners.length > 1}
      indicators={banners.length > 1}
      wrap={true}
      pause={false}
      className="w-full"
    >
      {banners.map((banner, index) => (
        <Carousel.Item key={index}>
          <div
            className="w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${banner.images[0]})`,
              backgroundPosition: "center center",
            }}
          ></div>
        </Carousel.Item>
      ))}
    </Carousel>
  </div>
);

};

export default BannerCarousel;