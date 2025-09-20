import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCheck, FaCreditCard, FaLock, FaArrowRight } from "react-icons/fa";
import Navbar from "./Navbar";

const SinglePlan = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [user, setUser] = useState(null);

  // Load user data and Razorpay script
  useEffect(() => {
    // Load user data from localStorage
    const userId = localStorage.getItem("userId");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userId && userData) {
      setUser({ _id: userId, ...userData });
    }

    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      console.log("Razorpay script loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      setResponseMessage("Failed to load payment gateway. Please refresh the page.");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch plan details by id
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log(id)
        const response = await axios.get(`https://api.editezy.com/api/plans/singleplan/${id}`);
        if (response.data && response.data.plan) {
          setPlan(response.data.plan);
        }
      } catch (error) {
        console.error("Error fetching plan", error);
        setResponseMessage("Error fetching plan data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      setResponseMessage("Please log in to purchase a plan.");
      return;
    }

    if (!razorpayLoaded) {
      setResponseMessage("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setResponseMessage("Processing payment...");

    try {
      // Calculate amount (same logic as backend)
      let offerPrice = plan.offerPrice ?? plan.originalPrice ?? 0;
      if (user.referredBy && offerPrice > 100) offerPrice -= 100;
      const amount = Math.round(offerPrice * 100); // Convert to paise

      // Create Razorpay order options
      const options = {
        key: "rzp_test_BxtRNvflG06PTV",
        amount: amount,
        currency: "INR",
        name: "Your Company Name",
        description: `Purchase ${plan.name}`,
        image: "https://your-logo-url.com/logo.png",
        handler: async function (response) {
          // Send payment verification to your backend
          try {
            setResponseMessage("Verifying payment...");

            const verificationResponse = await axios.post("https://api.editezy.com/api/payment/payWithRazorpay", {
              userId: user._id,
              planId: plan._id,
              transactionId: response.razorpay_payment_id
            });

            if (verificationResponse.data.success) {
              setResponseMessage(`Payment successful! ${verificationResponse.data.message}`);
              // Update user data in localStorage if needed

              // Redirect or show success message
            } else {
              setResponseMessage(`Payment failed: ${verificationResponse.data.message}`);
            }
          } catch (error) {
            console.error("Error during payment verification", error);
            setResponseMessage("Error during payment verification. Please contact support.");
          }
        },
        prefill: {
          name: user.name || "Customer",
          email: user.email || "customer@example.com",
          contact: user.phone || "9999999999"
        },
        notes: {
          planId: plan._id,
          userId: user._id
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        setResponseMessage(`Payment failed: ${response.error.reason || "Unknown error"}`);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Error initiating payment", error);
      setResponseMessage("Error initiating payment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">Loading plan details...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">Plan not found.</div>
      </div>
    );
  }

  // Calculate display price (same logic as backend)
  let displayPrice = plan.offerPrice ?? plan.originalPrice ?? 0;
  if (user && user.referredBy && displayPrice > 100) {
    displayPrice -= 100;
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-8 px-4 mb-5">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">{plan.name}</h1>

          {/* Price Section */}
          <div className="flex items-baseline justify-center mt-4">
            {plan.originalPrice && plan.originalPrice > displayPrice && (
              <span className="text-lg line-through opacity-75 mr-2">
                ₹{plan.originalPrice}
              </span>
            )}
            <span className="text-3xl font-bold">₹{displayPrice}</span>
            <span className="ml-2 text-sm opacity-90">/{plan.duration}</span>
          </div>

          {/* Referral Discount Info */}
          {user && user.referredBy && displayPrice < (plan.offerPrice ?? plan.originalPrice) && (
            <div className="mt-2 text-sm bg-white bg-opacity-20 inline-block px-2 py-1 rounded-full">
              ₹100 discount applied from referral!
            </div>
          )}

          {/* ✅ Savings Section */}
          {plan.originalPrice && plan.offerPrice && plan.originalPrice > plan.offerPrice && (
            <div className="mt-3 text-sm font-medium bg-white text-indigo-700 px-3 py-1 rounded-full inline-block">
              🎉 You Save ₹{plan.originalPrice - plan.offerPrice} ({plan.discountPercentage}% OFF)
            </div>
          )}
        </div>


        {/* Plan Features */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Plan Features</h2>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Payment Method */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FaCreditCard className="text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-blue-800">Digital Payment</h3>
                <p className="text-sm text-blue-600">Secure payment via UPI, Cards & More</p>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <FaLock className="mr-2" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>

        {/* Subscribe Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handlePurchase}
            disabled={!razorpayLoaded || !user}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {!user ? "Please Login to Purchase" : razorpayLoaded ? (
              <>
                <span>Subscribe Now</span>
                <FaArrowRight className="ml-2" />
              </>
            ) : (
              "Loading Payment..."
            )}
          </button>
        </div>
      </div>

      {/* Response Message */}
      {responseMessage && (
        <div className={`max-w-md mx-auto mt-4 p-4 rounded-lg text-center ${responseMessage.includes("successful") ? "bg-green-100 text-green-700 border border-green-200" :
            responseMessage.includes("Error") || responseMessage.includes("failed") ? "bg-red-100 text-red-700 border border-red-200" :
              "bg-blue-100 text-blue-700 border border-blue-200"
          }`}>
          {responseMessage}
        </div>
      )}
    </div>
    </>
  );
};

export default SinglePlan;