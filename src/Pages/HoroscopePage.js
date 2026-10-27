
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiRefreshCw, FiSun } from "react-icons/fi";
import Navbar from "./Navbar";

const HoroscopePage = () => {
  const [selectedSign, setSelectedSign] = useState("leo");
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const zodiacDetails = {
    aries: {
      name: "Aries",
      dateRange: "Mar 21 - Apr 19",
      element: "Fire",
      about: "Courageous, determined, confident, and enthusiastic.",
      icon: "♈",
    },
    taurus: {
      name: "Taurus",
      dateRange: "Apr 20 - May 20",
      element: "Earth",
      about: "Reliable, patient, practical, and devoted.",
      icon: "♉",
    },
    gemini: {
      name: "Gemini",
      dateRange: "May 21 - Jun 20",
      element: "Air",
      about: "Gentle, curious, adaptable, and quick to learn.",
      icon: "♊",
    },
    cancer: {
      name: "Cancer",
      dateRange: "Jun 21 - Jul 22",
      element: "Water",
      about: "Intuitive, emotional, compassionate, and protective.",
      icon: "♋",
    },
    leo: {
      name: "Leo",
      dateRange: "Jul 23 - Aug 22",
      element: "Fire",
      about:
        "Bold, intelligent, warm, and courageous, Leo is a natural leader.",
      icon: "♌",
    },
    virgo: {
      name: "Virgo",
      dateRange: "Aug 23 - Sep 22",
      element: "Earth",
      about: "Loyal, analytical, kind, hardworking, and practical.",
      icon: "♍",
    },
    libra: {
      name: "Libra",
      dateRange: "Sep 23 - Oct 22",
      element: "Air",
      about: "Diplomatic, fair-minded, social, and cooperative.",
      icon: "♎",
    },
    scorpio: {
      name: "Scorpio",
      dateRange: "Oct 23 - Nov 21",
      element: "Water",
      about: "Resourceful, brave, passionate, and stubborn.",
      icon: "♏",
    },
    sagittarius: {
      name: "Sagittarius",
      dateRange: "Nov 22 - Dec 21",
      element: "Fire",
      about: "Generous, idealistic, with a great sense of humor.",
      icon: "♐",
    },
    capricorn: {
      name: "Capricorn",
      dateRange: "Dec 22 - Jan 19",
      element: "Earth",
      about: "Disciplined, responsible, and practical.",
      icon: "♑",
    },
    aquarius: {
      name: "Aquarius",
      dateRange: "Jan 20 - Feb 18",
      element: "Air",
      about: "Progressive, independent, and humanitarian.",
      icon: "♒",
    },
    pisces: {
      name: "Pisces",
      dateRange: "Feb 19 - Mar 20",
      element: "Water",
      about: "Compassionate, artistic, intuitive, gentle, and wise.",
      icon: "♓",
    },
  };

  useEffect(() => {
    let cancelled = false;

    const fetchHoroscope = async () => {
      try {
        setLoading(true);
        setError(null);
        setHoroscope(null);

        const response = await axios.get(
          `https://api.editezy.com/api/users/horoscope?sign=${selectedSign}`
        );

        if (cancelled) return;

        const rawText = response.data?.horoscope || "";

        const cleanText = rawText
          .replace(/Career, Love, Health[\s\S]*?Report Now >>/gi, "")
          .replace(/Subscribe to GaneshaSpeaks[\s\S]*$/gi, "")
          .trim();

        setHoroscope({
          ...response.data,
          horoscope: cleanText,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching horoscope:", err);
          setError("Failed to fetch horoscope. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHoroscope();

    return () => {
      cancelled = true;
    };
  }, [selectedSign]);

  const details = zodiacDetails[selectedSign];
  const theme = themeColors[selectedSign];

  return (
    <>
      <Navbar />

      <main
        className="min-h-screen px-3 py-6 text-white sm:px-5 sm:py-8 lg:px-8"
        style={{
          background: `radial-gradient(circle at top right, ${theme.primary}45, transparent 35%), linear-gradient(145deg, #111827, #080b16 75%)`,
        }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <header className="mb-7 sm:mb-9">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
              <FiSun style={{ color: theme.secondary }} />
              Your daily cosmic guide
            </div>

            <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl shadow-lg sm:h-12 sm:w-12 sm:text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                ✦
              </span>
              Daily Horoscope
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Discover what the stars have in store for you today.
            </p>
          </header>

          {/* Zodiac selector */}
          <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl backdrop-blur-sm sm:rounded-3xl sm:p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white sm:text-base">
                Choose Your Zodiac Sign
              </h2>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Select your sign to see its daily reading.
              </p>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {Object.entries(zodiacDetails).map(([key, zodiac]) => {
                const active = key === selectedSign;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSign(key)}
                    aria-pressed={active}
                    className={`flex min-w-[78px] shrink-0 flex-col items-center rounded-xl border px-3 py-3 transition duration-200 sm:min-w-[92px] sm:rounded-2xl sm:px-4 ${
                      active
                        ? "border-white/20 shadow-lg"
                        : "border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.08]"
                    }`}
                    style={
                      active
                        ? {
                            background: `linear-gradient(145deg, ${themeColors[key].primary}, ${themeColors[key].primary}bb)`,
                            boxShadow: `0 8px 24px ${themeColors[key].primary}30`,
                          }
                        : undefined
                    }
                  >
                    <span className="text-2xl sm:text-3xl">
                      {zodiac.icon}
                    </span>

                    <span className="mt-2 text-xs font-semibold text-white sm:text-sm">
                      {zodiac.name}
                    </span>

                    {active && (
                      <span
                        className="mt-2 h-1 w-5 rounded-full"
                        style={{ backgroundColor: theme.secondary }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selected sign details */}
          <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.5fr] lg:gap-5">
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-xl sm:rounded-3xl sm:p-7"
              style={{
                background: `linear-gradient(145deg, ${theme.primary}45, #171c2b 75%)`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-7 -top-7 h-36 w-36 rounded-full border"
                style={{ borderColor: `${theme.secondary}30` }}
              />

              <div
                className="pointer-events-none absolute -right-1 top-0 h-24 w-24 rounded-full border"
                style={{ borderColor: `${theme.secondary}20` }}
              />

              <div className="relative">
                <span
                  className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-5xl sm:h-20 sm:w-20 sm:text-6xl"
                  style={{ color: theme.secondary }}
                >
                  {details.icon}
                </span>

                <h2 className="text-2xl font-extrabold sm:text-3xl">
                  {details.name}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {details.dateRange}
                </p>

                <span
                  className="mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{
                    backgroundColor: theme.secondary,
                    color: "#151515",
                  }}
                >
                  {details.element} Sign
                </span>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <h3 className="text-sm font-bold text-white">
                    About {details.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {details.about}
                  </p>
                </div>
              </div>
            </div>

            {/* Horoscope content */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-sm sm:rounded-3xl sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p
                    className="mb-1 text-xs font-bold uppercase tracking-[0.18em]"
                    style={{ color: theme.secondary }}
                  >
                    Written in the stars
                  </p>

                  <h2 className="text-xl font-bold sm:text-2xl">
                    Today's Horoscope
                  </h2>

                  {horoscope?.date && !loading && (
                    <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                      {horoscope.date}
                    </p>
                  )}
                </div>

                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${theme.primary}30`,
                    color: theme.secondary,
                  }}
                >
                  <FiSun className="text-xl" />
                </span>
              </div>

              {loading ? (
                <div className="space-y-3 py-2" aria-live="polite">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                  <p className="pt-2 text-sm text-slate-400">
                    Reading the stars...
                  </p>
                </div>
              ) : error ? (
                <div
                  className="rounded-xl border border-red-400/20 bg-red-400/5 p-4"
                  role="alert"
                >
                  <p className="text-sm leading-6 text-red-300">{error}</p>

                  <button
                    type="button"
                    onClick={() => setSelectedSign((sign) => sign)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <FiRefreshCw />
                    Retry
                  </button>
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
                  {horoscope?.horoscope ||
                    "No horoscope is available for this sign today."}
                </p>
              )}
            </div>
          </section>

          <p className="pb-2 text-center text-xs text-slate-500">
            For reflection and entertainment. Let the day unfold at its own pace.
          </p>
        </div>
      </main>
    </>
  );
};

export default HoroscopePage;
