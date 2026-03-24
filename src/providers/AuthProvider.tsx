"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/src/services/auth";
import { User, LoginPayload, RegisterPayload } from "@/src/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  register: (data: RegisterPayload) => Promise<{ success: boolean; message: string }>;
  login: (data: LoginPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = authService.getUser();
    setUser(storedUser);
    setIsInitialized(true);
  }, []);

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);

      if (!response.success) {
        setError(response.message);
        return { success: false, message: response.message };
      }

      setUser(response.user || null);
      return { success: true, message: response.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);

      if (!response.success) {
        setError(response.message);
        return { success: false, message: response.message };
      }

      setUser(response.user || null);
      return { success: true, message: response.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const storedUser = authService.getUser();
    setUser(storedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isInitialized,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
