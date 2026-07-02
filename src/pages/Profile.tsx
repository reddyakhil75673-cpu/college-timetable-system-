import React, { useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { User, Key, Save, ShieldAlert } from "lucide-react";

export const Profile: React.FC = () => {
  const { user, addAlert } = useApp();

  // Change password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile contacts form
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addAlert("error", "Name cannot be empty.");
      return;
    }

    setProfileLoading(true);
    try {
      // Put to /users/:id to update user profile details
      await API.put(`/users/${user?.id}`, { name, phone });
      addAlert("success", "Profile metadata updated successfully. Refresh to reflect fully.");
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      addAlert("error", "All password fields are mandatory.");
      return;
    }

    if (newPassword !== confirmPassword) {
      addAlert("error", "New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await API.put("/auth/change-password", { oldPassword, newPassword });
      addAlert("success", "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Password modification failed.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="profile-page">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your institution security settings, contacts, and metadata credentials</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Info Sidebar panel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-4 space-y-4">
          <div className="text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-800 text-3xl font-black uppercase mx-auto">
              {user?.name.charAt(0)}
            </div>
            <h3 className="font-bold text-gray-900 text-lg mt-4">{user?.name}</h3>
            <span className="rounded-full bg-slate-100 border border-gray-200 px-3 py-0.5 text-xs font-bold uppercase mt-1.5 inline-block text-slate-700">
              {user?.role}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3 text-xs text-gray-600 font-medium">
            <div>
              <span className="text-gray-400">Institutional Email:</span>
              <p className="font-bold text-slate-800 mt-0.5 break-all">{user?.email}</p>
            </div>
            {user?.branch && (
              <div>
                <span className="text-gray-400">Assigned Branch Stream:</span>
                <p className="font-bold text-slate-800 mt-0.5">{user?.branch}</p>
              </div>
            )}
            {user?.semester && (
              <div>
                <span className="text-gray-400 font-sans">Current Semester:</span>
                <p className="font-bold text-slate-800 mt-0.5">Sem {user?.semester}</p>
              </div>
            )}
            <div>
              <span className="text-gray-400">Account status:</span>
              <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Forms panels */}
        <div className="md:col-span-8 space-y-8">
          {/* General Metadata form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <span>Update Contact Details</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Phone Contact No
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. 9123456780"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{profileLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Secure change password */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-sans font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-gray-400" />
              <span>Change Security Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Old Password
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
