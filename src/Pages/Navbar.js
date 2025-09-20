import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoCartOutline,
  IoMenuOutline,
  IoAddOutline,
  IoLogoWindows,
  IoPencil,
  IoStarOutline,
  IoHome,
  IoPerson,
  IoWallet,
  IoCart,
  IoMenu,
  IoAdd,
  IoStar,
  IoAppsOutline,
  IoApps,
  IoSparklesOutline,
  IoSparkles,
  IoCreateOutline,
  IoCreate,
} from "react-icons/io5";
import { CiChat1 } from "react-icons/ci";
import axios from "axios";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [cartCount, setCartCount] = useState(0); // Cart count state
  const navigate = useNavigate();
  const location = useLocation();

  const staffId = localStorage.getItem("staffId");

  // Get current active route
  const getCurrentRoute = () => {
    const path = location.pathname;
    if (path === "/home" || path === "/") return "home";
    if (path === "/categories") return "categories";
    if (path === "/horoscope") return "horoscope";
    if (path === "/create") return "create";
    if (path === "/customer") return "customer";
    return "home"; // default
  };

  const activeRoute = getCurrentRoute();

  // Fetch Wallet Balance
  useEffect(() => {
    if (staffId) {
      axios
        .get(`http://31.97.206.144:4051/api/staff/wallet/${staffId}`)
        .then((response) => {
          setWalletBalance(response.data.wallet_balance);
        })
        .catch((error) => {
          console.error("Error fetching wallet data:", error);
        });
    }
  }, [staffId]);

  // Fetch Cart Count
  useEffect(() => {
    if (staffId) {
      axios
        .get(`http://31.97.206.144:4051/api/staff/mycart/${staffId}`)
        .then((response) => {
          if (response.data && response.data.items) {
            setCartCount(response.data.items.length); // Set items length
          }
        })
        .catch((error) => {
          console.error("Error fetching cart data:", error);
        });
    }
  }, [staffId]);

  // Reusable Icon Wrapper with improved styling
  const IconWrapper = ({ children, color = "bg-white", isActive = false }) => (
    <div className={`rounded-full p-3 flex items-center justify-center ${color} shadow-md ${isActive ? 'transform scale-110' : ''
      } transition-transform duration-200`}>
      {children}
    </div>
  );

  const ResponsiveIcon = ({ Icon, activeColor, inactiveColor, isActive }) => (
    <Icon
      className={`${isActive ? activeColor : inactiveColor
        } sm:text-lg md:text-xl lg:text-2xl transition-colors duration-200`}
    />
  );

  // Get icon based on active state
  const getHomeIcon = (isActive) =>
    isActive ? <IoHome size={26} className="text-blue-600" /> : <IoHomeOutline size={26} className="text-gray-500" />;

  const getCategoryIcon = (isActive) =>
    isActive ? <IoApps size={26} className="text-purple-600" /> : <IoAppsOutline size={26} className="text-gray-500" />;

  const getHoroscopeIcon = (isActive) =>
    isActive ? <IoSparkles size={26} className="text-orange-600" /> : <IoSparklesOutline size={26} className="text-gray-500" />;

  const getCreateIcon = (isActive) =>
    isActive ? <IoCreate size={26} className="text-green-600" /> : <IoCreateOutline size={26} className="text-gray-500" />;

  const getCustomerIcon = (isActive) =>
    isActive ? <IoPerson size={26} className="text-indigo-600" /> : <IoPersonOutline size={26} className="text-gray-500" />;

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-white py-2 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/home" className="flex items-center gap-2 no-underline">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              <h3 className="font-bold text-xl text-gray-900">EDITEZY</h3>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            {/* Desktop Nav */}
            {/* Desktop Nav */}
            <div className="hidden lg:flex gap-6 text-gray-700 text-sm font-medium">
              <button
                onClick={() => navigate("/home")}
                className={`flex items-center gap-1 ${activeRoute === "home"
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
                  }`}
              >
                <ResponsiveIcon
                  Icon={IoHomeOutline}
                  activeColor="text-blue-600"
                  inactiveColor="text-gray-500"
                  isActive={activeRoute === "home"}
                />
                Home
              </button>

              <button
                onClick={() => navigate("/categories")}
                className={`flex items-center gap-1 ${activeRoute === "categories"
                  ? "text-purple-600 font-semibold"
                  : "text-gray-700"
                  }`}
              >
                <ResponsiveIcon
                  Icon={IoAppsOutline}
                  activeColor="text-purple-600"
                  inactiveColor="text-gray-500"
                  isActive={activeRoute === "categories"}
                />
                Category
              </button>

              <button
                onClick={() => navigate("/horoscope")}
                className={`flex items-center gap-1 ${activeRoute === "horoscope"
                  ? "text-orange-600 font-semibold"
                  : "text-gray-700"
                  }`}
              >
                <ResponsiveIcon
                  Icon={IoSparklesOutline}
                  activeColor="text-orange-600"
                  inactiveColor="text-gray-500"
                  isActive={activeRoute === "horoscope"}
                />
                Horoscope
              </button>

              <button
                onClick={() => navigate("/create")}
                className={`flex items-center gap-1 ${activeRoute === "create"
                  ? "text-green-600 font-semibold"
                  : "text-gray-700"
                  }`}
              >
                <ResponsiveIcon
                  Icon={IoCreateOutline}
                  activeColor="text-green-600"
                  inactiveColor="text-gray-500"
                  isActive={activeRoute === "create"}
                />
                Create
              </button>

              <button
                onClick={() => navigate("/customer")}
                className={`flex items-center gap-1 ${activeRoute === "customer"
                  ? "text-indigo-600 font-semibold"
                  : "text-gray-700"
                  }`}
              >
                <ResponsiveIcon
                  Icon={IoPersonOutline}
                  activeColor="text-indigo-600"
                  inactiveColor="text-gray-500"
                  isActive={activeRoute === "customer"}
                />
                Customers
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t z-50">
        <div className="flex justify-around items-center py-2 h-16">
          {/* Home */}
          <button
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center text-[10px] ${activeRoute === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}
          >
            <IconWrapper
              color={activeRoute === 'home' ? "bg-blue-50" : "bg-gray-50"}
              isActive={activeRoute === 'home'}
            >
              <IoHomeOutline className="text-blue-500 lg:text-lg md:text-xl sm:text-xl" />
            </IconWrapper>
            Home
          </button>

          {/* Category */}
          <button
            onClick={() => navigate("/categories")}
            className={`flex flex-col items-center text-[10px] ${activeRoute === 'categories' ? 'text-purple-600 font-semibold' : 'text-gray-700'
              }`}
          >
            <IconWrapper
              color={activeRoute === 'categories' ? "bg-purple-50" : "bg-gray-50"}
              isActive={activeRoute === 'categories'}
            >
              <IoAppsOutline className="text-purple-500 lg:text-lg md:text-xl sm:text-xl" />
            </IconWrapper>
            Category
          </button>

          {/* Horoscope */}
          <button
            onClick={() => navigate("/horoscope")}
            className={`flex flex-col items-center text-[10px] ${activeRoute === 'horoscope' ? 'text-orange-600 font-semibold' : 'text-gray-700'
              }`}
          >
            <IconWrapper
              color={activeRoute === 'horoscope' ? "bg-orange-50" : "bg-gray-50"}
              isActive={activeRoute === 'horoscope'}
            >
              <IoSparklesOutline className="text-orange-500 lg:text-lg md:text-xl sm:text-xl" />
            </IconWrapper>
            Horoscope
          </button>

          {/* Create */}
          <button
            onClick={() => navigate("/create")}
            className={`flex flex-col items-center text-[10px] ${activeRoute === 'create' ? 'text-green-600 font-semibold' : 'text-gray-700'
              }`}
          >
            <IconWrapper
              color={activeRoute === 'create' ? "bg-green-50" : "bg-gray-50"}
              isActive={activeRoute === 'create'}
            >
              <IoCreateOutline className="text-green-500 lg:text-lg md:text-xl sm:text-xl" />
            </IconWrapper>
            Create
          </button>

          {/* Customers */}
          <button
            onClick={() => navigate("/customer")}
            className={`flex flex-col items-center text-[10px] ${activeRoute === 'customer' ? 'text-indigo-600 font-semibold' : 'text-gray-700'
              }`}
          >
            <IconWrapper
              color={activeRoute === 'customer' ? "bg-indigo-50" : "bg-gray-50"}
              isActive={activeRoute === 'customer'}
            >
              <IoPersonOutline className="text-indigo-500 lg:text-lg md:text-xl sm:text-xl" />
            </IconWrapper>
            Customers
          </button>
        </div>
      </div>

    </>
  );
};

export default Navbar;