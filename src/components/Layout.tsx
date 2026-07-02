import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { useApp } from "../context/AppContext.tsx";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alerts, removeAlert } = useApp();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* Global Toast Alert Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto transition-all duration-300 animate-slide-in ${getAlertBg(
              alert.type
            )}`}
          >
            <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 text-sm font-medium text-gray-800">{alert.message}</div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar is on the left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area on the right */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
