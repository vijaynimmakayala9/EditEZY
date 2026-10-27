
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Gift, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

const ProfileHeader = () => {
  const [profile, setProfile] = useState(null);
  const [wishes, setWishes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setProfile({});
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `https://api.editezy.com/api/users/get-profile/${userId}`
        );

        setProfile(response.data?.user || response.data || {});
      } catch (error) {
        console.error("Profile fetch error:", error);
        setProfile({});
      }
    };

    const fetchWishes = async () => {
      try {
        const response = await axios.get(
          `https://api.editezy.com/api/users/wishes/${userId}`
        );

        setWishes(
          Array.isArray(response.data?.wishes)
            ? response.data.wishes
            : []
        );
      } catch (error) {
        console.error("Wishes fetch error:", error);
      }
    };

    fetchProfile();
    fetchWishes();
  }, []);

  const displayName = profile?.name || localStorage.getItem("userName") || "Welcome";
  const profileImage = profile?.profileImage || "/default-avatar.png";

  if (profile === null) {
    return (
      <div className="w-full animate-pulse rounded-3xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-violet-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-5 w-36 max-w-full rounded bg-slate-200" />
          </div>
          <div className="h-10 w-10 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-3 sm:space-y-4">
      <style>{`
        @keyframes profileMarquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .profile-marquee {
          display: inline-flex;
          width: max-content;
          white-space: nowrap;
          animation: profileMarquee 22s linear infinite;
        }
        .profile-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .profile-marquee {
            animation: none;
            white-space: normal;
          }
        }
      `}</style>

      {/* Profile card */}
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 p-4 shadow-lg shadow-violet-200/60 sm:p-5 lg:p-6">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -right-10 -top-14 -z-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 -z-10 h-36 w-36 rounded-full bg-fuchsia-300/20 blur-2xl" />

        <div className="flex items-center justify-between gap-3 sm:gap-5">
          {/* Profile details */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
          >
            <span className="relative shrink-0">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-white/20 shadow-md sm:h-16 sm:w-16 sm:rounded-3xl">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${displayName}'s profile`}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : null}

                <div
                  style={{ display: profileImage ? "none" : "flex" }}
                  className="h-full w-full items-center justify-center bg-white/20 text-xl font-bold uppercase text-white sm:text-2xl"
                >
                  {displayName?.trim()?.charAt(0) || "U"}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-violet-600 bg-emerald-400 sm:h-6 sm:w-6">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
            </span>

            <span className="min-w-0 flex-1">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-violet-100 sm:text-sm">
                Welcome back
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              </span>
              <span className="block truncate text-lg font-bold tracking-tight text-white sm:text-2xl">
                {displayName}
              </span>
              <span className="mt-1 hidden items-center gap-1 text-xs text-violet-100/90 sm:flex">
                View your profile
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </button>

          {/* Quick actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/chat")}
              aria-label="Open AI assistant"
              title="AI Assistant"
              className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:h-12 sm:w-12"
            >
              <FaRobot className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/referpage")}
              aria-label="Refer and earn rewards"
              title="Refer and earn"
              className="group relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white text-violet-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:h-12 sm:w-12"
            >
              <Gift className="h-5 w-5 transition-transform group-hover:rotate-[-10deg] sm:h-6 sm:w-6" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-violet-600 bg-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Wishes banner */}
      {wishes.length > 0 && (
        <div className="relative flex min-h-12 items-center gap-3 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-3 py-3 sm:px-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Gift className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="profile-marquee">
              {wishes.map((wish, index) => (
                <span
                  key={`${index}-${wish}`}
                  className="mr-8 text-xs font-semibold text-amber-900 sm:text-sm"
                >
                  ✨ {wish}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileHeader;
