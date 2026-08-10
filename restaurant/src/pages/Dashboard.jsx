import { useEffect, useState } from "react";
import {
  Rabbit,
  ClipboardList,
  TrendingUp,
  UtensilsCrossed,
  AlertCircle,
  Star,
  BarChart3,
  Wallet,
  HelpCircle,
  Store,
  Bell,
  UserCircle,
  Soup,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyApplication } from "../api/onboarding";

const NAV_ITEMS = [
  { key: "orders", label: "Orders", icon: ClipboardList, active: true },
  { key: "growth", label: "Growth", icon: TrendingUp },
  { key: "menu", label: "Menu", icon: UtensilsCrossed },
  { key: "complaints", label: "Complaints", icon: AlertCircle },
  { key: "ratings", label: "Ratings", icon: Star },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "finance", label: "Finance", icon: Wallet },
  { key: "help", label: "Help", icon: HelpCircle },
  { key: "outlets", label: "Manage Outlets & Staff", icon: Store },
];

const ORDER_TABS = ["New", "Preparing", "Ready", "Picked Up", "Past Orders"];

export default function Dashboard() {
  const { accessToken } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("New");
  // Local-only for now — no backend endpoint to persist open/close state yet.
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const summary = await getMyApplication(accessToken);
        setRestaurant(summary);
      } catch {
        // if this fails, the header just falls back to placeholder text below
      }
    })();
  }, [accessToken]);

  return (
    <div className="min-h-screen flex bg-[#0F0B2E] font-sans">
      {/* SIDEBAR */}
      <aside className="w-24 bg-[#1A1440] flex flex-col items-center py-5 shrink-0">
        <Rabbit className="w-7 h-7 text-white mb-8" />
        <nav className="flex flex-col items-center gap-6 w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                title={item.active ? item.label : `${item.label} — coming soon`}
                disabled={!item.active}
                className={`flex flex-col items-center gap-1.5 w-full px-1 py-1 ${
                  item.active
                    ? "text-white"
                    : "text-slate-500 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                    item.active
                      ? "border-white/30 bg-white/10"
                      : "border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight px-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="bg-[#1A1440] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">
              Manage Orders
            </span>
            <div className="h-5 w-px bg-white/20" />
            <button
              onClick={() => setIsOpen((v) => !v)}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                isOpen ? "bg-green-500 justify-end" : "bg-slate-600 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white block" />
            </button>
            <div>
              <p className="text-sm font-bold leading-tight">
                {restaurant?.restaurantName ?? "Your Restaurant"}
              </p>
              <p className="text-xs text-slate-400 leading-tight">
                {restaurant ? `${restaurant.city}, ${restaurant.state}` : "—"}
                {" · "}
                {isOpen ? "Open now" : "Closed"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-xs font-bold bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded">
              FAQs
            </button>
            <Bell className="w-5 h-5 text-slate-300" />
            <UserCircle className="w-6 h-6 text-slate-300" />
          </div>
        </header>

        {/* TABS */}
        <div className="bg-white border-b border-slate-200 px-6 flex gap-8">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#26187D] text-[#26187D]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <main className="flex-1 bg-[#F6F7FF] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mb-5">
            <Soup className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">
            No Orders!
          </h2>
          <p className="text-sm text-slate-500">
            New orders will appear here
          </p>
        </main>
      </div>
    </div>
  );
}