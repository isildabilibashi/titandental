import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_token_expires");
  };

  const validateToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem("admin_token");
    const expiresAt = localStorage.getItem("admin_token_expires");

    if (!token || !expiresAt) {
      return false;
    }

const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();

    if (currentTime > expirationTime) {
      clearAuth();
      return false;
    }

    try {
        const res = await fetch(`/api/admin/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
      });

      if (res.status === 401) {
        clearAuth();
        return false;
      }

      if (!res.ok) {
        return true;
      }

      const data = await res.json();
      if (data?.valid !== true) {
        clearAuth();
        return false;
      }

      return true;
    } catch {
      return true;
    }
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const valid = await validateToken();
    setIsAdminLoggedIn(valid);
    return valid;
  }, [validateToken]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_token_expires");
    setIsAdminLoggedIn(false);
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const valid = await validateToken();
      if (mounted) {
        setIsAdminLoggedIn(valid);
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(checkAuth, 100);

    const interval = setInterval(() => {
      refreshAuth();
    }, 60000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [validateToken, refreshAuth]);

  return (
    <AuthContext.Provider value={{ isAdminLoggedIn, isLoading, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
