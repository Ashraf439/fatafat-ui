import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true); // true until the initial /me check resolves

  useEffect(() => {
    getCurrentUser()
      .then((acc) => setAccount(acc))
      .catch(() => setAccount(null)) 
      .finally(() => setLoading(false));
  }, []);

  function setSession(acc) {
    setAccount(acc);
  }

  async function clearSession() {
    try {
      await logoutApi();
    } finally {
      setAccount(null);
    }
  }

  const value = { account, loading, setSession, clearSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}