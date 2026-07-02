import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loadingUser } = useApp();

  if (loadingUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role is not allowed, redirect to respective dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultDashboard = `/${user.role.toLowerCase()}/dashboard`;
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
};
