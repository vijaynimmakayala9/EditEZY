
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { FaCheckCircle, FaCrown } from "react-icons/fa";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check if user has a valid plan
  const hasValidPlan = () => {
    try {
      const subscribedPlans = JSON.parse(
        localStorage.getItem("subscribedPlans") || "[]"
      );

      if (!Array.isArray(subscribedPlans) || subscribedPlans.length === 0) {
        return false;
      }

      const currentDate = new Date();

      return subscribedPlans.some(
        (plan) => plan.endDate && new Date(plan.endDate) > currentDate
      );
    } catch (error) {
      console.error("Error checking subscribed plans:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!hasValidPlan()) {
      const fetchPlans = async () => {
        try {
          const response = await axios.get(
            "https://api.editezy.com/api/plans/getallplan"
          );

          if (response.data && response.data.plans) {
            setPlans(response.data.plans);
            setIsModalOpen(true);
          }
        } catch (error) {
          console.error("Error fetching plans", error);
        }
      };

      fetchPlans();
    }
  }, []);

  const handlePlanClick = (planId) => {
    setIsModalOpen(false);
    navigate(`/singleplan/${planId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    if (location.pathname === "/plans") {
      navigate(-1);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4"
      onClick={closeModal}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="plans-modal-title"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-700 px-4 py-4 sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-4 h-20 w-20 rounded-full border border-white/10" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-11 sm:w-11">
                <MdOutlineStarPurple500 className="text-xl text-white sm:text-2xl" />
              </span>

              <div className="min-w-0">
                <h2
                  id="plans-modal-title"
                  className="text-lg font-bold tracking-tight text-white sm:text-xl"
                >
                  Choose Your Plan
                </h2>
                <p className="mt-0.5 text-xs text-violet-100 sm:text-sm">
                  Unlock your creative potential
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close plans dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              ×
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-5 md:p-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="rounded-xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/70 p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:rounded-2xl sm:p-5"
            >
              {/* Plan name and price */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <FaCrown />
                  </span>

                  <div className="min-w-0">
                    <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                      {plan.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {plan.duration}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold leading-tight text-violet-700 sm:text-2xl">
                    ₹{plan.offerPrice}
                  </p>

                  {plan.originalPrice && (
                    <p className="mt-1 text-xs text-slate-400 line-through sm:text-sm">
                      ₹{plan.originalPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Included features */}
              <div className="mt-4 border-t border-violet-100 pt-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600 sm:text-sm">
                  What's included
                </p>

                <ul className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-600 sm:text-sm"
                      >
                        <FaCheckCircle className="mt-1 shrink-0 text-emerald-500" />
                        <span className="break-words">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <FaCheckCircle className="shrink-0 text-emerald-500" />
                      Full Access
                    </li>
                  )}
                </ul>
              </div>

              {/* Select Plan */}
              <button
                type="button"
                onClick={() => handlePlanClick(plan._id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
              >
                Select Plan
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Plans;
