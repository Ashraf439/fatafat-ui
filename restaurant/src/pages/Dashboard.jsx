import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ClipboardList, LineChart, Users, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RestaurantToggle } from "../components/layout/RestaurantToggle";
import { AccountMenu } from "../components/layout/AccountMenu";
import { RestaurantSwitcher } from "../components/layout/RestaurantSwitcher";
import { Brand } from "../components/layout/Brand";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Orders", path: "orders", icon: ClipboardList, roles: ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"] },
  { label: "Menu", path: "menu", icon: UtensilsCrossed, permissions: ["MENU_ITEM_ADD", "MENU_ITEM_REMOVE"] },
  { label: "Staff", path: "staff", icon: Users, permissions: ["STAFF_ADD", "STAFF_REMOVE", "STAFF_MANAGE_PERMISSIONS"] },
  { label: "Analytics", path: "analytics", icon: LineChart, roles: ["RESTAURANT", "RESTAURANT_MANAGER"] },
];

const hasRole = (account, roles) => roles.some((role) => account?.roles?.includes(role));
const hasAnyPermission = (permissions, perms) => perms.some((perm) => Boolean(permissions?.[perm]));

const Dashboard = () => {
  const { account, permissions } = useAuth();
  const { pathname } = useLocation();

  // During onboarding there is no restaurant yet, so the section tabs, open/closed toggle and
  // restaurant switcher would all point at nothing. Keep just the brand + account menu.
  const onboarding = pathname.startsWith("/onboarding");

  const tabs = onboarding
    ? []
    : TABS.filter((tab) =>
        tab.permissions ? hasAnyPermission(permissions, tab.permissions) : hasRole(account, tab.roles)
      );

  // Only show the "no sections" message on dashboard pages, not on /home or /onboarding.
  const emptyDashboard = !onboarding && tabs.length === 0 && pathname.startsWith("/dashboard");

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="shrink-0 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/dashboard/orders" aria-label="Go to orders">
            <Brand />
          </Link>
          {!onboarding && <RestaurantSwitcher />}

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
            {!onboarding && <RestaurantToggle />}
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-8">
        {emptyDashboard ? (
          <div className="rounded-xl border bg-card p-6 shadow-xs">
            <p className="text-muted-foreground">No sections available for your role yet.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <nav
        aria-label="Dashboard sections"
        hidden={tabs.length === 0}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:hidden"
      >
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