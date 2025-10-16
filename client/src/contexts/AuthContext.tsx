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
    // Check for stored userId on mount
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  const login = (newUserId: string) => {
    localStorage.setItem("userId", newUserId);
    setUserId(newUserId);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    setLocation("/login");
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
