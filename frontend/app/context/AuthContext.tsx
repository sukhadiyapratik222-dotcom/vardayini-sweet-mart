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

      // Restore stored local user object if available
      if (storedUserStr) {
        try {
          setUser(JSON.parse(storedUserStr));
        } catch (e) {
          // ignore parse error
        }
      }

      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
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
          } else if (!storedUserStr) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("admin_token");
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          // Offline / backend unavailable -> Keep local session active
          if (!user && storedUserStr) {
            try {
              setUser(JSON.parse(storedUserStr));
            } catch (e) {
              // ignore
            }
          }
        })
        .finally(() => setIsLoading(false));
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
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("auth_user");
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
