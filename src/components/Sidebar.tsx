import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Layers,
  BookOpen,
  GraduationCap,
  DoorOpen,
  ClipboardCheck,
  BarChart3,
  User,
  Bell,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, t } = useApp();
  const location = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    const role = user.role;
    const items = [
      {
        label: t.dashboard,
        path: `/${role.toLowerCase()}/dashboard`,
        icon: LayoutDashboard,
      },
    ];

    // Admin exclusive
    if (role === "Admin") {
      items.push(
        { label: t.users, path: "/users", icon: Users },
        { label: t.branches, path: "/branches", icon: Layers },
        { label: t.subjects, path: "/subjects", icon: BookOpen },
        { label: t.faculty, path: "/faculty", icon: GraduationCap },
        { label: t.students, path: "/students", icon: Users },
        { label: t.rooms, path: "/rooms", icon: DoorOpen },
        { label: t.viewTimetable, path: "/timetables", icon: Calendar },
        { label: t.reports, path: "/reports", icon: BarChart3 }
      );
    }

    // Principal exclusive
    if (role === "Principal") {
      items.push(
        { label: t.approvals, path: "/approvals", icon: ClipboardCheck },
        { label: t.viewTimetable, path: "/timetables", icon: Calendar },
        { label: t.reports, path: "/reports", icon: BarChart3 }
      );
    }

    // Incharge exclusive
    if (role === "Incharge") {
      items.push(
        { label: t.addTimetable, path: "/add-timetable", icon: Calendar },
        { label: t.viewTimetable, path: "/timetables", icon: Calendar },
        { label: t.branches, path: "/branches", icon: Layers },
        { label: t.subjects, path: "/subjects", icon: BookOpen },
        { label: t.rooms, path: "/rooms", icon: DoorOpen }
      );
    }

    // Faculty exclusive
    if (role === "Faculty") {
      items.push(
        { label: t.viewTimetable, path: "/faculty/timetable", icon: Calendar },
        { label: t.notifications, path: "/notifications", icon: Bell }
      );
    }

    // Student exclusive
    if (role === "Student") {
      items.push(
        { label: t.viewTimetable, path: "/student/timetable", icon: Calendar },
        { label: t.notifications, path: "/notifications", icon: Bell }
      );
    }

    // All users profile
    items.push({ label: t.profile, path: "/profile", icon: User });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden"
        ></div>
      )}

      {/* Sidebar Rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold">E</div>
            <h1 className="text-md font-bold text-white tracking-tight leading-none italic">
              EduTrack
              <span className="text-indigo-400 block text-[10px] font-normal not-italic mt-0.5">
                Academic Manager
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <nav className="flex flex-1 flex-col gap-1.5">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Main Console
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mini profile box */}
          <div className="mt-auto border-t border-slate-800 pt-4 pb-2">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-xs font-semibold text-white">{user.name}</span>
                <span className="truncate text-[10px] text-slate-500">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
