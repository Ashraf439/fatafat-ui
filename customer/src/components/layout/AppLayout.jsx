import { Outlet, ScrollRestoration } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartConflictDialog } from "@/features/cart/CartConflictDialog";
import { CartSheet } from "@/features/cart/CartSheet";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <CartSheet />
      <CartConflictDialog />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}
