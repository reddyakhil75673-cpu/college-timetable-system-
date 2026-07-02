import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { Bell, CheckSquare, Trash2, MailOpen, AlertCircle } from "lucide-react";

export const Notifications: React.FC = () => {
  const { addAlert, fetchNotificationsCount } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all", {});
      addAlert("success", "All notifications marked as read.");
      fetchNotifications();
      fetchNotificationsCount();
    } catch (err) {
      addAlert("error", "Failed to update notification status.");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await API.delete(`/notifications/${id}`);
      addAlert("success", "Notification removed.");
      fetchNotifications();
      fetchNotificationsCount();
    } catch (err) {
      addAlert("error", "Failed to delete notification.");
    }
  };

  const toggleRead = async (item: any) => {
    if (item.read) return; // Already read
    try {
      await API.put(`/notifications/${item.id}`, { read: true });
      fetchNotifications();
      fetchNotificationsCount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="notifications-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated on draft updates, timetable approvals, and schedule adjustments</p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <CheckSquare className="h-4 w-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">All caught up!</p>
          <p className="text-xs text-gray-400 mt-1">You have no new alerts or approvals pending review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleRead(item)}
              className={`rounded-2xl border p-4 shadow-xs flex items-start gap-4 transition-all cursor-pointer ${
                item.read
                  ? "bg-white border-gray-100 opacity-75 hover:opacity-100"
                  : "bg-slate-50/80 border-slate-200/60 font-semibold"
              }`}
            >
              <div
                className={`rounded-full p-2.5 flex-shrink-0 ${
                  item.read ? "bg-gray-100 text-gray-400" : "bg-slate-800 text-white"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                  {item.message}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item.id);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Remove alert"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
