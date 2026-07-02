import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { Users, Plus, Edit2, Trash2, Search, Filter } from "lucide-react";

export const Students: React.FC = () => {
  const { user, addAlert } = useApp();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");

  // Filters
  const [searchRoll, setSearchRoll] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchStudents();
  }, [searchRoll, branchFilter, sectionFilter, semesterFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let queryParams: string[] = [];
      if (searchRoll) queryParams.push(`rollNumber=${searchRoll}`);
      if (branchFilter !== "All") queryParams.push(`branch=${branchFilter}`);
      if (sectionFilter !== "All") queryParams.push(`section=${sectionFilter}`);
      if (semesterFilter !== "All") queryParams.push(`semester=${semesterFilter}`);

      const url = queryParams.length > 0 ? `/students?${queryParams.join("&")}` : "/students";
      const res = await API.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName("");
    setRollNumber("");
    setEmail("");
    setPhone("");
    setBranch("");
    setSection("");
    setSemester("");
    setShowModal(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditId(s.id);
    setName(s.name);
    setRollNumber(s.rollNumber);
    setEmail(s.email);
    setPhone(s.phone || "");
    setBranch(s.branch || "");
    setSection(s.section || "");
    setSemester(s.semester || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    try {
      await API.delete(`/students/${id}`);
      addAlert("success", "Student removed successfully.");
      fetchStudents();
    } catch (err) {
      addAlert("error", "Failed to remove student.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber || !email) {
      addAlert("error", "Mandatory details missing.");
      return;
    }

    const payload = {
      name,
      rollNumber,
      email,
      phone,
      branch,
      section,
      semester,
    };

    try {
      if (editId) {
        await API.put(`/students/${editId}`, payload);
        addAlert("success", "Student profile updated.");
      } else {
        await API.post("/students", payload);
        addAlert("success", "Student registered successfully.");
      }
      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Operation failed.");
    }
  };

  // Get unique filters from state for list
  const branchesList = ["All", "CSE", "AI", "DS", "BBA", "B.Com"];
  const sectionsList = ["All", "A", "B", "C"];
  const semestersList = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="space-y-6" id="students-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500">Track profiles, roll numbers, sections, and semesters</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll Student</span>
          </button>
        )}
      </div>

      {/* Advanced Search & Filtering Panels */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-4">
        {/* Roll Number Search */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Search Roll Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search roll..."
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-slate-800 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Branch Filter */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Filter Branch
          </label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold focus:border-slate-800 focus:outline-none"
          >
            {branchesList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Filter Section
          </label>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold focus:border-slate-800 focus:outline-none"
          >
            {sectionsList.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Sections" : `Section ${s}`}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Filter Semester
          </label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold focus:border-slate-800 focus:outline-none"
          >
            {semestersList.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Semesters" : `Semester ${s}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Sec</th>
                <th className="px-6 py-4">Sem</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-400">
                    No students matching specified criteria found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                        {s.name.charAt(0)}
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">{s.rollNumber}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">{s.phone || "—"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-teal-700">{s.branch}</td>
                    <td className="px-6 py-4 text-xs">Section {s.section}</td>
                    <td className="px-6 py-4 text-xs font-bold">Sem {s.semester}</td>
                    {isAdmin && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editId ? "Update Student Profile" : "Register Student Enrollment"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  placeholder="E.g. Akhil Reddy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editId}
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm disabled:opacity-60 focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. CS26001"
                  />
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
                    placeholder="E.g. 9123456780"
                  />
                </div>
              </div>

              <div>
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
                  placeholder="student@college.edu"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Branch *
                  </label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:outline-none"
                    placeholder="E.g. CSE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Section *
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:outline-none"
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
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:outline-none"
                    placeholder="E.g. 3"
                  />
                </div>
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
