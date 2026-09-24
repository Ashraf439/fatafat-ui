import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, MapPin, Receipt, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartButton } from "@/features/cart/CartButton";
import { useAuth } from "@/features/auth/useAuth";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg text-primary-foreground shadow-sm">F</span>
      <span className="text-xl">
        Fata<span className="text-primary">fat</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          {isAuthenticated && (
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent ${isActive ? "text-primary" : "text-muted-foreground"}`
                }
              >
                My orders
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CartButton />
          {isLoading ? (
            <div className="size-10" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="max-w-40 gap-2" aria-label="Account menu">
                  <UserRound />
                  <span className="hidden truncate sm:inline">{user.name?.split(" ")[0] ?? "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/orders")}>
                  <Receipt /> My orders
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/account/addresses")}>
                  <MapPin /> Saved addresses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
