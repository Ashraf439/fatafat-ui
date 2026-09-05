import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toggleRestaurantStatus } from "../api/restaurant"; // needs to exist — see below

const TAB_CONFIG = [
  { label: "Orders", path: "orders", roles: ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"] },
  { label: "Staff",  path: "staff",  roles: ["RESTAURANT", "RESTAURANT_MANAGER"] },
  { label: "Menu",   path: "menu",   roles: ["RESTAURANT", "RESTAURANT_MANAGER"] },
];

const hasRole = (account, roles) => roles.some((r) => account?.roles?.includes(r));

const Dashboard = () => {
  const { account } = useAuth();
  const visibleTabs = TAB_CONFIG.filter((tab) => hasRole(account, tab.roles));

  return (
    <div className="min-h-screen bg-[#EFEDE6]">
      <header className="bg-[#1C1B19] text-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <RabbitIcon className="w-8 h-8 text-[#CD0000]" />
            <div className="text-sm leading-tight">
              <div className="font-medium">Fatafat</div>
              <div className="text-white/50 text-xs">{account?.email}</div>
            </div>
          </div>

          <RestaurantToggle />

          <AccountMenu />
        </div>

        <nav className="flex gap-2 px-6 pb-3">
          {visibleTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/dashboard/${tab.path}`}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-[#CD0000] text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="p-8">
        {visibleTabs.length === 0 ? (
          <p className="text-[#1C1B19]/60">No sections available for your role yet.</p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

const RestaurantToggle = () => {
  const [isOpen, setIsOpen] = useState(true); // TODO: initialize from account/restaurant data on load
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await toggleRestaurantStatus();
      setIsOpen(res.isOpen);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isOpen ? "bg-green-600/20 text-green-400" : "bg-white/10 text-white/60"
      }`}
    >
      {loading ? "..." : isOpen ? "Open" : "Closed"}
    </button>
  );
};

const AccountMenu = () => {
  const { clearSession } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
      >
        <UserIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-black/5 py-1 text-[#1C1B19] text-sm">
          <button className="w-full text-left px-4 py-2 hover:bg-[#EFEDE6]">Profile</button>
          <button
            onClick={clearSession}
            className="w-full text-left px-4 py-2 hover:bg-[#EFEDE6] text-[#CD0000]"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const RabbitIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 2c-.6 0-1 .6-1 1.3 0 1.5.6 3 1.5 4.2C7 8.6 6 10.5 6 12.5v3C6 18 8 20 11 20h2c3 0 5-2 5-4.5v-3c0-2-1-3.9-2.5-5C16.4 6.3 17 4.8 17 3.3c0-.7-.4-1.3-1-1.3s-1 .8-1 2c0 1.2-.5 2.4-1.3 3.3-.5-.1-1.1-.2-1.7-.2s-1.2.1-1.7.2C9.5 6.4 9 5.2 9 4c0-1.2-.4-2-1-2z"/>
  </svg>
);

const UserIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export default Dashboard;