import { LogOut, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../context/AuthContext";

export function AccountMenu() {
  const { account, clearSession } = useAuth();
  const initial = (account?.email?.[0] ?? "?").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <NavLink to="/dashboard/profile" className="flex w-full items-center gap-2">
            <UserRound className="size-4" /> Profile
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={clearSession} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}