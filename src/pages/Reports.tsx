import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { BarChart3, Download, Layers, BookOpen, DoorOpen, Calendar, HelpCircle, CheckSquare, Search } from "lucide-react";
import { jsPDF } from "jspdf";

export const Reports: React.FC = () => {
  const { addAlert } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [facultyWorkload, setFacultyWorkload] = useState<any[]>([]);
  const [roomUsage, setRoomUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchFaculty, setSearchFaculty] = useState("");
  const [searchRoom, setSearchRoom] = useState("");

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const statsRes = await API.get("/reports/dashboard");
      setStats(statsRes.data);

      const workloadRes = await API.get("/reports/faculty-workload");
      setFacultyWorkload(workloadRes.data);

      const roomRes = await API.get("/reports/room-usage");
      setRoomUsage(roomRes.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve reports metadata.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFullReportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text("ACADEMIC COMPREHENSIVE REPORT", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text("College Academic Timetable & Resource Management Audit", 14, 34);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 38, 196, 38);

      // Section 1: Institutional Metrics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("1. Institutional Statistics", 14, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Total Branches/Sections: ${stats?.totalBranches || 0}`, 14, 56);
      doc.text(`Total Subjects Curriculums: ${stats?.totalSubjects || 0}`, 14, 62);
      doc.text(`Active Rooms/Labs: ${stats?.totalRooms || 0}`, 14, 68);
      doc.text(`Total Timetable Slots Drafted: ${stats?.totalTimetables || 0}`, 14, 74);

      // Section 2: Faculty Workloads
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("2. Faculty Teaching Hours / Workloads", 14, 88);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      let y = 96;
      doc.text("Faculty Name", 14, y);
      doc.text("Department", 80, y);
      doc.text("Teaching Slots Assigned", 150, y);
      doc.line(14, y + 2, 196, y + 2);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      for (const f of facultyWorkload) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(f.name, 14, y);
        doc.text(f.department || "General Academics", 80, y);
        doc.text(`${f.slotsCount} Weekly Classes`, 150, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;
      }

      // Section 3: Room Usage Statistics
      y += 10;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("3. Classroom / Lab Booking Densities", 14, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Room Number", 14, y);
      doc.text("Room Type", 60, y);
      doc.text("Capacity", 120, y);
      doc.text("Scheduled Slots / week", 160, y);
      doc.line(14, y + 2, 196, y + 2);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      for (const r of roomUsage) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`Room ${r.roomNumber}`, 14, y);
        doc.text(r.roomType || "Classroom", 60, y);
        doc.text(`${r.capacity || 60} Seats`, 120, y);
        doc.text(`${r.slotsCount} Slots Booked`, 160, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;
      }

      doc.save("Academic_Audit_Comprehensive_Report.pdf");
      addAlert("success", "Full audit report exported to PDF!");
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to compile report PDF.");
    }
  };

  const filteredFaculty = facultyWorkload.filter((f) =>
    f.name.toLowerCase().includes(searchFaculty.toLowerCase())
  );

  const filteredRooms = roomUsage.filter((r) =>
    r.roomNumber.toLowerCase().includes(searchRoom.toLowerCase())
  );

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="reports-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Monitor academic workloads, room density bookings, and institutional audits</p>
        </div>

        <button
          onClick={downloadFullReportPDF}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Export Full Audit PDF</span>
        </button>
      </div>

      {/* Grid parameters */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Branches & Sections</span>
            <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalBranches}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Subjects syllabus</span>
            <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalSubjects}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <DoorOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Classrooms</span>
            <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalRooms}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Timetable Slots</span>
            <p className="text-2xl font-black text-gray-950 mt-0.5">{stats.totalTimetables}</p>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Faculty workloads */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <h3 className="font-sans font-bold text-gray-900">Faculty Workload Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Teaching hours / weekly schedules assigned per lecturer</p>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                placeholder="Search lecturer..."
                value={searchFaculty}
                onChange={(e) => setSearchFaculty(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1 pl-7 pr-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-2">Faculty Name</th>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2 text-right">Weekly Lectures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                {filteredFaculty.map((f, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{f.name}</td>
                    <td className="px-4 py-2.5 text-gray-500">{f.department || "Academics"}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-teal-700">{f.slotsCount} slots</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Booking Density */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <h3 className="font-sans font-bold text-gray-900">Room Booking Densities</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tracking schedule allocation density per room</p>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                placeholder="Search room no..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1 pl-7 pr-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-2">Room Number</th>
                  <th className="px-4 py-2">Room Type</th>
                  <th className="px-4 py-2">Capacity</th>
                  <th className="px-4 py-2 text-right">Slots Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                {filteredRooms.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-900">Room {r.roomNumber}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.roomType || "Classroom"}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-400">{r.capacity || 50} seats</td>
                    <td className="px-4 py-2.5 text-right font-bold text-indigo-700">{r.slotsCount} bookings</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
