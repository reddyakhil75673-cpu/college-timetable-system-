import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { Calendar, Search, Filter, Edit, Trash2, Download, Check, X, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

export const ViewTimetable: React.FC = () => {
  const { user, addAlert, t } = useApp();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter criteria options
  const [branches, setBranches] = useState<string[]>([]);
  const [faculty, setFaculty] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);

  // Filter selections
  const [searchVal, setSearchVal] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedFaculty, setSelectedFaculty] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const canEdit = user?.role === "Admin" || user?.role === "Incharge";
  const canApprove = user?.role === "Principal" || user?.role === "Admin";

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("/timetables");
      setSlots(res.data);

      // Extract unique list for filters
      const uniqueBranches = Array.from(new Set(res.data.map((item: any) => item.branch))) as string[];
      setBranches(uniqueBranches);

      const uniqueFaculty = Array.from(new Set(res.data.map((item: any) => item.faculty))) as string[];
      setFaculty(uniqueFaculty);

      const uniqueRooms = Array.from(new Set(res.data.map((item: any) => item.room))) as string[];
      setRooms(uniqueRooms);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve timetable list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this schedule slot?")) return;
    try {
      await API.delete(`/timetables/${id}`);
      addAlert("success", "Schedule slot deleted.");
      fetchSlots();
    } catch (err) {
      addAlert("error", "Failed to delete slot.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await API.put(`/timetables/${id}/approve`, { remarks: "Approved by Admin/Principal" });
      addAlert("success", "Timetable slot has been approved.");
      fetchSlots();
    } catch (err) {
      addAlert("error", "Failed to approve.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    if (!reason.trim()) {
      addAlert("error", "Reason is required to reject.");
      return;
    }

    try {
      await API.put(`/timetables/${id}/reject`, { remarks: reason });
      addAlert("success", "Timetable slot has been rejected.");
      fetchSlots();
    } catch (err) {
      addAlert("error", "Failed to reject.");
    }
  };

  const downloadPDF = () => {
    if (filteredSlots.length === 0) {
      addAlert("error", "No data to export.");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("COLLEGE ACADEMIC TIMETABLE", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Filter Criteria - Branch: ${selectedBranch} | Sem: ${selectedSemester} | Status: ${selectedStatus}`, 14, 34);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 38, 196, 38);

      // Print headers
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      let y = 46;
      doc.text("Day", 14, y);
      doc.text("Subject (Branch/Sec)", 40, y);
      doc.text("Faculty", 95, y);
      doc.text("Time Slot", 135, y);
      doc.text("Room", 175, y);

      doc.line(14, y + 3, 196, y + 3);
      y += 10;

      // Print rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      for (const item of filteredSlots) {
        if (y > 275) {
          doc.addPage();
          y = 20;
          doc.setFont("helvetica", "bold");
          doc.text("Day", 14, y);
          doc.text("Subject (Branch/Sec)", 40, y);
          doc.text("Faculty", 95, y);
          doc.text("Time Slot", 135, y);
          doc.text("Room", 175, y);
          doc.line(14, y + 3, 196, y + 3);
          y += 10;
          doc.setFont("helvetica", "normal");
        }

        const subjectAndSec = `${item.subject} (${item.branch} Sec ${item.section})`;
        doc.text(item.day, 14, y);
        doc.text(subjectAndSec, 40, y);
        doc.text(item.faculty, 95, y);
        doc.text(item.time, 135, y);
        doc.text(item.room, 175, y);

        doc.line(14, y + 3, 196, y + 3);
        y += 8;
      }

      doc.save("College_Academic_Schedule.pdf");
      addAlert("success", "Report downloaded successfully!");
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to download report PDF.");
    }
  };

  // Run Search/Filters on state
  const filteredSlots = slots.filter((slot) => {
    // Search filter
    const term = searchVal.toLowerCase();
    const matchesSearch =
      !term ||
      slot.subject.toLowerCase().includes(term) ||
      slot.faculty.toLowerCase().includes(term) ||
      slot.branch.toLowerCase().includes(term) ||
      slot.room.toLowerCase().includes(term) ||
      slot.day.toLowerCase().includes(term);

    // Dropdown filters
    const matchesBranch = selectedBranch === "All" || slot.branch === selectedBranch;
    const matchesSem = selectedSemester === "All" || slot.semester === selectedSemester;
    const matchesDay = selectedDay === "All" || slot.day === selectedDay;
    const matchesFaculty = selectedFaculty === "All" || slot.faculty === selectedFaculty;
    const matchesRoom = selectedRoom === "All" || slot.room === selectedRoom;
    const matchesStatus = selectedStatus === "All" || slot.status === selectedStatus;

    return matchesSearch && matchesBranch && matchesSem && matchesDay && matchesFaculty && matchesRoom && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 border-green-200 text-green-700";
      case "Pending":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "Rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-6" id="view-timetable-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academic Timetable</h1>
          <p className="text-sm text-gray-500">Query, search, and manage draft academic timetable records</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>

          {canEdit && (
            <Link
              to="/add-timetable"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
            >
              <Calendar className="h-4 w-4" />
              <span>{t.addTimetable}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Query Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Search keyword
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-3 text-xs font-semibold focus:border-slate-800 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Branch */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sem</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Semesters</option>
            {["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
        </div>

        {/* Day */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Days</option>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Faculty */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lecturer</label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Lecturers</option>
            {faculty.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Slots Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Day</th>
                <th className="px-6 py-4">Branch / Section (Sem)</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Lecturer</th>
                <th className="px-6 py-4">Time Slot</th>
                <th className="px-6 py-4">Room No</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No timetables matching specified query.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.day}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">
                      {item.branch} Sec {item.section} (Sem {item.semester})
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.subject}</td>
                    <td className="px-6 py-4 text-xs">{item.faculty}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">{item.time}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.room}</td>
                    <td className="px-6 py-4 text-xs uppercase font-semibold">{item.classType}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(
                          item.status
                        )}`}
                        title={item.remarks}
                      >
                        {item.status}
                      </span>
                      {item.remarks && (
                        <p className="mt-1 text-[9px] text-gray-400 italic max-w-xs truncate">{item.remarks}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {canApprove && item.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="rounded bg-red-50 border border-red-200 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {canEdit && (
                          <>
                            <Link
                              to={`/edit-timetable/${item.id}`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="Edit slot parameters"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Delete slot"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
