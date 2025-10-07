// FestivalPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = "https://api.editezy.com/api/poster/festival";

// ✅ For API (yyyy-mm-dd)
function toAPIDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ✅ UI display (19 Sep)
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

  const navigate = useNavigate();

  // prepare next 15 dates
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
    if (!selectedDate) return;
    fetchFestivalsForDate(selectedDate);
  }, [selectedDate]);

  const fetchFestivalsForDate = async (date) => {
    setLoading(true);
    setError("");
    setFestivals([]);

    try {
      const festivalDate = toAPIDateString(date);

      const res = await axios.post(API_URL, { festivalDate });
      const data =
        res.data?.posters || res.data?.data || res.data?.festivals || res.data || [];

      const normalized = Array.isArray(data) ? data : [data];

      // ✅ filter local date
      const filtered = normalized.filter((item) => {
        if (!item.festivalDate) return true;
        const itemDate = new Date(item.festivalDate);
        return itemDate.toDateString() === new Date(date).toDateString();
      });

      setFestivals(filtered);
    } catch (err) {
      console.error("Error fetching festival posters:", err);
      setError(
        err?.response?.data?.message || "Failed to fetch festival posters. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check user subscription
  const hasValidPlan = () => {
    const plans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (plans.length === 0) return false;

    const currentDate = new Date();
    return plans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  // ✅ Handle poster click
  const handlePosterClick = (posterId) => {
    if (!hasValidPlan()) {
      setShowPopup(true);
    } else {
      navigate(`/posters/${posterId}`);
    }
  };

  const renderDateCard = (d) => {
    const isSelected =
      new Date(d).toDateString() === new Date(selectedDate).toDateString();

    return (
      <div
        key={d.toString()}
        onClick={() => setSelectedDate(d)}
        className="date-card"
        style={{
          background: isSelected ? "#2E1EA8" : "#ffffff",
          color: isSelected ? "#fff" : "#111827",
          boxShadow: isSelected
            ? "0 6px 18px rgba(69,45,180,0.18)"
            : "0 3px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div className="date-day">{formatDisplayDate(d).split(" ")[0]}</div>
        <div className="date-month">{formatDisplayDate(d).split(" ")[1]}</div>
      </div>
    );
  };

  return (
    <div className="festival-container">
      <h3 className="festival-title">Upcoming Festivals</h3>
      <p className="festival-subtitle">Never miss a celebration</p>

      {/* Date selector */}
      <div className="festival-date-row">
        {dateList.map((d) => renderDateCard(d))}
      </div>

      {/* Festival posters */}
      <div className="festival-grid">
        {loading ? (
          <div className="festival-loading">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <div className="festival-error">{error}</div>
        ) : festivals.length === 0 ? (
          <div className="festival-empty">
            <div className="festival-empty-title">No festivals found</div>
            <div className="festival-empty-sub">Try selecting a different date</div>
          </div>
        ) : (
          festivals.map((f) => (
            <div
              key={f._id || Math.random()}
              className="festival-card"
              onClick={() => handlePosterClick(f._id)}
            >
              <img
                src={
                  f.posterImage?.url ||
                  f.designData?.bgImage?.url ||
                  (f.images && f.images[0])
                }
                alt="festival-poster"
                className="festival-img"
              />
              <span className="festival-pro-badge">PRO</span>
            </div>
          ))
        )}
      </div>

      {/* ✅ Subscription Popup */}
      {showPopup && (
        <div className="festival-popup-overlay">
          <div className="festival-popup">
            <div className="festival-popup-icon">
              <svg
                className="festival-popup-svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.59V7h2v9.59l2.3-2.3 1.4 1.42-4 4-4-4 1.4-1.42 2.3 2.3z" />
              </svg>
            </div>
            <h2 className="festival-popup-title">Premium Festival Posters</h2>
            <p className="festival-popup-text">
              Unlock all festival posters with a premium plan and never miss a
              celebration.
            </p>
            <div className="festival-popup-buttons">
              <button
                onClick={() => setShowPopup(false)}
                className="festival-popup-btn-cancel"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/plans");
                }}
                className="festival-popup-btn-upgrade"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Responsive CSS */}
      <style>{`
        .festival-container {
          padding: 16px;
          max-width: 100%;
          margin: 0 auto;
        }
        
        .festival-title {
          margin-bottom: 4px;
          font-weight: 700;
          font-size: 20px;
          color: #111827;
        }
        
        .festival-subtitle {
          margin: 0 0 18px;
          color: #6b7280;
          font-size: 14px;
        }
        
        /* Date Row */
        .festival-date-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 4px 0;
        }
        
        .festival-date-row::-webkit-scrollbar {
          display: none;
        }
        
        .date-card {
          min-width: 70px;
          height: 90px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 10px;
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.04);
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        
        .date-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(69,45,180,0.15);
        }
        
        .date-day {
          font-size: 16px;
          font-weight: 700;
        }
        
        .date-month {
          font-size: 12px;
          opacity: 0.9;
        }
        
        /* Festival Grid */
        .festival-grid {
          min-height: 260px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .festival-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .festival-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .festival-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        
        .festival-pro-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #2E1EA8;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(46, 30, 168, 0.3);
        }
        
        /* Loading State */
        .festival-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          grid-column: 1 / -1;
        }
        
        /* Error State */
        .festival-error {
          padding: 20px;
          border-radius: 12px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          grid-column: 1 / -1;
          text-align: center;
        }
        
        /* Empty State */
        .festival-empty {
          background: #fff;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 6px 18px rgba(15,23,42,0.06);
          text-align: center;
          grid-column: 1 / -1;
        }
        
        .festival-empty-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111827;
        }
        
        .festival-empty-sub {
          color: #6b7280;
          font-size: 14px;
        }
        
        /* Popup Styles */
        .festival-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        
        .festival-popup {
          background: white;
          border-radius: 20px;
          padding: 24px;
          max-width: 320px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        
        .festival-popup-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        
        .festival-popup-svg {
          width: 32px;
          height: 32px;
          color: #d97706;
        }
        
        .festival-popup-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }
        
        .festival-popup-text {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        
        .festival-popup-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .festival-popup-btn-cancel {
          padding: 10px 16px;
          border-radius: 10px;
          color: #2E1EA8;
          background: #e0e7ff;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .festival-popup-btn-cancel:hover {
          background: #d4dcfa;
        }
        
        .festival-popup-btn-upgrade {
          padding: 10px 16px;
          border-radius: 10px;
          background: #2E1EA8;
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .festival-popup-btn-upgrade:hover {
          background: #251a87;
        }
        
        /* Responsive Design */
        @media (min-width: 1024px) {
          .festival-container {
            max-width: 100%;
            padding: 24px;
          }
          
          .festival-title {
            font-size: 24px;
          }
          
          .festival-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 20px;
          }
          
          .festival-img {
            height: 220px;
          }
        }
        
        @media (max-width: 768px) {
          .festival-title {
            font-size: 18px;
          }
          
          .festival-subtitle {
            font-size: 13px;
          }
          
          .festival-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }
          
          .festival-img {
            height: 160px;
          }
          
          .date-card {
            min-width: 65px;
            height: 80px;
          }
          
          .date-day {
            font-size: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .festival-container {
            padding: 12px;
          }
          
          .festival-title {
            font-size: 16px;
          }
          
          .festival-subtitle {
            font-size: 12px;
            margin-bottom: 16px;
          }
          
          .festival-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 10px;
          }
          
          .festival-img {
            height: 140px;
          }
          
          .date-card {
            min-width: 60px;
            height: 70px;
            padding: 8px;
          }
          
          .date-day {
            font-size: 14px;
          }
          
          .date-month {
            font-size: 11px;
          }
          
          .festival-popup {
            padding: 20px;
            margin: 16px;
          }
          
          .festival-popup-buttons {
            flex-direction: column;
            gap: 8px;
          }
          
          .festival-popup-btn-cancel,
          .festival-popup-btn-upgrade {
            width: 100%;
          }
        }
        
        @media (max-width: 360px) {
          .festival-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .festival-img {
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default FestivalPage;