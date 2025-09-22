import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BannerCarousel from "./BannerCarousel"; // Import new banner component
import StoryPage from "./StoryPage";
import FestivalPage from "./FestivalPage";
import PremiumPoster from "./PremiumPoster";
import CategoryWisePoster from "./CategoryWisePoster";
import ProfileHeader from "./ProfileHeader";
import Plans from "./Plans"; // Import the Plans component
import ReferAndPay from "./ReferAndPay"; // Import the ReferAndPay component

const HomePage = () => {
  const [showReferModal, setShowReferModal] = useState(false); // State for the Refer and Earn modal

  useEffect(() => {
    // Automatically show the Refer and Earn modal when the page loads
    setShowReferModal(true);

    // Optionally, you could add conditions here to control when the modal should appear
    // e.g., show once per session, after a delay, or based on other conditions
  }, []);

  const closeReferModal = () => {
    setShowReferModal(false); // Close the Refer and Earn modal
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md mb-20">
        <Navbar />
      </div>

      <div className="pt-[90px] bg-gray-50 flex-1 mb-5">
        {/* Banner */}
        <ProfileHeader />
        <div className="my-2">
          <BannerCarousel />
        </div>

        {/* Other Sections */}
        <StoryPage />
        <FestivalPage />
        {/* <PremiumPoster /> */}
        <CategoryWisePoster />
      </div>

      {/* Footer */}
      {/* <div className="mt-auto">
        <Footer />
      </div> */}

      {/* Plans Modal Component */}
      <Plans />

      {/* Refer and Earn Modal */}
      {showReferModal && <ReferAndPay />}
    </div>
  );
};

export default HomePage;
