import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getPayload } from "../api/client";

const AuthContext = createContext(null);

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("legacylink_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("legacylink_token"));
  const [user, setUser] = useState(readSavedUser);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem("legacylink_token")));

  useEffect(() => {
    let active = true;
    async function loadUser() {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        const payload = getPayload(response);
        const currentUser = payload?.user ?? payload;
        if (active && currentUser) {
          setUser(currentUser);
          localStorage.setItem("legacylink_user", JSON.stringify(currentUser));
        }
      } catch {
        if (active) {
          setToken(null);
          setUser(null);
          localStorage.removeItem("legacylink_token");
          localStorage.removeItem("legacylink_user");
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    }
    loadUser();
    return () => { active = false; };
  }, []); // verify saved token once when the app starts

  function saveSession(payload) {
    const receivedToken = payload?.token ?? payload?.accessToken ?? payload?.jwt;
    const receivedUser = payload?.user ?? payload?.data?.user ?? null;
    if (!receivedToken) {
      throw new Error("The API response did not include a JWT token. Confirm the login/register response format with the backend team.");
    }
    localStorage.setItem("legacylink_token", receivedToken);
    setToken(receivedToken);
    if (receivedUser) {
      localStorage.setItem("legacylink_user", JSON.stringify(receivedUser));
      setUser(receivedUser);
    }
  }

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    saveSession(getPayload(response));
  }

  async function register(name, email, password) {
    const response = await api.post("/auth/register", { name, email, password });
    const payload = getPayload(response);
    if (payload?.token || payload?.accessToken || payload?.jwt) {
      saveSession(payload);
    } else {
      // Some APIs register without logging in. User should then visit Login.
      return { needsLogin: true };
    }
    return { needsLogin: false };
  }

  function logout() {
    localStorage.removeItem("legacylink_token");
    localStorage.removeItem("legacylink_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, authLoading, login, register, logout, setUser }), [token, user, authLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
