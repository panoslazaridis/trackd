import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Prefer server session; fall back to localStorage for compatibility
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
        } else {
          const storedUserId = localStorage.getItem("userId");
          if (storedUserId) setUserId(storedUserId);
        }
      } catch {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = (newUserId: string) => {
    localStorage.setItem("userId", newUserId);
    setUserId(newUserId);
  };

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).finally(() => {
      localStorage.removeItem("userId");
      setUserId(null);
      setLocation("/login");
    });
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        isAuthenticated: !!userId,
        login,
        logout,
        isLoading,
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
