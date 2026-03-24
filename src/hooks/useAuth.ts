"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth";
import { User, LoginPayload, RegisterPayload } from "@/src/types/auth";

export const useAuth = () => {
  const router = useRouter();
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

  const register = useCallback(
    async (data: RegisterPayload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.register(data);

        if (!response.success) {
          setError(response.message);
          return { success: false, message: response.message };
        }

        setUser(response.user || null);
        router.push("/");
        return { success: true, message: response.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const login = useCallback(
    async (data: LoginPayload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(data);

        if (!response.success) {
          setError(response.message);
          return { success: false, message: response.message };
        }

        setUser(response.user || null);
        router.push("/");
        return { success: true, message: response.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };
};
