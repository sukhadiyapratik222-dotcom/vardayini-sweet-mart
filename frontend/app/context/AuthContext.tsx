"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token") || localStorage.getItem("admin_token");
    const storedUserStr = localStorage.getItem("auth_user");

    if (storedToken) {
      setToken(storedToken);

      let restoredUser: User | null = null;
      if (storedUserStr) {
        try {
          restoredUser = JSON.parse(storedUserStr);
          setUser(restoredUser);
        } catch (e) {}
      }

      // Fallback: If token exists (e.g. admin_token) but no storedUserStr, restore admin session
      if (!restoredUser && storedToken.startsWith("admin")) {
        restoredUser = {
          id: "admin-local-1",
          name: "Admin Owner",
          email: "admin@vardayini.com",
          isAdmin: true,
        };
        setUser(restoredUser);
        localStorage.setItem("auth_user", JSON.stringify(restoredUser));
      }

      // Set timeout so network fetch never hangs isLoading indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.id) {
            const uObj: User = {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              isAdmin: Boolean(data.isAdmin),
            };
            setUser(uObj);
            localStorage.setItem("auth_user", JSON.stringify(uObj));
          }
        })
        .catch(() => {
          // Network offline / abort -> keep local restoredUser
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    if (newUser.isAdmin) {
      localStorage.setItem("admin_token", newToken);
    } else {
      localStorage.setItem("auth_token", newToken);
      if (typeof window !== "undefined") {
        const userKey = `spin_wheel_seen_${newUser.id}`;
        if (!localStorage.getItem(userKey)) {
          sessionStorage.setItem("trigger_first_login_spin_wheel", "true");
        }
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
