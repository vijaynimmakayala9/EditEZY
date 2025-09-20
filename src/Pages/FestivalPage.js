// FestivalPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = "https://api.editezy.com/api/poster/festival";

// ✅ Convert selected local date -> backend UTC ISO format
function toAPIDateString(date) {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0); // midnight local
  return local.toISOString(); // backend stored in UTC
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

  const navigate = useNavigate();

  // prepare next 5 dates
  useEffect(() => {
    const list = [];
    const start = new Date();
    for (let i = 0; i < 5; i++) {
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

  const renderDateCard = (d) => {
    const isSelected =
      new Date(d).toDateString() === new Date(selectedDate).toDateString();

    return (
      <div
        key={d.toString()}
        onClick={() => setSelectedDate(d)}
        style={{
          minWidth: 70,
          height: 90,
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          cursor: "pointer",
          boxShadow: isSelected
            ? "0 6px 18px rgba(69,45,180,0.18)"
            : "0 3px 8px rgba(0,0,0,0.06)",
          background: isSelected ? "#2E1EA8" : "#ffffff",
          color: isSelected ? "#fff" : "#111827",
          border: "1px solid rgba(0,0,0,0.04)",
          flexShrink: 0, // ✅ Prevent shrinking on mobile
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {formatDisplayDate(d).split(" ")[0]}
        </div>
        <div style={{ fontSize: 12 }}>{formatDisplayDate(d).split(" ")[1]}</div>
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
            <div key={f._id || Math.random()} className="festival-card" onClick={() => navigate(`/posters/${f._id}`)}>
              <img
                src={
                  f.posterImage?.url ||
                  f.designData?.bgImage?.url ||
                  (f.images && f.images[0])
                }
                alt="festival-poster"
                className="festival-img"
              />
            </div>
          ))
        )}
      </div>

      {/* ✅ Add responsive CSS */}
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
        }
        .festival-subtitle {
          margin: 0 0 18px;
          color: #6b7280;
          font-size: 14px;
        }
        .festival-date-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        .festival-date-row::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .festival-grid {
          min-height: 260px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        .festival-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .festival-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        .festival-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }
        .festival-error {
          padding: 20px;
          border-radius: 12px;
          background: #fff2f0;
          color: #9b2c2c;
        }
        .festival-empty {
          background: #fff;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 6px 18px rgba(15,23,42,0.06);
          text-align: center;
        }
        .festival-empty-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .festival-empty-sub {
          color: #6b7280;
        }

        /* ✅ Responsive tweaks */
        @media (max-width: 768px) {
          .festival-title {
            font-size: 18px;
          }
          .festival-img {
            height: 160px;
          }
        }
        @media (max-width: 480px) {
          .festival-title {
            font-size: 16px;
          }
          .festival-subtitle {
            font-size: 12px;
          }
          .festival-img {
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
};

export default FestivalPage;
