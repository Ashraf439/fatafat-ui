import { NavLink, Outlet } from "react-router-dom";
import { ClipboardList, LineChart, Store, Users, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RestaurantToggle } from "../components/layout/RestaurantToggle";
import { AccountMenu } from "../components/layout/AccountMenu";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Orders", path: "orders", icon: ClipboardList, roles: ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"] },
  { label: "Menu", path: "menu", icon: UtensilsCrossed, roles: ["RESTAURANT", "RESTAURANT_MANAGER"] },
  { label: "Profile", path: "profile", icon: Store, roles: ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"] },
  { label: "Staff", path: "staff", icon: Users, roles: ["RESTAURANT", "RESTAURANT_MANAGER"] },
  { label: "Analytics", path: "analytics", icon: LineChart, roles: ["RESTAURANT", "RESTAURANT_MANAGER"] },
];

const hasRole = (account, roles) => roles.some((role) => account?.roles?.includes(role));

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-sm">
        F
      </span>
      <div className="hidden leading-tight sm:block">
        <div className="text-base font-extrabold tracking-tight">
          Fata<span className="text-primary">fat</span>
        </div>
        <div className="text-[11px] font-medium text-muted-foreground">Restaurant</div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { account } = useAuth();
  const tabs = TABS.filter((tab) => hasRole(account, tab.roles));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Brand />

          <nav aria-label="Dashboard sections" className="ml-2 hidden items-center gap-1 md:flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={`/dashboard/${tab.path}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <tab.icon className="size-4" />
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <RestaurantToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6 md:pb-8">
        {tabs.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 shadow-xs">
            <p className="text-muted-foreground">No sections available for your role yet.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <nav aria-label="Dashboard sections" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${tabs.length || 1}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/dashboard/${tab.path}`}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <tab.icon className="size-5" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;