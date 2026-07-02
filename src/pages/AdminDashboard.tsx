import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { DashboardCard } from "../components/DashboardCard.tsx";
import {
  Users,
  Layers,
  BookOpen,
  GraduationCap,
  DoorOpen,
  Calendar,
  AlertTriangle,
  Play,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalBranches: number;
  totalSubjects: number;
  totalRooms: number;
  totalTimetables: number;
  todayClasses: number;
  pendingApprovals: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, t, addAlert } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await API.get("/reports/dashboard");
      setStats(statsRes.data);

      const classesRes = await API.get("/timetables/today/classes");
      setTodayClasses(classesRes.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      addAlert("error", "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="admin-dashboard-page">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t.dashboard}
        </h1>
        <p className="text-sm text-gray-500">
          {t.welcome}, <span className="font-semibold">{user?.name}</span> (Administrator)
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardCard
          title={t.users}
          value={stats.totalUsers}
          icon={Users}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
          description={`${stats.totalStudents} Students, ${stats.totalFaculty} Faculty`}
        />
        <DashboardCard
          title={t.branches}
          value={stats.totalBranches}
          icon={Layers}
          color="bg-amber-50 text-amber-600 border-amber-100"
          description="Academic courses offered"
        />
        <DashboardCard
          title={t.subjects}
          value={stats.totalSubjects}
          icon={BookOpen}
          color="bg-teal-50 text-teal-600 border-teal-100"
          description="Total syllabus subjects"
        />
        <DashboardCard
          title={t.rooms}
          value={stats.totalRooms}
          icon={DoorOpen}
          color="bg-rose-50 text-rose-600 border-rose-100"
          description="Lectures halls & labs"
        />
        <DashboardCard
          title={t.todayClasses}
          value={stats.todayClasses}
          icon={Play}
          color="bg-green-50 text-green-600 border-green-100"
          description="Scheduled for today"
        />
        <DashboardCard
          title={t.pendingApprovals}
          value={stats.pendingApprovals}
          icon={AlertTriangle}
          color="bg-amber-50 text-amber-600 border-amber-100"
          description="Awaiting review"
        />
        <DashboardCard
          title="Total Slots"
          value={stats.totalTimetables}
          icon={Calendar}
          color="bg-blue-50 text-blue-600 border-blue-100"
          description="Created timetable records"
        />
      </div>

      {/* Main layout splitting panels */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Today's Classes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-sans font-bold text-gray-900">{t.todayClasses}</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {todayClasses.length} Active
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {todayClasses.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">{t.noClasses}</p>
            ) : (
              todayClasses.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-50 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                      {item.branch} Sec {item.section} - Sem {item.semester} ({item.classType})
                    </span>
                    <h4 className="font-semibold text-slate-800 mt-0.5">{item.subject}</h4>
                    <span className="text-xs text-gray-500 font-medium">Faculty: {item.faculty}</span>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <span className="inline-block rounded-md bg-white border border-gray-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {item.time}
                    </span>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Room: {item.room}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Utilities / Navigation Links */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-4">
              Quick Controls
            </h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                to="/users"
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Users</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/branches"
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Branches</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/subjects"
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Subjects</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/rooms"
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Rooms</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/timetables"
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Timetable</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/reports"
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Reports</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Pending reviews notifier card */}
          {stats.pendingApprovals > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-amber-500 p-2.5 text-white">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">Pending Timetable Approvals</h4>
                  <p className="mt-1 text-sm text-amber-700 leading-snug">
                    There are {stats.pendingApprovals} slots drafted by In-Charges awaiting approval by the Principal.
                  </p>
                  <Link
                    to="/timetables"
                    className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-amber-900 uppercase tracking-wider hover:underline"
                  >
                    <span>View All Slots</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
