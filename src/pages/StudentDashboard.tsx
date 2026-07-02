import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { DashboardCard } from "../components/DashboardCard.tsx";
import { Calendar, Download, Clock, MapPin, User, FileText, Bell } from "lucide-react";
import { jsPDF } from "jspdf";

export const StudentDashboard: React.FC = () => {
  const { user, t, addAlert } = useApp();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const timetableRes = await API.get("/timetables/student/my-timetable");
      setTimetable(timetableRes.data);

      const todayRes = await API.get("/timetables/today/classes");
      setTodayClasses(todayRes.data);

      const notificationsRes = await API.get("/notifications");
      setNotifications(notificationsRes.data.slice(0, 4));
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve your student timetable.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (timetable.length === 0) {
      addAlert("error", "No timetable slots found to download.");
      return;
    }

    try {
      const doc = new jsPDF();
      const title = "COLLEGE ACADEMIC TIMETABLE";
      const studentName = `Student Name: ${user?.name || "N/A"}`;
      const branchDetails = `Branch: ${user?.branch || "N/A"} | Section: ${user?.section || "N/A"} | Semester: ${user?.semester || "N/A"}`;
      const exportDate = `Generated On: ${new Date().toLocaleDateString()}`;

      // Document styles and branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text(title, 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(studentName, 14, 28);
      doc.text(branchDetails, 14, 34);
      doc.text(exportDate, 14, 40);

      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 44, 196, 44);

      // Print table headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);

      let y = 52;
      doc.text("Day", 14, y);
      doc.text("Subject", 40, y);
      doc.text("Faculty", 90, y);
      doc.text("Time Slot", 135, y);
      doc.text("Room", 180, y);

      doc.line(14, y + 3, 196, y + 3);
      y += 10;

      // Print rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // Slate-700

      // Sort by Day sequence
      const dayWeights: { [key: string]: number } = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 7,
      };

      const sortedTimetable = [...timetable].sort(
        (a, b) => (dayWeights[a.day] || 10) - (dayWeights[b.day] || 10)
      );

      for (const item of sortedTimetable) {
        if (y > 270) {
          doc.addPage();
          y = 20;
          doc.setFont("helvetica", "bold");
          doc.text("Day", 14, y);
          doc.text("Subject", 40, y);
          doc.text("Faculty", 90, y);
          doc.text("Time Slot", 135, y);
          doc.text("Room", 180, y);
          doc.line(14, y + 3, 196, y + 3);
          y += 10;
          doc.setFont("helvetica", "normal");
        }

        doc.text(item.day, 14, y);
        doc.text(item.subject, 40, y);
        doc.text(item.faculty, 90, y);
        doc.text(item.time, 135, y);
        doc.text(item.room, 180, y);

        doc.line(14, y + 3, 196, y + 3);
        y += 8;
      }

      doc.save(`Timetable_${user?.branch}_Sec${user?.section}.pdf`);
      addAlert("success", "Timetable PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to generate timetable PDF.");
    }
  };

  const filteredTimetable =
    selectedDayFilter === "All" ? timetable : timetable.filter((t) => t.day === selectedDayFilter);

  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="student-dashboard-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Student Timetable
          </h1>
          <p className="text-sm text-gray-500">
            {t.welcome}, <span className="font-semibold">{user?.name}</span> (Roll Number: {user?.phone || "N/A"})
          </p>
        </div>

        <button
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>{t.downloadPDF}</span>
        </button>
      </div>

      {/* Profile summary status */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="My Stream"
          value={`${user?.branch || "N/A"} - ${user?.section || "N/A"}`}
          icon={Calendar}
          color="bg-teal-50 text-teal-600 border-teal-100"
          description={`Semester ${user?.semester || "N/A"} academic calendar`}
        />
        <DashboardCard
          title="Today's Classes"
          value={`${todayClasses.length} Lectures`}
          icon={Clock}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
          description="Approved lectures for today"
        />
        <DashboardCard
          title="Total Assigned Lectures"
          value={`${timetable.length} Classes`}
          icon={FileText}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
          description="Weekly approved classes"
        />
      </div>

      {/* Main content splitter */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Today's Classes List */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4">
          <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">
            {t.todayClasses}
          </h3>
          <div className="space-y-4">
            {todayClasses.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-10">{t.noClasses}</p>
            ) : (
              todayClasses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-50 bg-slate-50/50 p-4 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        {item.classType}
                      </span>
                      <h4 className="font-bold text-slate-800 mt-2">{item.subject}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Prof: {item.faculty}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>Room: {item.room}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs font-bold text-slate-700">
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Timetable & Filters */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-5">
            <h3 className="font-sans font-bold text-gray-900">Approved Weekly Academic Calendar</h3>
            <div className="flex flex-wrap gap-1">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDayFilter(day)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedDayFilter === day
                      ? "bg-slate-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Lecturer</th>
                  <th className="px-4 py-3">Time Slot</th>
                  <th className="px-4 py-3">Lecture Hall</th>
                  <th className="px-4 py-3">Class Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                {filteredTimetable.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      No timetable records found.
                    </td>
                  </tr>
                ) : (
                  filteredTimetable.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.day}</td>
                      <td className="px-4 py-3 text-slate-800">{item.subject}</td>
                      <td className="px-4 py-3">{item.faculty}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800">{item.time}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.room}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                          {item.classType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
