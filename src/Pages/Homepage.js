import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import ProfileHeader from "./ProfileHeader";
import BannerCarousel from "./BannerCarousel";
import StoryPage from "./StoryPage";
import FestivalPage from "./FestivalPage";
import CategoryWisePoster from "./CategoryWisePoster";
import Plans from "./Plans"; // Import the Plans component
import ReferModal from "./ReferAndPay";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [showReferModal, setShowReferModal] = useState(false); // State for the Refer and Earn modal
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to control Plans modal visibility
  const [referralCode, setReferralCode] = useState("");
  const [hasValidPlan, setHasValidPlan] = useState(false); // State to track if user has valid plan

  const navigate = useNavigate();

  // ✅ Check if user has a valid plan
  const checkUserPlan = () => {
    const subscribedPlans = JSON.parse(localStorage.getItem("subscribedPlans") || "[]");
    if (subscribedPlans.length === 0) return false;

    const currentDate = new Date();
    return subscribedPlans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  // Fetch referral code and set modal state
  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await axios.get(`https://api.editezy.com/api/users/refferalcode/${userId}`);
        setReferralCode(response.data.referralCode); // Adjust according to API response
        setShowReferModal(true); // Open modal automatically once code is fetched
      } catch (error) {
        console.error("Failed to fetch referral code:", error);
      }
    };

    fetchReferralCode();
  }, []);

  // Check if user has a valid plan, and set state accordingly
  useEffect(() => {
    // Every time component mounts or rerenders, check the user's plan
    const validPlan = checkUserPlan();
    setHasValidPlan(validPlan);

    // If the user doesn't have a valid plan, show the Plans modal immediately
    if (!validPlan) {
      setIsModalOpen(true);  // Open the "Plans" modal if no valid plan is found
    }
  }, []);  // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md mb-20">
        <Navbar />
      </div>

      {/* Content Section */}
      <div className="pt-[90px] bg-gray-50 flex-1 mb-5">
        {/* Profile Header (ensure this is rendered first) */}
        <ProfileHeader />
        
        {/* Banner */}
        <div className="my-2">
          <BannerCarousel />
        </div>

        {/* Other Sections */}
        <StoryPage />
        <FestivalPage />
        <CategoryWisePoster />
      </div>

      {/* Refer Modal */}
      <ReferModal
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
        referralCode={referralCode}
      />

      {/* Show Plans Modal only if no valid plan is found */}
      {isModalOpen && !hasValidPlan && (
        <Plans />
      )}
    </div>
  );
};

export default HomePage;
