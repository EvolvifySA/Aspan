import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
      setAuthError(null);
    } catch (error) {
      if (error.status !== 401) {
        setAuthError(error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    window.location.href = "/admin/login";
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user),
      authError,
      logout,
      refreshUser: loadCurrentUser,
    }),
    [authError, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
