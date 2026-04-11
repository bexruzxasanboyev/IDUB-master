"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authVerify, authStart, authRefresh, getMe, type UserProfile, type ApiError } from "./api";

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (phone: string) => Promise<{ otpSent: boolean; expiresInSec: number }>;
  verify: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("idub_auth");
    if (stored) {
      try {
        const { accessToken, refreshToken, user: storedUser } = JSON.parse(stored);
        setToken(accessToken);
        setUser(storedUser);

        // Verify token is still valid
        getMe(accessToken)
          .then((profile) => {
            setUser(profile);
          })
          .catch(async () => {
            // Try refresh
            try {
              const refreshed = await authRefresh(refreshToken);
              setToken(refreshed.accessToken);
              const profile = await getMe(refreshed.accessToken);
              setUser(profile);
              localStorage.setItem("idub_auth", JSON.stringify({
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
                user: profile,
              }));
            } catch {
              // Both failed — logout
              setUser(null);
              setToken(null);
              localStorage.removeItem("idub_auth");
            }
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem("idub_auth");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone: string) => {
    return authStart(phone);
  }, []);

  const verify = useCallback(async (phone: string, code: string) => {
    const result = await authVerify(phone, code);
    setToken(result.accessToken);
    setUser(result.user);
    localStorage.setItem("idub_auth", JSON.stringify({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    }));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("idub_auth");
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await getMe(token);
      setUser(profile);
    } catch {
      // ignore
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verify, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
