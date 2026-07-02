import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../api/api.ts";
import { Language, translations } from "../utils/translations.ts";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Principal" | "Incharge" | "Faculty" | "Student";
  phone?: string;
  branch?: string;
  section?: string;
  semester?: string;
  status: string;
}

interface Alert {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  lang: Language;
  t: typeof translations.English;
  alerts: Alert[];
  loadingUser: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  addAlert: (type: "success" | "error" | "info", message: string) => void;
  removeAlert: (id: string) => void;
  refreshUser: () => Promise<void>;
  notificationsCount: number;
  setNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  fetchUnreadNotificationsCount: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [lang, setLang] = useState<Language>((localStorage.getItem("lang") as Language) || "English");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoadingUser(false);
    }
  }, [token]);

  const refreshUser = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data && res.data.user) {
        setUser(res.data.user);
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Failed to fetch user session:", err);
      logout();
    } finally {
      setLoadingUser(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    addAlert("success", `Welcome back, ${newUser.name}!`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    addAlert("info", "Logged out successfully.");
  };

  const setLanguage = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    setLang(newLang);
    addAlert("success", `Language changed to ${newLang}`);
  };

  const addAlert = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const fetchUnreadNotificationsCount = async () => {
    if (!token) return;
    try {
      const res = await API.get("/notifications");
      const unread = res.data.filter((n: any) => !n.read).length;
      setNotificationsCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadNotificationsCount();
      // Poll notifications every 30 seconds for live updates as requested!
      const interval = setInterval(fetchUnreadNotificationsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        lang,
        t,
        alerts,
        loadingUser,
        login,
        logout,
        setLanguage,
        addAlert,
        removeAlert,
        refreshUser,
        notificationsCount,
        setNotificationsCount,
        fetchUnreadNotificationsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
