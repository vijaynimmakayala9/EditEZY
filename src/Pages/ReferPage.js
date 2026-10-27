
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import {
  FaGift,
  FaClipboard,
  FaShareAlt,
  FaCheckCircle,
  FaUserFriends,
  FaArrowLeft,
  FaUserPlus,
  FaUserCheck,
  FaCoins,
  FaWallet,
  FaUniversity,
  FaTimes,
  FaSpinner,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReferAndPay = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError("Please log in to view your referral rewards.");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchWalletAndReferral = async () => {
      try {
        setLoading(true);
        setError("");

        const [walletRes, referralRes] = await Promise.all([
          axios.get(`https://api.editezy.com/api/users/wallet/${userId}`),
          axios.get(
            `https://api.editezy.com/api/users/refferalcode/${userId}`
          ),
        ]);

        if (walletRes.data.wallet !== undefined) {
          setWalletBalance(walletRes.data.wallet);
        }

        if (referralRes.data.referralCode) {
          setReferralCode(referralRes.data.referralCode);
        }
      } catch (err) {
        console.error("Error fetching wallet or referral code:", err);
        setError("Unable to load your referral details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndReferral();
  }, [userId]);

  const handleCopy = async () => {
    if (!referralCode) {
      setError("Your referral code is not available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setNotice("Referral code copied successfully!");
      setError("");

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Unable to copy referral code:", err);
      setError("Unable to copy automatically. Please copy your code manually.");
    }
  };

  const handleShare = async () => {
    if (!referralCode) {
      setError("Your referral code is not available yet.");
      return;
    }

    const referralLink = "https://editezy.com/";

    const shareMessage = `🎉 Join me on Editezy and get started!

Use my referral code: ${referralCode}

Visit Editezy: ${referralLink}

#ReferAndEarn`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Editezy!",
          text: shareMessage,
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        setNotice("Referral message copied. Share it with your friends!");
      }
      setError("");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Sharing failed:", err);
        setError("Unable to share right now. Please try again.");
      }
    }
  };

  const resetRedeemForm = () => {
    setAccountHolderName("");
    setAccountNumber("");
    setIfscCode("");
    setBankName("");
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Please log in before submitting a redeem request.");
      return;
    }

    if (
      !accountHolderName.trim() ||
      !accountNumber.trim() ||
      !ifscCode.trim() ||
      !bankName.trim()
    ) {
      setError("Please fill in all bank details.");
      return;
    }

    try {
      setRedeemLoading(true);
      setError("");
      setNotice("");

      await axios.post(
        `https://api.editezy.com/api/users/redeem/${userId}`,
        {
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          bankName: bankName.trim(),
        }
      );

      setShowRedeemModal(false);
      resetRedeemForm();
      setNotice("Your redeem request has been submitted successfully.");
    } catch (err) {
      console.error("Redeem failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit your redeem request. Please try again."
      );
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;

    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  };

  const steps = [
    {
      number: "01",
      title: "Invite a Friend",
      description: "Share your unique referral code with friends.",
      icon: <FaUserPlus />,
      color: "bg-violet-100 text-violet-600",
    },
    {
      number: "02",
      title: "Friend Signs Up",
      description: "Your friend enters your referral code during signup.",
      icon: <FaUserCheck />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      number: "03",
      title: "Earn Rewards",
      description: "Rewards are credited according to the referral program.",
      icon: <FaCoins />,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen w-full pb-12 overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/60">
      <Navbar />

      {/* Page Header */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-violet-100 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 sm:h-12 sm:w-12"
          >
            <FaArrowLeft />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Refer & Earn
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Invite friends and manage your rewards
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600 sm:h-12 sm:w-12">
            <FaGift />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="min-w-0 flex-1 break-words">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 font-bold"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <FaCheckCircle className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 break-words">{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
              className="shrink-0 font-bold"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Main Responsive Layout */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-8">
          {/* Left Column */}
          <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Wallet Card */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 p-5 text-white shadow-xl shadow-violet-900/15 sm:p-7 lg:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl sm:h-64 sm:w-64" />
              <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl sm:h-14 sm:w-14">
                      <FaWallet />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-violet-100 sm:text-base">
                        Your Rewards Wallet
                      </p>
                      <h2 className="mt-1 text-lg font-extrabold sm:text-xl">
                        Earn & Redeem
                      </h2>
                    </div>
                  </div>

                  {loading && (
                    <FaSpinner className="shrink-0 animate-spin text-xl text-white/80" />
                  )}
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:mt-8 sm:gap-4">
                  <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
                    <p className="text-xs leading-5 text-violet-100 sm:text-sm">
                      Total Earning Till Date
                    </p>
                    <p className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">
                      ₹{formatCurrency(walletBalance)}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
                    <p className="text-xs leading-5 text-violet-100 sm:text-sm">
                      Current Balance
                    </p>
                    <p className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">
                      ₹{formatCurrency(walletBalance)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setNotice("");
                    setShowRedeemModal(true);
                  }}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-violet-700 shadow-lg transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-700 sm:mt-6"
                >
                  <FaWallet />
                  Redeem Now
                  <FaArrowRight className="ml-1 text-sm" />
                </button>
              </div>
            </section>

            {/* Referral Code Card */}
            <section className="min-w-0 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg text-violet-700 sm:h-12 sm:w-12">
                  <FaGift />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                    Your Referral Code
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    Share your code with friends to introduce them to Editezy.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex min-w-0 flex-col gap-3 rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-3 min-[420px]:flex-row min-[420px]:items-center sm:p-4">
                <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3 sm:px-4">
                  <FaGift className="shrink-0 text-violet-500" />
                  <span className="min-w-0 break-all font-mono text-sm font-bold tracking-wide text-slate-800 sm:text-base">
                    {referralCode || (loading ? "Loading..." : "Unavailable")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 min-[420px]:flex min-[420px]:shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!referralCode}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                  >
                    {copied ? (
                      <FaCheckCircle className="text-emerald-500" />
                    ) : (
                      <FaClipboard />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={!referralCode}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                  >
                    <FaShareAlt />
                    Share
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500 sm:text-sm">
                Refer friends and earn rewards according to the applicable
                referral program terms.
              </p>
            </section>

            {/* Bonus Banner */}
            <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl text-white shadow-lg shadow-violet-500/20 sm:h-16 sm:w-16 sm:text-3xl">
                  <FaUserFriends />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    Spread the word
                  </span>
                  <h3 className="mt-1 break-words text-base font-extrabold text-slate-900 sm:text-lg">
                    Introduce a Friend & Get Rewards!
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                    Invite friends to discover Editezy using your referral code.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <aside className="min-w-0 space-y-5 sm:space-y-6">
            {/* How It Works */}
            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 sm:h-12 sm:w-12">
                  <FaUserFriends />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                    How It Works
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Three simple steps
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {steps.map((step, index) => (
                  <div key={step.number} className="relative flex gap-3 sm:gap-4">
                    {index !== steps.length - 1 && (
                      <div className="absolute left-5 top-12 h-[calc(100%+4px)] w-px bg-slate-200 sm:left-6" />
                    )}

                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base sm:h-12 sm:w-12 ${step.color}`}
                    >
                      {step.icon}
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-sm font-bold text-slate-900 sm:text-base">
                          {step.title}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          STEP {index + 1}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Share CTA */}
            <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white shadow-lg sm:p-6 lg:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                <FaShareAlt />
              </div>

              <h3 className="mt-4 text-lg font-extrabold sm:text-xl">
                Know someone who would love Editezy?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Send your referral code directly to friends and invite them to
                join.
              </p>

              <button
                type="button"
                onClick={handleShare}
                disabled={!referralCode}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-900 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaShareAlt />
                Share Referral Code
                <FaArrowRight />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!referralCode}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <FaCheckCircle /> : <FaClipboard />}
                {copied ? "Code Copied" : "Copy Referral Code"}
              </button>
            </section>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-6 rounded-2xl border border-slate-100 bg-white px-4 py-5 text-center shadow-sm sm:mt-8 sm:px-6">
          <p className="text-xs leading-5 text-slate-500 sm:text-sm">
            Share your code with friends and enjoy the benefits of referring
            them to Editezy.
          </p>
        </footer>
      </main>

      {/* Responsive Redeem Modal */}
      {showRedeemModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => {
            if (!redeemLoading) setShowRedeemModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="redeem-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white sm:p-7">
              <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10 blur-xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl">
                    <FaUniversity />
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="redeem-title"
                      className="text-xl font-extrabold sm:text-2xl"
                    >
                      Redeem Wallet
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-violet-100 sm:text-sm">
                      Enter your bank details to request a payout.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  disabled={redeemLoading}
                  aria-label="Close redeem form"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="relative mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-medium text-violet-100">
                  Available Wallet Balance
                </p>
                <p className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  ₹{formatCurrency(walletBalance)}
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleRedeemSubmit}
              className="space-y-4 p-4 sm:p-7"
            >
              <div>
                <label
                  htmlFor="account-holder"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Account Holder Name
                </label>
                <input
                  id="account-holder"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter account holder name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  required
                  disabled={redeemLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="account-number"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Account Number
                </label>
                <input
                  id="account-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Enter bank account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  required
                  disabled={redeemLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="ifsc-code"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    IFSC Code
                  </label>
                  <input
                    id="ifsc-code"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:px-4"
                    required
                    disabled={redeemLoading}
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="bank-name"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Bank Name
                  </label>
                  <input
                    id="bank-name"
                    type="text"
                    autoComplete="organization"
                    placeholder="Enter bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:px-4"
                    required
                    disabled={redeemLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 min-[420px]:flex-row">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  disabled={redeemLoading}
                  className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={redeemLoading}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {redeemLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferAndPay;
