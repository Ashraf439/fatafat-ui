import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentAccount, logout as logoutRequest } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export const isAdmin = (account) => account?.roles?.some((role) => ADMIN_ROLES.includes(role)) ?? false;

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  // True until the first /me check finishes, so a page refresh doesn't flash the login screen.
  const [initializing, setInitializing] = useState(true);

  // Restore the session from the httpOnly cookie on load.
  useEffect(() => {
    let cancelled = false;
    getCurrentAccount()
      .then((current) => {
        if (!cancelled && isAdmin(current)) setAccount(current);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // If a request still gets 401 after a refresh attempt, the session is gone.
  useEffect(() => {
    setUnauthorizedHandler(() => setAccount(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  function setSession(nextAccount) {
    setAccount(nextAccount);
  }

  async function signOut() {
    try {
      await logoutRequest();
    } catch {
      // Clear the local session even if the server can't be reached.
    }
    setAccount(null);
  }

  const value = { account, initializing, setSession, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}