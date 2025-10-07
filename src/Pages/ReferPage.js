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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReferAndPay = () => {
    const [walletBalance, setWalletBalance] = useState(0); // dynamic wallet
    const [referralCode, setReferralCode] = useState(""); // default fallback
    const [userId, setUserId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);

    // Redeem form fields
    const [accountHolderName, setAccountHolderName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [bankName, setBankName] = useState("");
    const [redeemLoading, setRedeemLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);

        }
    }, []);

    console.log(userId)


    useEffect(() => {
        const fetchWalletAndReferral = async () => {
            try {
                // Fetch wallet
                const walletRes = await axios.get(
                    `https://api.editezy.com/api/users/wallet/${userId}`
                );
                if (walletRes.data.wallet !== undefined) {
                    setWalletBalance(walletRes.data.wallet);
                }

                // Fetch referral code
                const referralRes = await axios.get(
                    `https://api.editezy.com/api/users/refferalcode/${userId}`
                );
                if (referralRes.data.referralCode) {
                    setReferralCode(referralRes.data.referralCode);
                    console.log(referralRes.data.referralCode);
                }
            } catch (error) {
                console.error("Error fetching wallet or referral code:", error);
            }
        };

        if (userId) {
            fetchWalletAndReferral();

        }
    }, [userId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const referralLink = `https://editezy.com/`;
        const shareMessage = `
        🎉 Join me on our amazing app and get instant rewards! 🎉

        Use my referral code: ${referralCode}

        
        Download the app now and start earning!

        #ReferAndEarn #InstantRewards
        ${referralLink}
        `;

        if (navigator.share) {
            navigator.share({
                title: "Join our platform!",
                text: shareMessage,
                url: referralLink,
            });
        } else {
            alert(`Share this link with your friends:\n\n${shareMessage}`);
        }
    };


    const handleRedeemSubmit = async (e) => {
        e.preventDefault();
        if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
            alert("Please fill in all fields!");
            return;
        }

        try {
            setRedeemLoading(true);
            await axios.post(
                `https://api.editezy.com/api/users/redeem/${userId}`,
                { accountHolderName, accountNumber, ifscCode, bankName }
            );
            alert("Redeem request submitted successfully!");
            setShowRedeemModal(false);
            setAccountHolderName("");
            setAccountNumber("");
            setIfscCode("");
            setBankName("");
            console.log("Details:", accountHolderName, accountNumber, ifscCode, bankName)
        } catch (error) {
            console.error("Redeem failed:", error);
            alert("Failed to submit redeem request.");
        } finally {
            setRedeemLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            {/* Back Button */}
            <div className="flex items-center p-4 max-w-md mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Back</span>
                </button>
            </div>

            <div className="p-4 max-w-md mx-auto mb-5 font-sans bg-gray-50 min-h-screen">
                {/* Page Heading */}
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-purple-700 mb-6">
                    Refer and Earn
                </h1>

                {/* Top Balance Card */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-5 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Earn Now</h2>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center flex-1">
                            <p className="text-2xl font-bold">₹{walletBalance}</p>
                            <p className="text-xs opacity-80">Total Earning till date</p>
                        </div>
                        <div className="text-center flex-1 border-l border-white border-opacity-20">
                            <p className="text-2xl font-bold">₹{walletBalance}</p>
                            <p className="text-xs opacity-80">Current Balance</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRedeemModal(true)}
                        className="w-full bg-white text-purple-600 font-semibold py-3 rounded-lg shadow hover:bg-gray-100 transition-colors"
                    >
                        Redeem Now
                    </button>
                </div>

                {/* Referral Code Box */}
                <div className="flex flex-col sm:flex-row items-center bg-purple-50 rounded-lg p-3 sm:p-4 justify-between gap-3 sm:gap-0 mt-6">
                    <div className="flex items-center space-x-2">
                        <FaGift className="text-purple-600 text-xl sm:text-2xl" />
                        <p className="font-mono text-base sm:text-lg font-semibold break-all">
                            {referralCode}
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleCopy}
                            className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
                            aria-label="Copy referral code"
                        >
                            {copied ? (
                                <FaCheckCircle className="text-green-500 text-lg sm:text-xl" />
                            ) : (
                                <FaClipboard className="text-gray-600 text-lg sm:text-xl" />
                            )}
                        </button>
                        <button
                            onClick={handleShare}
                            className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-1 hover:bg-purple-700 transition-colors text-sm sm:text-base"
                        >
                            <FaShareAlt className="text-sm sm:text-base" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Info Text */}
                <p className="text-xs sm:text-sm text-gray-600 mt-3 text-center sm:text-left">
                    Did you know you can earn up to ₹2000 by referring 10 friends in a month?
                </p>

                {/* Bonus Info */}
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-5 shadow-md mt-6 border border-indigo-100">
                    <div className="flex items-center space-x-4">
                        {/* Icon */}
                        <div className="bg-purple-600 p-3 rounded-full flex-shrink-0">
                            <FaUserFriends className="text-white text-xl" />
                        </div>

                        {/* Text */}
                        <div>
                            <h4 className="font-semibold text-purple-800 text-lg">
                                Introduce a Friend & Get Rewards!
                            </h4>
                            {/* <p className="text-sm text-gray-700 mt-1">
                                Get <span className="font-semibold text-purple-600">30 Credit</span> INSTANTLY!
                                Bonus: Get <span className="font-semibold text-purple-600">50 Credit</span> More When They Make a Purchase!
                            </p> */}
                        </div>
                    </div>
                </div>


                {/* How it Works Section */}
                <div className="mt-6 bg-white rounded-xl p-5 shadow-md">
                    <h4 className="font-semibold text-lg mb-4 text-gray-800">How it works</h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-start space-x-3">
                                <div className="bg-purple-100 p-2 rounded-full mt-1 flex items-center justify-center">
                                    {step === 1 && <FaUserPlus className="text-purple-600 text-sm" />}
                                    {step === 2 && <FaUserCheck className="text-purple-600 text-sm" />}
                                    {step === 3 && <FaCoins className="text-purple-600 text-sm" />}
                                </div>
                                <div>
                                    {step === 1 && (
                                        <>
                                            <p className="font-medium text-gray-800">Invite a friend</p>
                                            <p className="text-sm text-gray-600">
                                                Share your code using the Share button.
                                            </p>
                                        </>
                                    )}
                                    {step === 2 && (
                                        <>
                                            <p className="font-medium text-gray-800">Friend signs up</p>
                                            <p className="text-sm text-gray-600">
                                                They enter your code during signup or in settings.
                                            </p>
                                        </>
                                    )}
                                    {step === 3 && (
                                        <>
                                            <p className="font-medium text-gray-800">You get rewards</p>
                                            <p className="text-sm text-gray-600">
                                                Credits are added after successful first purchase.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row justify-center sm:space-x-3 space-y-3 sm:space-y-0">
                    <button
                        onClick={handleCopy}
                        className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                        {copied ? (
                            <FaCheckCircle className="text-green-500" />
                        ) : (
                            <FaClipboard className="text-gray-600" />
                        )}
                        <span className="text-sm font-medium">Copy Code</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors"
                    >
                        <FaShareAlt className="text-sm" />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Redeem Modal */}
            {showRedeemModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3"
                    onClick={() => setShowRedeemModal(false)}
                >
                    <div
                        className="bg-white rounded-lg w-full max-w-md p-5 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-purple-700 mb-4">
                            Redeem Wallet
                        </h2>
                        <form onSubmit={handleRedeemSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Account Holder Name"
                                value={accountHolderName}
                                onChange={(e) => setAccountHolderName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Account Number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="IFSC Code"
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <button
                                type="submit"
                                disabled={redeemLoading}
                                className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                {redeemLoading ? "Submitting..." : "Submit Redeem Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReferAndPay;
