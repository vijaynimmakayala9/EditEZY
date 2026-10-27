import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://api.editezy.com";

const LoginPage = () => {
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userId")) navigate("/home", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const checkMobile = () =>
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const checkStandalone = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const checkIOS = () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);

    setIsMobileDevice(checkMobile());
    setIsStandalone(checkStandalone());
    setIsIOS(checkIOS());

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      if (!checkStandalone() && checkMobile()) setShowInstallPrompt(true);
    };
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setIsStandalone(true);
      setDeferredPrompt(null);
      localStorage.setItem("appInstalled", "true");
    };
    const timer = window.setTimeout(() => {
      if (checkIOS() && !checkStandalone() && checkMobile()) {
        setShowInstallPrompt(true);
      }
    }, 3000);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("appInstalled", "true");
        setShowInstallPrompt(false);
      }
    } catch (err) {
      console.error("App installation failed:", err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const usersResponse = await axios.get(`${API_BASE}/api/admin/getallusers`);
      if (
        usersResponse.status !== 200 ||
        !Array.isArray(usersResponse.data.users)
      ) {
        setError("Unable to fetch users. Please try again.");
        return;
      }

      const existingUser = usersResponse.data.users.find(
        (user) => String(user.mobile) === mobile
      );

      if (!existingUser) {
        navigate("/register");
        return;
      }

      // Keep existing user details available for the OTP page.
      localStorage.setItem("userId", existingUser._id || "");
      localStorage.setItem("userName", existingUser.name || "");
      localStorage.setItem("userEmail", existingUser.email || "");
      localStorage.setItem("userMobile", existingUser.mobile || mobile);
      localStorage.setItem("userImage", existingUser.profileImage || "");

      const response = await axios.post(`${API_BASE}/api/users/login`, {
        mobile,
      });

      if (response.status === 200) {
        const user = response.data.user || existingUser;
        localStorage.setItem("userId", user._id || existingUser._id || "");
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userMobile", user.mobile || mobile);
        localStorage.setItem(
          "subscribedPlans",
          JSON.stringify(user.subscribedPlans || [])
        );
        navigate("/verify-otp");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to continue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[#f8f7ff] text-slate-900">
      <div className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full bg-pink-200/50 blur-3xl sm:h-96 sm:w-96" />
      <div className="pointer-events-none fixed -bottom-32 -right-24 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl sm:h-96 sm:w-96" />

      {showInstallPrompt && !isStandalone && isMobileDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setShowInstallPrompt(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            className="my-auto w-full max-w-md rounded-3xl border border-white/70 bg-white p-5 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-3xl font-black text-white">
              P
            </div>
            <h2 id="install-title" className="text-center text-2xl font-black">
              Take Posters with you
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Add Posters to your home screen for quick access to your creative space.
            </p>
            {isIOS && (
              <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-slate-600">
                <p className="mb-2 font-bold text-slate-800">Install on iPhone</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Open this website in Safari.</li>
                  <li>Tap the Share icon.</li>
                  <li>Select “Add to Home Screen”.</li>
                  <li>Tap “Add”.</li>
                </ol>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!isIOS && deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-bold text-white hover:opacity-90"
                >
                  Install Posters
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowInstallPrompt(false)}
                className="min-h-12 flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
              >
                {isIOS ? "Got it" : "Maybe later"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto grid min-h-dvh max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* Branding panel: hidden on small screens to keep the form compact. */}
        <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden px-8 py-8 sm:px-10 lg:flex lg:px-12 xl:px-20">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-fit items-center gap-3 text-left"
            aria-label="Posters homepage"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400 text-2xl font-black text-white shadow-lg shadow-violet-300/40">
              P
            </span>
            <span>
              <span className="block text-2xl font-black tracking-tight">Posters</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Create · Design · Inspire
              </span>
            </span>
          </button>

          <div className="mx-auto w-full max-w-xl py-8">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              YOUR CREATIVE SPACE
            </span>
            <h1 className="text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
              Welcome back.
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
                Create magic.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-7 text-slate-600">
              Turn your ideas into eye-catching posters, social graphics and visual stories.
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
                <p className="relative text-3xl font-black leading-[0.95] text-slate-900">
                  THINK<br />BIGGER<span className="block text-violet-600">CREATE.</span>
                </p>
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
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-violet-600 shadow-sm">
                    {icon}
                  </span>
                  <p className="text-xs font-semibold text-slate-600 xl:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-medium tracking-wide text-slate-400">
            MADE FOR CREATORS, DREAMERS & DOERS.
          </p>
        </section>

        {/* Form panel */}
        <section className="flex min-h-dvh items-center justify-center px-4 py-5 sm:px-8 sm:py-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-[480px] rounded-[26px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_90px_-30px_rgba(91,67,180,0.25)] backdrop-blur-xl sm:rounded-[30px] sm:p-8 xl:p-10">
            {/* Compact logo on mobile */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-7 flex items-center gap-3 text-left lg:hidden"
              aria-label="Posters homepage"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-xl font-black text-white">
                P
              </span>
              <span>
                <span className="block text-xl font-black">Posters</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Create · Design · Inspire
                </span>
              </span>
            </button>

            <div className="mb-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 text-2xl text-violet-600">
                ✦
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                Your creative journey
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Welcome back!
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Enter your phone number and get back to creating.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="mobile" className="mb-2 block text-sm font-bold text-slate-700">
                Mobile number
              </label>
              <div className="flex gap-2">
                <div className="relative w-[100px] shrink-0 sm:w-[112px]">
                  <select
                    aria-label="Country calling code"
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value)}
                    className="h-14 w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-2 pr-6 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:px-3"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▼</span>
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) => {
                    setMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                    setError("");
                  }}
                  placeholder="10-digit number"
                  className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:px-4 sm:text-base"
                  required
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                We’ll send a one-time password to verify your number.
              </p>

              {error && (
                <div role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Please wait...
                  </>
                ) : (
                  <>
                    Continue with OTP
                    <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400">NEW TO POSTERS?</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="min-h-12 w-full rounded-2xl border-2 border-violet-100 bg-violet-50/60 px-5 py-3 text-sm font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              Create your account <span className="ml-1">↗</span>
            </button>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-3 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">🔐</span>
              <div>
                <p className="text-sm font-bold text-slate-700">Your account, protected</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Never share your verification code with anyone.
                </p>
              </div>
            </div>

            {!isStandalone && isMobileDevice && (
              <button
                type="button"
                onClick={() => setShowInstallPrompt(true)}
                className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
              >
                <span aria-hidden="true">↓</span>
                Install Posters for quick access
              </button>
            )}

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              © {new Date().getFullYear()} Posters. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
