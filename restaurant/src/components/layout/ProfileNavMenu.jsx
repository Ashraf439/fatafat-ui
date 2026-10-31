import { LogOut, Store } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "../../context/AuthContext";

/** Desktop/mobile nav tab for "Profile" — opens "Manage Profile" + "Log out" instead of linking straight to the page. */
export function ProfileNavMenu({ variant = "desktop" }) {
  const { clearSession } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "desktop" ? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <Store className="size-4" />
            Profile
          </button>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground"
          >
            <Store className="size-5" />
            Profile
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "desktop" ? "start" : "center"} className="w-48">
        <DropdownMenuItem asChild>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => cn("flex w-full items-center gap-2", isActive && "font-semibold")}
          >
            <Store className="size-4" /> Manage Profile
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { clearSession(); navigate("/login"); }} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}