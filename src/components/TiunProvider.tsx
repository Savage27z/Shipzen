"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { initTiun, onUserChange, login, logout, checkoutPro, isPro, getCurrentUser } from "@/lib/tiun";

interface TiunUser {
  id: string;
  email: string;
}

interface TiunContextValue {
  user: TiunUser | null;
  isAuthenticated: boolean;
  isPro: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  upgradeToPro: () => Promise<void>;
}

const TiunContext = createContext<TiunContextValue>({
  user: null,
  isAuthenticated: false,
  isPro: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  upgradeToPro: async () => {},
});

export function useTiun() {
  return useContext(TiunContext);
}

export default function TiunProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TiunUser | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [pro, setPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the SDK
    initTiun();

    // Set initial state after a brief delay for SDK to load
    const timer = setTimeout(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsAuth(!!currentUser);
      setPro(isPro());
      setLoading(false);
    }, 500);

    // Listen for user changes (login, logout, checkout)
    const unsub = onUserChange((data) => {
      if (data.isAuthenticated && data.user) {
        setUser({ id: data.user.userId, email: data.user.email });
        setIsAuth(true);
        setPro(isPro());
      } else {
        setUser(null);
        setIsAuth(false);
        setPro(false);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const handleLogin = useCallback(async () => {
    await login();
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setIsAuth(false);
    setPro(false);
  }, []);

  const handleUpgrade = useCallback(async () => {
    await checkoutPro();
  }, []);

  return (
    <TiunContext value={{
      user,
      isAuthenticated: isAuth,
      isPro: pro,
      loading,
      login: handleLogin,
      logout: handleLogout,
      upgradeToPro: handleUpgrade,
    }}>
      {children}
    </TiunContext>
  );
}
