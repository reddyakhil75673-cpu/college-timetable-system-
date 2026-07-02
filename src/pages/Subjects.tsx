import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { BookOpen, Plus, Edit2, Trash2, User } from "lucide-react";

export const Subjects: React.FC = () => {
  const { user, addAlert } = useApp();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [faculty, setFaculty] = useState("");
  const [credits, setCredits] = useState(3);

  const canEdit = user?.role === "Admin" || user?.role === "Incharge";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subRes = await API.get("/subjects");
      setSubjects(subRes.data);

      const facRes = await API.get("/faculty");
      setFacultyList(facRes.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve subjects.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setSubjectName("");
    setSubjectCode("");
    setBranch("");
    setSemester("");
    setFaculty("");
    setCredits(3);
    setShowModal(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditId(s.id);
    setSubjectName(s.subjectName);
    setSubjectCode(s.subjectCode);
    setBranch(s.branch);
    setSemester(s.semester);
    setFaculty(s.faculty || "");
    setCredits(Number(s.credits) || 3);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await API.delete(`/subjects/${id}`);
      addAlert("success", "Subject deleted successfully.");
      fetchData();
    } catch (err) {
      addAlert("error", "Failed to delete subject.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !subjectCode || !branch || !semester) {
      addAlert("error", "Mandatory fields missing.");
      return;
    }

    const payload = {
      subjectName,
      subjectCode,
      branch,
      semester,
      faculty,
      credits: Number(credits) || 3,
    };

    try {
      if (editId) {
        await API.put(`/subjects/${editId}`, payload);
        addAlert("success", "Subject updated successfully.");
      } else {
        await API.post("/subjects", payload);
        addAlert("success", "Subject created successfully.");
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6" id="subjects-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subject Management</h1>
          <p className="text-sm text-gray-500">Manage syllabus courses, codes, credits, and assigned lecturers</p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Subject</span>
          </button>
        )}
      </div>

      {/* Subjects Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Subject Name</th>
                <th className="px-6 py-4">Subject Code</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">Assigned Faculty</th>
                <th className="px-6 py-4">Credits</th>
                {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                    No subjects registered.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>{s.subjectName}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold">{s.subjectCode}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{s.branch}</td>
                    <td className="px-6 py-4 text-xs">Sem {s.semester}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {s.faculty ? (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span>{s.faculty}</span>
                        </span>
                      ) : (
                        <span className="italic text-gray-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                      <span className="rounded bg-slate-100 px-2 py-0.5">{s.credits} Credits</span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
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
              {editId ? "Update Subject Details" : "Create New Subject"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  placeholder="E.g. Database Management Systems"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editId}
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm disabled:opacity-60 focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. CS302"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Branch *
                  </label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. CSE"
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
                  Assign Lecturer / Faculty
                </label>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Select Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
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
