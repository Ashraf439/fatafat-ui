import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-semibold text-foreground">{account?.email || "Account"}</div>
          {account?.phoneNumber && <div className="mt-0.5 text-xs text-muted-foreground">{account.phoneNumber}</div>}
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
        <DropdownMenuItem onClick={clearSession} className="text-destructive focus:text-destructive">
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}