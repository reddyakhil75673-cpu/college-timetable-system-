import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { ClipboardCheck, CheckCircle2, XCircle, Info, Calendar } from "lucide-react";

export const Approvals: React.FC = () => {
  const { addAlert } = useApp();
  const [pendingSlots, setPendingSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSlots();
  }, []);

  const fetchPendingSlots = async () => {
    setLoading(true);
    try {
      // Fetch timetables with status=Pending
      const res = await API.get("/timetables?status=Pending");
      setPendingSlots(res.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await API.put(`/timetables/${id}/approve`, { remarks: "Approved by Principal" });
      addAlert("success", "Timetable slot has been approved.");
      fetchPendingSlots();
    } catch (err) {
      addAlert("error", "Approval operation failed.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    if (!reason.trim()) {
      addAlert("error", "Rejection reason is required.");
      return;
    }

    try {
      await API.put(`/timetables/${id}/reject`, { remarks: reason });
      addAlert("success", "Timetable slot has been rejected.");
      fetchPendingSlots();
    } catch (err) {
      addAlert("error", "Rejection operation failed.");
    }
  };

  return (
    <div className="space-y-6" id="approvals-page">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academic Approvals</h1>
        <p className="text-sm text-gray-500">Authorize or reject drafted timetable schedules created by In-Charges</p>
      </div>

      {/* Main lists */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
        </div>
      ) : pendingSlots.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
          <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No pending timetable approvals</p>
          <p className="text-xs text-gray-400 mt-1">All drafted schedule allocations have been verified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingSlots.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-gray-200"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                    Sem {item.semester} ({item.classType})
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Branch: {item.branch} - Sec {item.section}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{item.subject}</h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{item.day}, {item.time}</span>
                  </span>
                  <span>Room No: <strong className="text-slate-800">{item.room}</strong></span>
                  <span>Assigned: <strong className="text-slate-800">{item.faculty}</strong></span>
                </div>

                {item.remarks && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600 max-w-xl">
                    <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="italic">Note: {item.remarks}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-row gap-2 sm:flex-col sm:items-end justify-end border-t border-gray-50 pt-3 sm:border-0 sm:pt-0">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Authorize Slot</span>
                </button>

                <button
                  onClick={() => handleReject(item.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 px-4 text-xs font-bold text-red-700 hover:bg-red-100 transition-all"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
