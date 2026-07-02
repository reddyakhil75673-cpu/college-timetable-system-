import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import { Language } from "../utils/translations.ts";
import { Bell, Globe, LogOut, User, Menu, BookOpen } from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, lang, setLanguage, t, notificationsCount } = useApp();
  const navigate = useNavigate();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleLangChange = (newLang: Language) => {
    setLanguage(newLang);
    setShowLangDropdown(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Principal":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Incharge":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Faculty":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Student":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs md:px-8">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
          id="sidebar-toggle-btn"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <span className="font-sans font-bold tracking-tight text-slate-800 text-sm md:text-base">
            {t.academicManagement || "Academic Portal"}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            id="lang-dropdown-btn"
          >
            <Globe className="h-4 w-4 text-slate-500" />
            <span>{lang}</span>
          </button>

          {showLangDropdown && (
            <div
              className="absolute right-0 mt-2 w-32 origin-top-right rounded-lg border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-black/5"
              id="lang-dropdown-list"
            >
              {(["English", "Telugu", "Hindi"] as Language[]).map((item) => (
                <button
                  key={item}
                  onClick={() => handleLangChange(item)}
                  className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs font-medium ${
                    lang === item ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        {user && (
          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            id="notif-bell-btn"
          >
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {notificationsCount}
              </span>
            )}
          </Link>
        )}

        {/* User Session Profile info */}
        {user ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 md:gap-3 md:pl-4">
            <Link
              to="/profile"
              className="hidden flex-col items-end text-right md:flex"
              id="user-profile-nav-link"
            >
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <span
                className={`mt-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </Link>

            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              id="user-avatar-btn"
            >
              <User className="h-4 w-4" />
            </Link>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title={t.logout}
              id="logout-nav-btn"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            id="login-redirect-btn"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
