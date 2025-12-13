// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement : si token dans localStorage → essayer de récupérer le user
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("accessToken");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const u = await apiLogin(email, password);
    setUser(u);
  };

  const register = async (name, email, password) => {
    const u = await apiRegister(name, email, password);
    setUser(u);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}