import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { DashboardCard } from "../components/DashboardCard.tsx";
import { ClipboardCheck, Check, X, AlertTriangle, MessageSquare, Calendar } from "lucide-react";

export const PrincipalDashboard: React.FC = () => {
  const { user, t, addAlert } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [pendingSlots, setPendingSlots] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await API.get("/reports/dashboard");
      setStats(statsRes.data);

      const pendingRes = await API.get("/timetables?status=Pending");
      setPendingSlots(pendingRes.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve Principal dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const slotRemarks = remarks[id] || "Approved by Principal";
    try {
      await API.put(`/timetables/${id}/approve`, { remarks: slotRemarks });
      addAlert("success", "Timetable slot has been approved.");
      fetchDashboardData();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Failed to approve.");
    }
  };

  const handleReject = async (id: string) => {
    const slotRemarks = remarks[id];
    if (!slotRemarks) {
      addAlert("error", "Please write a remark explaining the reason for rejection.");
      return;
    }

    try {
      await API.put(`/timetables/${id}/reject`, { remarks: slotRemarks });
      addAlert("success", "Timetable slot has been rejected.");
      fetchDashboardData();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Failed to reject.");
    }
  };

  const handleRemarkChange = (id: string, text: string) => {
    setRemarks((prev) => ({ ...prev, [id]: text }));
  };

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="principal-dashboard-page">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Principal Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          {t.welcome}, <span className="font-semibold">{user?.name}</span> (Principal Principal)
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Pending Approvals"
          value={pendingSlots.length}
          icon={AlertTriangle}
          color="bg-amber-50 text-amber-600 border-amber-100"
          description="Awaiting your approval"
        />
        <DashboardCard
          title="Today's Classes"
          value={stats.todayClasses}
          icon={Calendar}
          color="bg-green-50 text-green-600 border-green-100"
          description="Approved active slots"
        />
        <DashboardCard
          title="Total Scheduled Slots"
          value={stats.totalTimetables}
          icon={ClipboardCheck}
          color="bg-blue-50 text-blue-600 border-blue-100"
          description="Across all branches"
        />
      </div>

      {/* Approvals section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h3 className="font-sans font-bold text-gray-900">
            Pending Timetable Review Queue
          </h3>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {pendingSlots.length} Pending Actions
          </span>
        </div>

        {pendingSlots.length === 0 ? (
          <div className="py-12 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto bg-green-50 rounded-full p-2 mb-3" />
            <p className="text-slate-600 font-medium">All clear! No timetables are currently pending approval.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingSlots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 shadow-sm transition-all hover:bg-slate-50"
              >
                {/* Slot header metadata */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="inline-block rounded-full bg-slate-200 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {slot.branch} sec {slot.section} (Sem {slot.semester})
                    </span>
                    <h4 className="text-lg font-bold text-slate-800 mt-2">{slot.subject}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      Lecturer: <span className="text-slate-700">{slot.faculty}</span> | Room:{" "}
                      <span className="text-slate-700">{slot.room}</span> | Day:{" "}
                      <span className="text-slate-700 font-semibold">{slot.day}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-block rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm font-bold text-slate-800 shadow-sm">
                      {slot.time}
                    </span>
                    <p className="text-xs text-gray-400 mt-1.5 uppercase font-semibold tracking-wider">
                      Type: {slot.classType}
                    </p>
                  </div>
                </div>

                {/* Actions and Remarks input */}
                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Add evaluation remarks or feedback (Required for Rejections)"
                      value={remarks[slot.id] || ""}
                      onChange={(e) => handleRemarkChange(slot.id, e.target.value)}
                      className="block w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(slot.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(slot.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
