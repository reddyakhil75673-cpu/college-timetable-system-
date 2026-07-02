import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { DashboardCard } from "../components/DashboardCard.tsx";
import { Layers, BookOpen, DoorOpen, Calendar, Plus, Eye, Play } from "lucide-react";

export const InchargeDashboard: React.FC = () => {
  const { user, t, addAlert } = useApp();
  const [stats, setStats] = useState<any>(null);
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
      console.error(err);
      addAlert("error", "Failed to retrieve In-Charge dashboard data.");
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
    <div className="space-y-8" id="incharge-dashboard-page">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          In-Charge Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          {t.welcome}, <span className="font-semibold">{user?.name}</span> (Department In-Charge)
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title={t.branches}
          value={stats.totalBranches}
          icon={Layers}
          color="bg-amber-50 text-amber-600 border-amber-100"
          description="Branches & Sections"
        />
        <DashboardCard
          title={t.subjects}
          value={stats.totalSubjects}
          icon={BookOpen}
          color="bg-teal-50 text-teal-600 border-teal-100"
          description="Syllabus Subjects"
        />
        <DashboardCard
          title={t.rooms}
          value={stats.totalRooms}
          icon={DoorOpen}
          color="bg-rose-50 text-rose-600 border-rose-100"
          description="Classrooms & Labs"
        />
        <DashboardCard
          title="Scheduled Slots"
          value={stats.totalTimetables}
          icon={Calendar}
          color="bg-blue-50 text-blue-600 border-blue-100"
          description="Total slots drafted"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <RouterLink
          to="/add-timetable"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 py-4 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Timetable Slot</span>
        </RouterLink>

        <RouterLink
          to="/timetables"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 px-6 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
        >
          <Eye className="h-5 w-5" />
          <span>View / Search Drafted Timetables</span>
        </RouterLink>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Today's Classes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-sans font-bold text-gray-900">{t.todayClasses}</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {todayClasses.length} Scheduled
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
                    <span className="text-xs text-gray-500">Lecturer: {item.faculty}</span>
                  </div>
                  <div className="text-left sm:text-right">
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

        {/* Quick management sidebar list */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4">
          <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-4 mb-5">
            Resource Managers
          </h3>
          <nav className="flex flex-col gap-2">
            <RouterLink
              to="/branches"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-slate-900 border border-gray-100"
            >
              <Layers className="h-5 w-5 text-gray-400" />
              <span>Manage Branches</span>
            </RouterLink>
            <RouterLink
              to="/subjects"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-slate-900 border border-gray-100"
            >
              <BookOpen className="h-5 w-5 text-gray-400" />
              <span>Manage Subjects</span>
            </RouterLink>
            <RouterLink
              to="/rooms"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-slate-900 border border-gray-100"
            >
              <DoorOpen className="h-5 w-5 text-gray-400" />
              <span>Manage Rooms</span>
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>
  );
};
