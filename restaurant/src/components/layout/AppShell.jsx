import { Outlet } from "react-router-dom";
import { Brand } from "./Brand";
import { AccountMenu } from "./AccountMenu";


export function AppShell() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="shrink-0 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Brand />
          <div className="ml-auto flex items-center gap-3">
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}