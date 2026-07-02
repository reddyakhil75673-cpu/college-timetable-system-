import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { Layers, Plus, Edit2, Trash2 } from "lucide-react";

export const Branches: React.FC = () => {
  const { user, addAlert } = useApp();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-2027");

  const canEdit = user?.role === "Admin" || user?.role === "Incharge";

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await API.get("/branches");
      setBranches(res.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve branches.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setBranchName("");
    setSection("");
    setSemester("");
    setAcademicYear("2026-2027");
    setShowModal(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditId(b.id);
    setBranchName(b.branchName);
    setSection(b.section);
    setSemester(b.semester);
    setAcademicYear(b.academicYear || "2026-2027");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await API.delete(`/branches/${id}`);
      addAlert("success", "Branch deleted successfully.");
      fetchBranches();
    } catch (err) {
      addAlert("error", "Failed to delete branch.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !section || !semester) {
      addAlert("error", "All fields are required.");
      return;
    }

    const payload = { branchName, section, semester, academicYear };

    try {
      if (editId) {
        await API.put(`/branches/${editId}`, payload);
        addAlert("success", "Branch details updated successfully.");
      } else {
        await API.post("/branches", payload);
        addAlert("success", "New branch created successfully.");
      }
      setShowModal(false);
      fetchBranches();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6" id="branches-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Branch Management</h1>
          <p className="text-sm text-gray-500">Manage academic departments, sections, and semesters</p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Branch</span>
          </button>
        )}
      </div>

      {/* Branches List Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Branch / Stream</th>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">Academic Year</th>
                {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-gray-400">
                    No branches registered yet.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-400" />
                      <span>{b.branchName}</span>
                    </td>
                    <td className="px-6 py-4">{b.section}</td>
                    <td className="px-6 py-4">{b.semester}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{b.academicYear}</td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editId ? "Update Branch Details" : "Create New Branch Profile"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 font-sans">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  placeholder="E.g. Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Section *
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Semester *
                  </label>
                  <input
                    type="text"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  placeholder="E.g. 2026-2027"
                />
              </div>

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
