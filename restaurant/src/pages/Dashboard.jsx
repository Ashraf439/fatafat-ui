
import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toggleRestaurantStatus } from "../api/restaurant";

const TAB_CONFIG = [
  {
    label: "Orders",
    path: "orders",
    icon: "▣",
    roles: [
      "RESTAURANT",
      "RESTAURANT_MANAGER",
      "RESTAURANT_STAFF",
      "RESTAURANT_CASHIER",
    ],
  },
  {
    label: "Staff",
    path: "staff",
    icon: "♙",
    roles: ["RESTAURANT", "RESTAURANT_MANAGER"],
  },
  {
    label: "Menu",
    path: "menu",
    icon: "☷",
    roles: ["RESTAURANT", "RESTAURANT_MANAGER"],
  },
  {
    label: "Analytics",
    path: "analytics",
    icon: "$",
    roles: ["RESTAURANT", "RESTAURANT_MANAGER"],
  }
];

const hasRole = (account, roles) =>
  roles.some((role) => account?.roles?.includes(role));

const Dashboard = () => {
  const { account } = useAuth();

  const visibleTabs = TAB_CONFIG.filter((tab) =>
    hasRole(account, tab.roles)
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EFEDE6]">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="shrink-0 bg-[#1C1B19] text-white shadow-lg">
        {/* Top Bar */}
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Brand / Account */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CD0000]/10">
                <RabbitIcon className="h-7 w-7 text-[#CD0000]" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  Fatafat
                </div>

                <div className="truncate text-xs text-white/45">
                  {account?.email}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <RestaurantToggle />

              <div className="hidden h-7 w-px bg-white/10 sm:block" />

              <AccountMenu account={account} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-3 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={`/dashboard/${tab.path}`}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2",
                    "whitespace-nowrap",
                    "rounded-lg",
                    "px-4 py-2",
                    "text-sm font-medium",
                    "transition-all duration-200",
                    isActive
                      ? "bg-[#CD0000] text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {/* =====================================================
          SCROLLABLE CONTENT
      ====================================================== */}
      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {visibleTabs.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[#1C1B19]/60">
              No sections available for your role yet.
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

/* =========================================================
   RESTAURANT OPEN / CLOSED TOGGLE
========================================================= */

const RestaurantToggle = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await toggleRestaurantStatus();

      setIsOpen(res.isOpen);
    } catch (err) {
      console.error("Failed to toggle restaurant status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title="Change restaurant availability"
      className={[
        "flex items-center gap-2",
        "rounded-full",
        "border",
        "px-3 py-1.5",
        "text-xs font-medium",
        "transition-all duration-200",
        loading
          ? "cursor-not-allowed opacity-60"
          : "hover:bg-white/10",
        isOpen
          ? "border-green-500/20 bg-green-500/10 text-green-400"
          : "border-white/10 bg-white/5 text-white/50",
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 rounded-full",
          isOpen ? "bg-green-400" : "bg-white/30",
        ].join(" ")}
      />

      <span>
        {loading
          ? "Updating..."
          : isOpen
          ? "Open"
          : "Closed"}
      </span>
    </button>
  );
};

/* =========================================================
   ACCOUNT MENU
========================================================= */

const AccountMenu = ({ account }) => {
  const { clearSession } = useAuth();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Account Button */}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <UserIcon className="h-4 w-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-black/5 bg-white text-[#1C1B19] shadow-xl">
          {/* Account Information */}
          <div className="border-b border-black/5 px-4 py-3">
            <div className="text-sm font-semibold">
              {account?.email || "Account"}
            </div>

            <div className="mt-1 text-xs text-[#1C1B19]/50">
              {account?.phoneNumber || "No phone number"}
            </div>

            {account?.roles?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {account.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-[#EFEDE6] px-2 py-1 text-[10px] font-medium text-[#1C1B19]/60"
                  >
                    {role.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#EFEDE6]"
            >
              Profile
            </button>

            <button
              onClick={clearSession}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#CD0000] transition hover:bg-[#CD0000]/5"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   RABBIT ICON
========================================================= */

const RabbitIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 2c-.6 0-1 .6-1 1.3 0 1.5.6 3 1.5 4.2C7 8.6 6 10.5 6 12.5v3C6 18 8 20 11 20h2c3 0 5-2 5-4.5v-3c0-2-1-3.9-2.5-5C16.4 6.3 17 4.8 17 3.3c0-.7-.4-1.3-1-1.3s-1 .8-1 2c0 1.2-.5 2.4-1.3 3.3-.5-.1-1.1-.2-1.7-.2s-1.2.1-1.7.2C9.5 6.4 9 5.2 9 4c0-1.2-.4-2-1-2z" />
  </svg>
);

/* =========================================================
   USER ICON
========================================================= */

const UserIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export default Dashboard;