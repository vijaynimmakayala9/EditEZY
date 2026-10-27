
import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://api.editezy.com/api/poster/getbanners"
      );

      setBanners(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Failed to load banners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-48 w-full items-center justify-center rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-sm sm:min-h-64 md:min-h-80">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <FaSpinner className="animate-spin text-2xl text-violet-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Loading banners...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Preparing something beautiful for you
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-48 w-full items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/70 p-5 sm:min-h-64 md:min-h-80">
        <div className="text-center">
          <p className="font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={fetchBanners}
            className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex min-h-48 w-full items-center justify-center rounded-3xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 sm:min-h-64 md:min-h-80">
        <p className="text-center text-sm font-medium text-slate-500">
          No banners available at the moment.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_8px_30px_rgba(109,40,217,0.12)] sm:rounded-3xl">
        <Carousel
          interval={4000}
          controls={banners.length > 1}
          indicators={banners.length > 1}
          wrap
          pause={false}
          className="banner-carousel w-full"
        >
          {banners.map((banner, index) => {
            const image = banner?.images?.[0];

            return (
              <Carousel.Item key={banner?._id || index}>
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 xs:h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[500px]">
                  {image ? (
                    <img
                      src={image}
                      alt={`Promotional banner ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm font-medium text-violet-400">
                        Banner image unavailable
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />
                </div>
              </Carousel.Item>
            );
          })}
        </Carousel>
      </div>

      <style>{`
        .banner-carousel .carousel-indicators {
          margin-bottom: 12px;
          gap: 5px;
          align-items: center;
        }

        .banner-carousel .carousel-indicators [data-bs-target] {
          width: 7px;
          height: 7px;
          margin: 0;
          border: 0;
          border-radius: 999px;
          background-color: white;
          opacity: 0.65;
          transition: width 0.25s ease, opacity 0.25s ease;
        }

        .banner-carousel .carousel-indicators .active {
          width: 22px;
          opacity: 1;
        }

        .banner-carousel .carousel-control-prev,
        .banner-carousel .carousel-control-next {
          width: 10%;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .banner-carousel:hover .carousel-control-prev,
        .banner-carousel:hover .carousel-control-next {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .banner-carousel .carousel-control-prev,
          .banner-carousel .carousel-control-next {
            opacity: 0.8;
          }

          .banner-carousel .carousel-indicators {
            margin-bottom: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .banner-carousel img {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
};

export default BannerCarousel;
