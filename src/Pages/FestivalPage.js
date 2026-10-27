// FestivalPage.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://api.editezy.com/api/poster/festival";

function toAPIDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const FestivalPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateList, setDateList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const posterScrollerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const list = [];
    const start = new Date();

    for (let i = 0; i < 15; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push(d);
    }

    setDateList(list);
  }, []);

  useEffect(() => {
    if (selectedDate) fetchFestivalsForDate(selectedDate);
  }, [selectedDate]);

  // Automatically scroll the poster row horizontally.
  useEffect(() => {
    const scroller = posterScrollerRef.current;
    if (!scroller || loading || festivals.length < 2) return;

    const intervalId = window.setInterval(() => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return;

      if (scroller.scrollLeft >= maxScroll - 4) {
        scroller.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const firstPoster = scroller.querySelector("button");
        const posterWidth = firstPoster?.getBoundingClientRect().width || 180;
        const styles = window.getComputedStyle(scroller);
        const gap = parseFloat(styles.columnGap || styles.gap) || 12;

        scroller.scrollTo({
          left: Math.min(scroller.scrollLeft + posterWidth + gap, maxScroll),
          behavior: "smooth",
        });
      }
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [festivals, loading]);

  const fetchFestivalsForDate = async (date) => {
    setLoading(true);
    setError("");
    setFestivals([]);

    try {
      const festivalDate = toAPIDateString(date);
      const res = await axios.post(API_URL, { festivalDate });
      const data =
        res.data?.posters ||
        res.data?.data ||
        res.data?.festivals ||
        res.data ||
        [];
      const normalized = Array.isArray(data) ? data : [data];

      const filtered = normalized.filter((item) => {
        if (!item?.festivalDate) return true;
        return (
          new Date(item.festivalDate).toDateString() ===
          new Date(date).toDateString()
        );
      });

      setFestivals(filtered);
    } catch (err) {
      console.error("Error fetching festival posters:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to fetch festival posters. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

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

  const isSameDate = (first, second) =>
    new Date(first).toDateString() === new Date(second).toDateString();

  return (
    <main className="mx-auto max-w-7xl bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/50 px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
      <header className="mb-5">
        <h1 className="mb-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Upcoming Festivals
        </h1>
        <p className="m-0 text-sm text-gray-500">
          Never miss a celebration
        </p>
      </header>

      <section
        aria-label="Choose a festival date"
        className="mb-5 flex gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {dateList.map((date) => {
          const selected = isSameDate(date, selectedDate);
          const displayDate = formatDisplayDate(date).split(" ");

          return (
            <button
              key={date.toDateString()}
              type="button"
              onClick={() => setSelectedDate(date)}
              aria-pressed={selected}
              className={`flex h-[76px] min-w-[64px] shrink-0 flex-col items-center justify-center rounded-xl border px-3 transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 sm:h-[86px] sm:min-w-[70px] ${selected
                  ? "border-violet-700 bg-violet-800 text-white shadow-lg shadow-violet-200"
                  : "border-gray-100 bg-white text-gray-800 shadow-sm hover:border-violet-200 hover:shadow-md"
                }`}
            >
              <span className="text-base font-bold">{displayDate[0]}</span>
              <span className="mt-1 text-xs font-medium opacity-90">
                {displayDate[1]}
              </span>
            </button>
          );
        })}
      </section>

      <section
        ref={posterScrollerRef}
        aria-label="Festival posters"
        className="flex flex-nowrap gap-3 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
      >
        {loading ? (
          <div className="flex min-h-48 min-w-full items-center justify-center">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-700"
              role="status"
              aria-label="Loading festival posters"
            />
          </div>
        ) : error ? (
          <div className="min-w-full rounded-2xl border border-violet-100 bg-white px-5 py-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              🎉
            </div>

            <h2 className="mb-2 text-base font-bold text-gray-900">
              No Posters Available
            </h2>

            <p className="m-0 text-sm text-gray-500">
              No posters available for this date. Please select another festival date.
            </p>
          </div>
        ) : festivals.length === 0 ? (
          <div className="min-w-full rounded-2xl border border-violet-100 bg-white px-5 py-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              🎉
            </div>
            <h2 className="mb-1 text-base font-bold text-gray-900">
              No festivals found
            </h2>
            <p className="m-0 text-sm text-gray-500">
              Try selecting a different date.
            </p>
          </div>
        ) : (
          festivals.map((festival, index) => {
            const imageUrl =
              festival.posterImage?.url ||
              festival.designData?.bgImage?.url ||
              (Array.isArray(festival.images) ? festival.images[0] : "");

            return (
              <button
                key={festival._id || `${imageUrl}-${index}`}
                type="button"
                onClick={() => handlePosterClick(festival._id)}
                aria-label={`Open festival poster ${index + 1}`}
                className="group relative w-[160px] min-w-[160px] shrink-0 overflow-hidden rounded-xl bg-white text-left shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 sm:w-[200px] sm:min-w-[200px] md:w-[220px] md:min-w-[220px]"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Festival poster"
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-violet-100 to-fuchsia-100 p-4 text-center text-sm font-medium text-violet-800">
                    Festival poster
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-md bg-violet-800 px-2 py-1 text-[10px] font-bold tracking-wider text-white shadow-md sm:text-xs">
                  PRO
                </span>
              </button>
            );
          })
        )}
      </section>

      {showPopup && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowPopup(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="festival-premium-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-7"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
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
              id="festival-premium-title"
              className="mb-2 text-lg font-bold text-gray-900"
            >
              Premium Festival Posters
            </h2>
            <p className="mb-6 text-sm leading-6 text-gray-500">
              Unlock all festival posters with a premium plan and never miss a
              celebration.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="flex-1 rounded-xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/plans");
                }}
                className="flex-1 rounded-xl bg-violet-800 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
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

export default FestivalPage;
