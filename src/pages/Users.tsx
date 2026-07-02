import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { User, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Filter } from "lucide-react";

export const Users: React.FC = () => {
  const { addAlert } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState("Active");

  // Filter states
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = roleFilter === "All" ? "/users" : `/users?role=${roleFilter}`;
      const res = await API.get(url);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve user list.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("Student");
    setPhone("");
    setBranch("");
    setSection("");
    setSemester("");
    setStatus("Active");
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Clear password field on edit
    setRole(user.role);
    setPhone(user.phone || "");
    setBranch(user.branch || "");
    setSection(user.section || "");
    setSemester(user.semester || "");
    setStatus(user.status || "Active");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      addAlert("success", "User deleted successfully.");
      fetchUsers();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Failed to delete user.");
    }
  };

  const toggleStatus = async (user: any) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      await API.put(`/users/${user.id}`, { status: newStatus });
      addAlert("success", `User account is now ${newStatus}.`);
      fetchUsers();
    } catch (err: any) {
      addAlert("error", "Failed to update account status.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!editId && !password)) {
      addAlert("error", "Please fill in all mandatory fields.");
      return;
    }

    const payload: any = {
      name,
      email,
      role,
      phone,
      branch,
      section,
      semester,
      status,
    };

    if (password) payload.password = password;

    try {
      if (editId) {
        await API.put(`/users/${editId}`, payload);
        addAlert("success", "User profile updated successfully.");
      } else {
        await API.post("/users", payload);
        addAlert("success", "New user registered successfully.");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Operation failed.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6" id="users-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage institution user accounts, roles, and status</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters/Search block */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-slate-800 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Role Filter</span>
          </span>
          {["All", "Admin", "Principal", "Incharge", "Faculty", "Student"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                roleFilter === r
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Department / Stream</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{u.phone || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      {u.branch ? `${u.branch} (Sec ${u.section || "A"}, Sem ${u.semester || "1"})` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border transition-all ${
                          u.status === "Active"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {u.status === "Active" ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          title="Edit Profile"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editId ? "Update User Account" : "Register New Account"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. Dr. Ramesh Kumar"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editId}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm disabled:opacity-60 focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="user@college.edu"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Password {editId ? "(Leave empty to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal</option>
                    <option value="Incharge">Incharge</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. 9876543210"
                  />
                </div>
              </div>

              {/* Conditional parameters based on role */}
              {(role === "Student" || role === "Faculty") && (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Academic Specifics ({role})
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:outline-none"
                        placeholder="E.g. CSE"
                      />
                    </div>
                    {role === "Student" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Section</label>
                          <input
                            type="text"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:outline-none"
                            placeholder="E.g. A"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Semester</label>
                          <input
                            type="text"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:outline-none"
                            placeholder="E.g. 3"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
