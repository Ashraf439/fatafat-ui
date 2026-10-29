import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, getMyPermissions, logout as logoutApi } from "../api/auth";

const AuthContext = createContext(null);

const NO_PERMISSIONS = {};

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [permissions, setPermissions] = useState(NO_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((acc) => {
        setAccount(acc);
        return acc ? getMyPermissions() : NO_PERMISSIONS;
      })
      .then((perms) => setPermissions(perms ?? NO_PERMISSIONS))
      .catch(() => {
        setAccount(null);
        setPermissions(NO_PERMISSIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  function setSession(acc) {
    setAccount(acc);
    getMyPermissions()
      .then((perms) => setPermissions(perms ?? NO_PERMISSIONS))
      .catch(() => setPermissions(NO_PERMISSIONS));
  }

  async function clearSession() {
    try {
      await logoutApi();
    } finally {
      setAccount(null);
      setPermissions(NO_PERMISSIONS);
    }
  }

  const value = { account, permissions, loading, setSession, clearSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}