
import React, { useState } from "react";
import {
  FaGift,
  FaClipboard,
  FaShareAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { FiCopy } from "react-icons/fi";

const ReferModal = ({ isOpen, onClose, referralCode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy referral code:", error);
    }
  };

  const handleShare = async () => {
    const referralLink = "https://editezy.com/";

    const shareMessage = `🎉 Join me on Editezy and get started!

Use my referral code: ${referralCode || ""}

Visit: ${referralLink}

#ReferAndEarn #Editezy`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Editezy",
          text: shareMessage,
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        alert("Referral message copied. Share it with your friends!");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Unable to share referral:", error);
      }
    }
  };

  const steps = [
    {
      step: "01",
      title: "Share your code",
      description: "Send your referral code to a friend.",
    },
    {
      step: "02",
      title: "Your friend upgrades",
      description: "They sign up and upgrade to a qualifying plan.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="refer-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-700 px-4 py-4 sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-4 h-20 w-20 rounded-full border border-white/10" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-11 sm:w-11">
                <FaGift className="text-lg text-white sm:text-xl" />
              </span>

              <div className="min-w-0">
                <h2
                  id="refer-modal-title"
                  className="text-lg font-bold tracking-tight text-white sm:text-xl"
                >
                  Refer & Earn
                </h2>
                <p className="mt-0.5 text-xs text-violet-100 sm:text-sm">
                  Good things are better shared
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close referral dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 md:p-6">
          {/* Reward */}
          <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-3 sm:px-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
              💰
            </span>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                Earn ₹200 in rewards
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600 sm:text-sm">
                When your friend upgrades their plan
              </p>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Your referral code
              </h3>

              {copied && (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600">
                  <FaCheckCircle />
                  Copied
                </span>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-dashed border-violet-200 bg-violet-50/60 p-3 sm:gap-3 sm:p-4">
              <p className="min-w-0 flex-1 break-all font-mono text-base font-bold tracking-wide text-violet-800 sm:text-xl sm:tracking-wider">
                {referralCode || "No code available"}
              </p>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!referralCode}
                aria-label="Copy referral code"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700 shadow-sm ring-1 ring-violet-100 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {copied ? <FaCheckCircle /> : <FiCopy size={18} />}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              How it works
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {item.step}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1 sm:gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!referralCode}
              className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 sm:gap-2 sm:px-4"
            >
              {copied ? (
                <FaCheckCircle className="shrink-0 text-emerald-500" />
              ) : (
                <FaClipboard className="shrink-0 text-slate-500" />
              )}
              <span>{copied ? "Code Copied" : "Copy Code"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-violet-700 px-2 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 sm:gap-2 sm:px-4"
            >
              <FaShareAlt className="shrink-0 text-sm" />
              <span>Share Referral</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReferModal;
