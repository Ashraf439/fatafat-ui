import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toggleRestaurantStatus } from "../api/restaurant";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardList, Users, UtensilsCrossed, LineChart, User } from "lucide-react";

const TAB_CONFIG = [
  {
    label: "Orders",
    path: "orders",
    icon: ClipboardList,
    roles: ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"],
  },
  {
    label: "Staff",
    path: "staff",
    icon: Users,
    roles: ["RESTAURANT", "RESTAURANT_MANAGER"],
  },
  {
    label: "Menu",
    path: "menu",
    icon: UtensilsCrossed,
    roles: ["RESTAURANT", "RESTAURANT_MANAGER"],
  },
  {
    label: "Analytics",
    path: "analytics",
    icon: LineChart,
    roles: ["RESTAURANT", "RESTAURANT_MANAGER"],
  },
];

const hasRole = (account, roles) => roles.some((role) => account?.roles?.includes(role));

const Dashboard = () => {
  const { account } = useAuth();

  const visibleTabs = TAB_CONFIG.filter((tab) => hasRole(account, tab.roles));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="shrink-0 bg-foreground text-background shadow-lg">
        {/* Top Bar */}
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Brand / Account */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <RabbitIcon className="h-7 w-7 text-primary" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">Fatafat</div>
                <div className="truncate text-xs text-background/45">{account?.email}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <RestaurantToggle />
              <Separator orientation="vertical" className="hidden h-7 bg-background/10 sm:block" />
              <AccountMenu account={account} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-3 sm:px-6">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
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
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-background/60 hover:bg-background/10 hover:text-background",
                  ].join(" ")
                }
              >
                <tab.icon className="h-4 w-4" />
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
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <p className="text-muted-foreground">No sections available for your role yet.</p>
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
    <div className="flex items-center gap-2 rounded-full border border-background/10 bg-background/5 px-3 py-1.5">
      <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-success" : "bg-background/30"}`} />
      <span className="text-xs font-medium text-background/80">{loading ? "Updating…" : isOpen ? "Open" : "Closed"}</span>
      <Switch
        checked={isOpen}
        onCheckedChange={handleToggle}
        disabled={loading}
        aria-label="Change restaurant availability"
        className="ml-1 scale-90"
      />
    </div>
  );
};

/* =========================================================
   ACCOUNT MENU
========================================================= */

const AccountMenu = ({ account }) => {
  const { clearSession } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 text-background transition hover:bg-background/20"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-semibold text-foreground">{account?.email || "Account"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{account?.phoneNumber || "No phone number"}</div>
          {account?.roles?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {account.roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-[10px]">
                  {role.replaceAll("_", " ")}
                </Badge>
              ))}
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={clearSession} className="text-destructive focus:text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* =========================================================
   RABBIT ICON
========================================================= */

const RabbitIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 2c-.6 0-1 .6-1 1.3 0 1.5.6 3 1.5 4.2C7 8.6 6 10.5 6 12.5v3C6 18 8 20 11 20h2c3 0 5-2 5-4.5v-3c0-2-1-3.9-2.5-5C16.4 6.3 17 4.8 17 3.3c0-.7-.4-1.3-1-1.3s-1 .8-1 2c0 1.2-.5 2.4-1.3 3.3-.5-.1-1.1-.2-1.7-.2s-1.2.1-1.7.2C9.5 6.4 9 5.2 9 4c0-1.2-.4-2-1-2z" />
  </svg>
);

export default Dashboard;
