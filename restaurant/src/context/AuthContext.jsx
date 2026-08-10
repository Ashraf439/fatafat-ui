import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Refresh token in JSON body is an accepted tradeoff (per project decisions) —
// but that's still XSS-exposed if you ever put it in localStorage. Kept in
// memory only for now. If you add "stay logged in across refresh" later,
// that's a deliberate decision to revisit, not a default to reach for.
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