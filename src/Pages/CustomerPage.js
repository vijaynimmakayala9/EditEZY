import React, { useEffect, useState } from "react";
import axios from "axios";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

const ProfileHeader = () => {
  const [profile, setProfile] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [birthdayWishes, setBirthdayWishes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      // ✅ Fetch profile
      axios
        .get(`https://api.editezy.com/api/users/get-profile/${userId}`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Profile fetch error", err));

      // ✅ Fetch custom wishes
      axios
        .get(`https://api.editezy.com/api/users/wishes/${userId}`)
        .then((res) => setWishes(res.data.wishes || []))
        .catch((err) => console.error("Wishes fetch error", err));

      // ✅ Fetch customers for birthday wishes
      axios
        .get(`https://api.editezy.com/api/users/allcustomers/${userId}`)
        .then((res) => {
          const customers = res.data.customers || [];
          const today = new Date();
          const todayMonth = today.getMonth();
          const todayDate = today.getDate();

          // filter customers whose DOB is today
          const birthdayPeople = customers.filter((c) => {
            if (!c.dob) return false;
            const dob = new Date(c.dob);
            return dob.getMonth() === todayMonth && dob.getDate() === todayDate;
          });

          // create wish messages
          const wishesList = birthdayPeople.map(
            (c) => `🎉 Happy Birthday, ${c.name}! 🎂`
          );
          setBirthdayWishes(wishesList);
        })
        .catch((err) => console.error("Birthday fetch error", err));
    }
  }, []);

  if (!profile) {
    return (
      <div className="w-full p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl animate-pulse">
        <div className="h-16"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Keyframes for animation */}
      <style>
        {`
          @keyframes marqueeX {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .marquee-run {
            display: inline-block;
            white-space: nowrap;
            animation: marqueeX 15s linear infinite;
          }
        `}
      </style>

      {/* Profile Header */}
      <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 flex items-center justify-between">
        {/* Left: Profile */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src={profile.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
          <div className="text-white">
            <p className="text-sm opacity-80">Welcome back!</p>
            <p className="text-lg font-semibold">{profile.name}</p>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button
            className="bg-white/20 p-2 rounded-full hover:bg-white/30"
            onClick={() => navigate("/chat")}
          >
            <FaRobot className="text-white w-5 h-5" />
          </button>
          <button
            className="bg-white/20 p-2 rounded-full hover:bg-white/30"
            onClick={() => navigate("/referpage")}
          >
            <Gift className="text-white w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Wishes banner */}
      {wishes.length > 0 && (
        <div className="bg-yellow-200 text-yellow-800 rounded-xl px-4 py-2 overflow-hidden">
          <div className="marquee-run">
            {wishes.map((wish, idx) => (
              <span key={idx} className="mr-10">
                {wish}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🎂 Birthday wishes banner */}
      {birthdayWishes.length > 0 && (
        <div className="bg-pink-200 text-pink-900 rounded-xl px-4 py-2 overflow-hidden">
          <div className="marquee-run">
            {birthdayWishes.map((msg, idx) => (
              <span key={idx} className="mr-10 font-medium">
                {msg}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
