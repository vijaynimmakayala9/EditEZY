import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdOutlineStarPurple500 } from "react-icons/md"; // ⭐ purple star icon

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // ✅ Check if user has a valid plan
  const hasValidPlan = () => {
    const subscribedPlans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (subscribedPlans.length === 0) return false;

    const currentDate = new Date();
    return subscribedPlans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  useEffect(() => {
    // Only fetch and show plans if user doesn't have a valid plan
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
    navigate(`/singleplan/${planId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 p-2 rounded-md">
                  <MdOutlineStarPurple500 className="text-white text-xl" />
                </span>
                <h2 className="text-white text-lg font-semibold">
                  Choose Your Plan
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-purple-50 p-4 rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.duration}</p>
                    </div>
                    <p className="text-purple-600 text-2xl font-bold">
                      ₹{plan.offerPrice}{" "}
                      {plan.originalPrice && (
                        <span className="line-through text-gray-400 text-base ml-1">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* What's included */}
                  <div className="mt-3">
                    <p className="text-sm font-medium">What's included:</p>
                    <ul className="text-sm text-gray-700 mt-1 list-disc pl-5 space-y-1">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((f, i) => <li key={i}>{f}</li>)
                      ) : (
                        <li>Full Access</li>
                      )}
                    </ul>
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => handlePlanClick(plan._id)}
                    className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Plans;
