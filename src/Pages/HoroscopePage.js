// src/components/HoroscopePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const HoroscopePage = () => {
  const [selectedSign, setSelectedSign] = useState("leo");
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🎨 Theme colors per sign
  const themeColors = {
    aries: { primary: "#e63946", secondary: "#ffb3b3" },
    taurus: { primary: "#2a9d8f", secondary: "#a7e9d1" },
    gemini: { primary: "#f4a261", secondary: "#ffd8a6" },
    cancer: { primary: "#264653", secondary: "#8ab6d6" },
    leo: { primary: "#f77f00", secondary: "#ffd166" },
    virgo: { primary: "#43aa8b", secondary: "#a8dadc" },
    libra: { primary: "#7209b7", secondary: "#c77dff" },
    scorpio: { primary: "#d00000", secondary: "#ff7b7b" },
    sagittarius: { primary: "#ff8500", secondary: "#ffbe76" },
    capricorn: { primary: "#3d405b", secondary: "#a5a58d" },
    aquarius: { primary: "#0077b6", secondary: "#90e0ef" },
    pisces: { primary: "#5a189a", secondary: "#9d4edd" },
  };

  // fetch horoscope on selectedSign change
  useEffect(() => {
    const fetchHoroscope = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `https://api.editezy.com/api/users/horoscope?sign=${selectedSign}`
        );

        // 🧹 clean text
        let cleanText = res.data.horoscope
          .replace(/Career, Love, Health[\s\S]*?Report Now >>/gi, "")
          .replace(/Subscribe to GaneshaSpeaks[\s\S]*$/gi, "")
          .trim();

        setHoroscope({ ...res.data, horoscope: cleanText });
      } catch (err) {
        setError("Failed to fetch horoscope");
      } finally {
        setLoading(false);
      }
    };
    fetchHoroscope();
  }, [selectedSign]);

  // 🔮 static zodiac details
  const zodiacDetails = {
    aries: { name: "Aries", dateRange: "Mar 21 - Apr 19", element: "Fire", about: "Courageous, determined, confident, and enthusiastic.", icon: "♈️" },
    taurus: { name: "Taurus", dateRange: "Apr 20 - May 20", element: "Earth", about: "Reliable, patient, practical, and devoted.", icon: "♉️" },
    gemini: { name: "Gemini", dateRange: "May 21 - Jun 20", element: "Air", about: "Gentle, curious, adaptable, and quick to learn.", icon: "♊️" },
    cancer: { name: "Cancer", dateRange: "Jun 21 - Jul 22", element: "Water", about: "Intuitive, emotional, compassionate, and protective.", icon: "♋️" },
    leo: { name: "Leo", dateRange: "Jul 23 - Aug 22", element: "Fire", about: "Bold, intelligent, warm, and courageous, Leo is a natural leader.", icon: "♌️" },
    virgo: { name: "Virgo", dateRange: "Aug 23 - Sep 22", element: "Earth", about: "Loyal, analytical, kind, hardworking, and practical.", icon: "♍️" },
    libra: { name: "Libra", dateRange: "Sep 23 - Oct 22", element: "Air", about: "Diplomatic, fair-minded, social, and cooperative.", icon: "♎️" },
    scorpio: { name: "Scorpio", dateRange: "Oct 23 - Nov 21", element: "Water", about: "Resourceful, brave, passionate, and stubborn.", icon: "♏️" },
    sagittarius: { name: "Sagittarius", dateRange: "Nov 22 - Dec 21", element: "Fire", about: "Generous, idealistic, great sense of humor.", icon: "♐️" },
    capricorn: { name: "Capricorn", dateRange: "Dec 22 - Jan 19", element: "Earth", about: "Disciplined, responsible, and practical.", icon: "♑️" },
    aquarius: { name: "Aquarius", dateRange: "Jan 20 - Feb 18", element: "Air", about: "Progressive, independent, and humanitarian.", icon: "♒️" },
    pisces: { name: "Pisces", dateRange: "Feb 19 - Mar 20", element: "Water", about: "Compassionate, artistic, intuitive, gentle, wise.", icon: "♓️" },
  };

  const details = zodiacDetails[selectedSign] || {};
  const theme = themeColors[selectedSign] || { primary: "#f77f00", secondary: "#ffd166" };

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen text-white px-4 sm:px-6 md:px-10 py-6 mb-5"
        style={{ background: `linear-gradient(to bottom right, ${theme.primary}, #0f1120)` }}
      >
        {/* Heading */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <span
            className="text-white p-2 rounded-xl mr-2"
            style={{ backgroundColor: theme.primary }}
          >
            ✦
          </span>
          Daily Horoscope
        </h1>
        <p className="text-gray-200 mb-6 text-sm sm:text-base">
          Discover what the stars have in store
        </p>

        {/* Zodiac Carousel */}
        <div className="overflow-x-auto">
          <div className="flex space-x-3 pb-4">
            {Object.keys(zodiacDetails).map((z) => (
              <button
                key={z}
                onClick={() => setSelectedSign(z)}
                className={`flex flex-col items-center min-w-[70px] sm:min-w-[90px] px-3 py-2 rounded-xl transition-colors`}
                style={{
                  backgroundColor: z === selectedSign ? themeColors[z].primary : "#1f2937",
                }}
              >
                <span className="text-2xl sm:text-3xl">{zodiacDetails[z].icon}</span>
                <span className="text-xs sm:text-sm mt-1">{zodiacDetails[z].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sign Info */}
        <div className="rounded-2xl p-4 sm:p-6 mb-6 mt-4" style={{ backgroundColor: "#1f2937" }}>
          <div className="flex items-center mb-2">
            <span className="text-3xl sm:text-4xl mr-3">{details.icon}</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">{details.name}</h2>
              <p className="text-xs sm:text-sm text-gray-300">{details.dateRange}</p>
            </div>
          </div>
          <span
            className="text-[10px] sm:text-xs rounded-full px-2 py-1 text-black font-semibold"
            style={{ backgroundColor: theme.secondary }}
          >
            {details.element}
          </span>

          <div className="mt-4">
            <h3 className="font-semibold mb-1 text-sm sm:text-base">About {details.name}</h3>
            <p className="text-gray-200 text-xs sm:text-sm">{details.about}</p>
          </div>
        </div>

        {/* Horoscope */}
        <div className="rounded-2xl p-4 sm:p-6" style={{ backgroundColor: "#111827" }}>
          <h3 className="font-semibold mb-2 text-sm sm:text-lg">Today's Horoscope</h3>
          {loading && <p className="text-gray-400">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {horoscope && (
            <div>
              <p className="text-xs sm:text-sm text-gray-400 mb-2">{horoscope.date}</p>
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {horoscope.horoscope}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HoroscopePage;
