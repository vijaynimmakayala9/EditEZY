import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleOtpChange = (value, index) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      setError("");
      return;
    }

    // Support typing or autofilling more than one digit.
    const next = [...otp];
    digits.slice(0, 4 - index).split("").forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setOtp(next);
    setError("");
    const focusIndex = Math.min(index + digits.length, 3);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const next = ["", "", "", ""];
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtp(next);
    setError("");
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    const otpValue = otp.join("");
    const mobile = localStorage.getItem("userMobile");

    if (otpValue.length !== 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    if (!mobile) {
      setError("Mobile number not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://api.editezy.com/api/users/verify-otp",
        {
          mobile,
          otp: otpValue,
        }
      );

      if (response.status === 200) {
        const user = response.data.user;

        if (!user?._id) {
          setError("User details were not returned.");
          return;
        }

        // Store user details
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userMobile", user.mobile || "");
        localStorage.setItem("userImage", user.profileImage || "");
        localStorage.setItem("userDob", user.dob || "");
        localStorage.setItem(
          "userMarriageAnniversaryDate",
          user.marriageAnniversaryDate || ""
        );

        // Store account status
        localStorage.setItem(
          "isVerified",
          String(user.isVerified ?? false)
        );
        localStorage.setItem(
          "isSubscribedPlan",
          String(user.isSubscribedPlan ?? false)
        );
        localStorage.setItem(
          "isBlocked",
          String(user.isBlocked ?? false)
        );
        localStorage.setItem(
          "isReported",
          String(user.isReported ?? false)
        );

        // Store subscription and referral details
        localStorage.setItem(
          "subscribedPlans",
          JSON.stringify(user.subscribedPlans || [])
        );
        localStorage.setItem(
          "referralCode",
          user.referralCode || ""
        );
        localStorage.setItem(
          "referralPoints",
          String(user.referralPoints ?? 0)
        );
        localStorage.setItem(
          "referredBy",
          user.referredBy || ""
        );

        // Store wallet, language and trial details
        localStorage.setItem("wallet", String(user.wallet ?? 0));
        localStorage.setItem("language", user.language || "en");
        localStorage.setItem(
          "free7DayTrial",
          String(user.free7DayTrial ?? false)
        );
        localStorage.setItem(
          "trialExpiryDate",
          user.trialExpiryDate || ""
        );

        // Store other user collections
        localStorage.setItem(
          "myBookings",
          JSON.stringify(user.myBookings || [])
        );
        localStorage.setItem(
          "myStories",
          JSON.stringify(user.myStories || [])
        );
        localStorage.setItem(
          "posters",
          JSON.stringify(user.posters || [])
        );
        localStorage.setItem(
          "companies",
          JSON.stringify(user.companies || [])
        );
        localStorage.setItem(
          "customers",
          JSON.stringify(user.customers || [])
        );
        localStorage.setItem(
          "userBusinessCards",
          JSON.stringify(user.userBusinessCards || [])
        );
        localStorage.setItem(
          "rewardHistory",
          JSON.stringify(user.rewardHistory || [])
        );

        // Store account creation and update timestamps
        localStorage.setItem("userCreatedAt", user.createdAt || "");
        localStorage.setItem("userUpdatedAt", user.updatedAt || "");

        console.log("User details saved:", {
          userId: user._id,
          userName: user.name,
          userMobile: user.mobile,
          subscribedPlans: user.subscribedPlans,
          isSubscribedPlan: user.isSubscribedPlan,
        });

        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[#f8f7ff] text-slate-900">
      <div className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full bg-pink-200/50 blur-3xl sm:h-96 sm:w-96" />
      <div className="pointer-events-none fixed -bottom-32 -right-24 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative mx-auto grid min-h-dvh max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* Branding panel: desktop and large tablets */}
        <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden px-8 py-8 sm:px-10 lg:flex lg:px-12 xl:px-20">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-fit items-center gap-3 text-left"
            aria-label="Posters homepage"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400 text-2xl font-black text-white shadow-lg shadow-violet-300/40">P</span>
            <span>
              <span className="block text-2xl font-black tracking-tight">Posters</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Create · Design · Inspire</span>
            </span>
          </button>

          <div className="mx-auto w-full max-w-xl py-8">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              YOUR CREATIVE SPACE
            </span>
            <h1 className="text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
              Bring your
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">ideas to life.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-7 text-slate-600">
              Create stunning posters, social graphics and visual stories with Posters.
            </p>

            <div className="relative mx-auto mt-8 flex h-[min(34vh,300px)] min-h-56 max-w-md items-center justify-center">
              <div className="absolute left-[10%] top-5 flex h-48 w-36 -rotate-12 flex-col justify-between rounded-2xl bg-gradient-to-br from-orange-300 via-pink-400 to-rose-500 p-4 shadow-xl xl:h-56 xl:w-40">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white">Creative studio</span>
                <p className="text-3xl font-black leading-none text-white">MAKE<br />IT<br />BOLD.</p>
                <span className="text-[9px] font-semibold text-white">IDEAS THAT INSPIRE</span>
              </div>
              <div className="absolute right-[10%] top-2 z-10 flex h-52 w-40 rotate-[8deg] flex-col justify-between overflow-hidden rounded-2xl border-4 border-white bg-[#f4e8c8] p-4 shadow-2xl xl:h-60 xl:w-44">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-300/70" />
                <span className="relative text-[9px] font-bold uppercase tracking-widest text-slate-600">The inspiration issue</span>
                <p className="relative text-3xl font-black leading-[0.95] text-slate-900">THINK<br />BIGGER<span className="block text-violet-600">CREATE.</span></p>
                <span className="relative text-[9px] font-bold uppercase text-slate-500">Design your world ✳</span>
              </div>
              <span className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-white text-2xl text-violet-600 shadow-lg">✦</span>
              <span className="absolute bottom-1 right-2 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-xl">✎</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ["✦", "Easy to use"],
                ["▦", "Beautiful designs"],
                ["◉", "Create anywhere"],
              ].map(([icon, label]) => (
                <div key={label}>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-violet-600 shadow-sm">{icon}</span>
                  <p className="text-xs font-semibold text-slate-600 xl:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-medium tracking-wide text-slate-400">MADE FOR CREATORS, DREAMERS & DOERS.</p>
        </section>

        {/* Verification panel */}
        <section className="flex min-h-dvh items-center justify-center px-4 py-5 sm:px-8 sm:py-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-[480px] rounded-[26px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_90px_-30px_rgba(91,67,180,0.25)] backdrop-blur-xl sm:rounded-[30px] sm:p-8 xl:p-10">
            {/* Mobile logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-7 flex items-center gap-3 text-left lg:hidden"
              aria-label="Posters homepage"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-xl font-black text-white">P</span>
              <span>
                <span className="block text-xl font-black">Posters</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">Create · Design · Inspire</span>
              </span>
            </button>

            <div className="mb-7 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-violet-700"
              >
                <span className="text-xl" aria-hidden="true">←</span>
                Go back
              </button>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-violet-600" aria-hidden="true">
                  <path d="M7 10V7a5 5 0 0110 0v3M6 10h12v10H6V10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Secure verification
              </span>
            </div>

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 sm:h-24 sm:w-24">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-3xl text-white shadow-lg shadow-violet-300/50 sm:h-16 sm:w-16">
                ✉
                <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-amber-400 text-sm font-bold">✓</span>
              </div>
            </div>

            <div className="mb-7 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">One last step</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Verify OTP</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
                Enter the 4-digit verification code sent to your mobile number.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="mb-3 block text-sm font-bold text-slate-700">Verification code</label>
              <div className="mb-5 grid grid-cols-4 gap-2.5 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => { inputRefs.current[index] = element; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={4}
                    value={digit}
                    onChange={(event) => handleOtpChange(event.target.value, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={handlePaste}
                    aria-label={`OTP digit ${index + 1}`}
                    className={`h-14 min-w-0 rounded-2xl border-2 bg-slate-50 text-center text-2xl font-bold text-slate-900 outline-none transition focus:bg-white focus:ring-4 focus:ring-violet-100 sm:h-16 sm:text-3xl ${digit ? "border-violet-500" : "border-slate-200 hover:border-violet-300"
                      }`}
                  />
                ))}
              </div>

              {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>Verify OTP <span className="text-xl transition-transform group-hover:translate-x-1">→</span></>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-violet-50/80 p-3 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">🔐</span>
              <div>
                <p className="text-sm font-bold text-slate-700">Your account, protected</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Never share your verification code with anyone.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              © {new Date().getFullYear()} Posters. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default VerifyOtpPage;
