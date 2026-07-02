import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { DashboardCard } from "../components/DashboardCard.tsx";
import { Calendar, Award, Clock, ArrowRight, MapPin, Bell } from "lucide-react";

export const FacultyDashboard: React.FC = () => {
  const { user, t, addAlert } = useApp();
  const [weeklyTimetable, setWeeklyTimetable] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const timetableRes = await API.get("/timetables/faculty/my-timetable");
      setWeeklyTimetable(timetableRes.data);

      const todayRes = await API.get("/timetables/today/classes");
      setTodayClasses(todayRes.data);

      const notificationsRes = await API.get("/notifications");
      setNotifications(notificationsRes.data.slice(0, 4));
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve faculty details.");
    } finally {
      setLoading(false);
    }
  };

  const getDayClasses = (dayName: string) => {
    return weeklyTimetable.filter((t) => t.day === dayName);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="faculty-dashboard-page">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Faculty Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          {t.welcome}, <span className="font-semibold">{user?.name}</span> (Professor of {user?.branch || "Academics"})
        </p>
      </div>

      {/* Faculty Workload Status */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Weekly Teaching Workload"
          value={`${weeklyTimetable.length} Slots`}
          icon={Calendar}
          color="bg-teal-50 text-teal-600 border-teal-100"
          description="Approved slots assigned to you"
        />
        <DashboardCard
          title="Today's Active Classes"
          value={`${todayClasses.length} Lectures`}
          icon={Clock}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
          description="Lectures to conduct today"
        />
        <DashboardCard
          title="Recent System Updates"
          value={`${notifications.length} Alerts`}
          icon={Bell}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
          description="Awaiting your notification review"
        />
      </div>

      {/* Layout grids */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Today's Schedule panel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4">
          <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">
            {t.todayClasses}
          </h3>
          <div className="space-y-4">
            {todayClasses.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-10 font-medium">{t.noClasses}</p>
            ) : (
              todayClasses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-50 bg-slate-50/50 p-4 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                        {item.branch} - Sec {item.section}
                      </span>
                      <h4 className="font-bold text-slate-800 mt-2">{item.subject}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        Room: {item.room} ({item.classType})
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs font-semibold text-slate-700">
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Weekly Teaching Calendar */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8">
          <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-4 mb-5">
            Your Weekly Approved Lecture Schedule
          </h3>

          <div className="space-y-6">
            {days.map((day) => {
              const classes = getDayClasses(day);
              return (
                <div key={day} className="flex flex-col gap-3 md:flex-row md:items-start border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                  <div className="w-full md:w-32 flex-shrink-0">
                    <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                      {day}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">{classes.length} Lectures</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classes.length === 0 ? (
                      <span className="text-xs text-gray-400 italic py-1">No scheduled classes</span>
                    ) : (
                      classes.map((cls) => (
                        <div key={cls.id} className="rounded-lg border border-gray-100 bg-slate-50/50 p-3 text-xs shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{cls.subject}</span>
                            <span className="rounded-full bg-white border border-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                              {cls.classType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                            Branch: <span className="text-slate-800">{cls.branch} Sec {cls.section} (Sem {cls.semester})</span>
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-gray-100/60 pt-1.5">
                            <span>{cls.time}</span>
                            <span>Room: {cls.room}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
