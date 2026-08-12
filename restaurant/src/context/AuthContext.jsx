import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [account, setAccount] = useState(null);

  function setSession({ tokens, account }) {
    setAccessToken(tokens.accessToken);
    setAccount(account);
  }

  function clearSession() {
    setAccessToken(null);
    setAccount(null);
  }

  const value = { accessToken, account, setSession, clearSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}