import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, Users, UtensilsCrossed, LineChart } from "lucide-react";

const SHORTCUTS = [
  { to: "/dashboard/orders", label: "Orders", desc: "Track live orders through prep and delivery.", icon: ClipboardList },
  { to: "/dashboard/staff", label: "Staff", desc: "Invite staff and manage permissions.", icon: Users },
  { to: "/dashboard/menu", label: "Menu", desc: "Upload and review your menu.", icon: UtensilsCrossed },
  { to: "/dashboard/analytics", label: "Analytics", desc: "See how your restaurant is performing.", icon: LineChart },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Fatafat for restaurants</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you need to run your restaurant on Fatafat, in one place.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SHORTCUTS.map(({ to, label, desc, icon: Icon }) => (
            <Card key={to} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-2">{label}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" size="sm">
                  <Link to={to}>Open {label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
