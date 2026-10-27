
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  IoHomeOutline,
  IoHome,
  IoAppsOutline,
  IoApps,
  IoSparklesOutline,
  IoSparkles,
  IoCreateOutline,
  IoCreate,
  IoPersonOutline,
  IoPerson,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { FaSignOutAlt } from "react-icons/fa";

const NAV_ITEMS = [
  {
    label: "Home",
    path: "/home",
    key: "home",
    Icon: IoHomeOutline,
    ActiveIcon: IoHome,
  },
  {
    label: "Category",
    path: "/categories",
    key: "categories",
    Icon: IoAppsOutline,
    ActiveIcon: IoApps,
  },
  {
    label: "Horoscope",
    path: "/horoscope",
    key: "horoscope",
    Icon: IoSparklesOutline,
    ActiveIcon: IoSparkles,
  },
  {
    label: "Create",
    path: "/create",
    key: "create",
    Icon: IoCreateOutline,
    ActiveIcon: IoCreate,
  },
  {
    label: "Customers",
    path: "/customer",
    key: "customer",
    Icon: IoPersonOutline,
    ActiveIcon: IoPerson,
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (item) =>
    location.pathname === item.path ||
    (item.key === "home" && location.pathname === "/");

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    [
      "userId",
      "userName",
      "userMobile",
      "userEmail",
      "subscribedPlans",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/");
  };

  const DesktopNavItem = ({ item }) => {
    const active = isActive(item);
    const Icon = active ? item.ActiveIcon : item.Icon;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => navigate(item.path)}
        aria-current={active ? "page" : undefined}
        className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
          active
            ? "bg-violet-50 text-violet-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-violet-700"
        }`}
      >
        <Icon
          className={`text-xl transition-transform duration-200 group-hover:scale-110 ${
            active ? "text-violet-700" : "text-slate-400"
          }`}
        />
        {item.label}

        {active && (
          <span className="absolute inset-x-3 -bottom-[1px] h-[3px] rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
        )}
      </button>
    );
  };

  const MobileNavItem = ({ item }) => {
    const active = isActive(item);
    const Icon = active ? item.ActiveIcon : item.Icon;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => navigate(item.path)}
        aria-current={active ? "page" : undefined}
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-all duration-200 sm:text-xs ${
          active
            ? "bg-violet-50 text-violet-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-violet-700"
        }`}
      >
        <Icon
          className={`text-[21px] transition-transform duration-200 sm:text-2xl ${
            active ? "scale-110 text-violet-700" : ""
          }`}
        />
        <span className="max-w-full truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_4px_24px_rgba(30,27,75,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-3 sm:h-[76px] sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/home"
            aria-label="Editezy home"
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-1.5 shadow-lg shadow-violet-200 sm:h-11 sm:w-11">
              <img
                src="/logo.png"
                alt="EDITEZY"
                className="h-full w-full object-contain"
              />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                EDIT<span className="text-violet-700">EZY</span>
              </span>
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">
                Create something beautiful
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <DesktopNavItem key={item.key} item={item} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-violet-700 hover:shadow-md lg:flex"
            >
              <FaSignOutAlt className="text-base" />
              Logout
            </button>

            {/* Mobile / Tablet Menu Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={
                menuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 xl:hidden sm:h-11 sm:w-11"
            >
              {menuOpen ? (
                <IoCloseOutline className="text-2xl" />
              ) : (
                <IoMenuOutline className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Tablet / Compact Screen Menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-3 py-3 shadow-lg sm:px-6 xl:hidden">
            <nav
              className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 sm:grid-cols-3"
              aria-label="Compact navigation"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                const Icon = active ? item.ActiveIcon : item.Icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-violet-700"
                    }`}
                  >
                    <Icon className="text-xl" />
                    {item.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <FaSignOutAlt className="text-lg" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-1 pt-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(30,27,75,0.08)] backdrop-blur-xl xl:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-xl items-center justify-around gap-1">
          {NAV_ITEMS.map((item) => (
            <MobileNavItem key={item.key} item={item} />
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
