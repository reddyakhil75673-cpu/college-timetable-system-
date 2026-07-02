import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { GraduationCap, Plus, Edit2, Trash2, Calendar, Phone, Mail, Award, BookOpen } from "lucide-react";

export const Faculty: React.FC = () => {
  const { user, addAlert } = useApp();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [subject, setSubject] = useState("");

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const facRes = await API.get("/faculty");
      setFaculty(facRes.data);

      const workloadRes = await API.get("/reports/faculty-workload");
      setWorkloads(workloadRes.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve faculty details.");
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadCount = (email: string) => {
    const item = workloads.find((w) => w.email.toLowerCase() === email.toLowerCase());
    return item ? item.slotsCount : 0;
  };

  const getWorkloadSlots = (email: string) => {
    const item = workloads.find((w) => w.email.toLowerCase() === email.toLowerCase());
    return item ? item.slots : [];
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setQualification("");
    setExperience("");
    setSubject("");
    setShowModal(true);
  };

  const handleOpenEdit = (f: any) => {
    setEditId(f.id);
    setName(f.name);
    setEmail(f.email);
    setPhone(f.phone || "");
    setDepartment(f.department || "");
    setQualification(f.qualification || "");
    setExperience(f.experience || "");
    setSubject(f.subject || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      await API.delete(`/faculty/${id}`);
      addAlert("success", "Faculty member removed successfully.");
      fetchFacultyData();
    } catch (err) {
      addAlert("error", "Failed to remove faculty member.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      addAlert("error", "Name and email are required.");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      department,
      qualification,
      experience,
      subject,
    };

    try {
      if (editId) {
        await API.put(`/faculty/${editId}`, payload);
        addAlert("success", "Faculty details updated.");
      } else {
        await API.post("/faculty", payload);
        addAlert("success", "New faculty member profile registered.");
      }
      setShowModal(false);
      fetchFacultyData();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6" id="faculty-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Faculty Management</h1>
          <p className="text-sm text-gray-500">Track lecturer profiles, qualification status, and weekly teaching workload</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Faculty</span>
          </button>
        )}
      </div>

      {/* Grid of Faculty cards showing Workload details */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent"></div>
        </div>
      ) : faculty.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
          No faculty members registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {faculty.map((f) => {
            const workloadCount = getWorkloadCount(f.email);
            const workloadSlots = getWorkloadSlots(f.email);

            return (
              <div
                key={f.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Faculty details heading */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-base font-bold uppercase">
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{f.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">{f.department || "General Academics"}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="rounded px-1.5 py-1 text-gray-400 hover:bg-slate-50 hover:text-slate-800"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="rounded px-1.5 py-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub details */}
                <div className="mt-4 space-y-2 text-xs text-gray-600 font-medium">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{f.email}</span>
                  </p>
                  {f.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{f.phone}</span>
                    </p>
                  )}
                  {f.qualification && (
                    <p className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-gray-400" />
                      <span>{f.qualification} ({f.experience || "1 Yr exp"})</span>
                    </p>
                  )}
                  {f.subject && (
                    <p className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                      <span>Syllabus: {f.subject}</span>
                    </p>
                  )}
                </div>

                {/* Workload Indicator card */}
                <div className="mt-5 border-t border-gray-50 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>Workload Count:</span>
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-slate-700">
                      {workloadCount} Classes / week
                    </span>
                  </div>

                  {/* Workload details accordion preview */}
                  {workloadSlots.length > 0 && (
                    <div className="mt-3 bg-slate-50/50 rounded-lg p-2 max-h-24 overflow-y-auto space-y-1.5">
                      {workloadSlots.map((slot: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[10px] text-gray-500 font-medium border-b border-gray-100/60 pb-1 last:border-0 last:pb-0">
                          <span className="font-bold text-slate-700">{slot.day} - {slot.time}</span>
                          <span>{slot.branch}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editId ? "Update Faculty Profile" : "Register Faculty Member"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  placeholder="E.g. Dr. Anil Kumar"
                />
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
                  placeholder="anil.kumar@college.edu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. Ph.D"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. 12 Years"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Primary Subject Specialized
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  placeholder="E.g. Web Development"
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
