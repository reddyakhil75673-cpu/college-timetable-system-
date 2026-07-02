import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { Calendar, Save, AlertCircle, Trash } from "lucide-react";

export const EditTimetable: React.FC = () => {
  const { addAlert } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Configuration lists
  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form parameters
  const [selectedBranch, setSelectedBranch] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [day, setDay] = useState("Monday");
  const [subject, setSubject] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [room, setRoom] = useState("");
  const [classType, setClassType] = useState("Theory");
  const [remarks, setRemarks] = useState("");

  const [clashError, setClashError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetadataAndSlot();
  }, [id]);

  const fetchMetadataAndSlot = async () => {
    setLoading(true);
    try {
      // 1. Fetch form metadata
      const branchesRes = await API.get("/branches");
      setBranches(branchesRes.data);

      const subjectsRes = await API.get("/subjects");
      setSubjects(subjectsRes.data);

      const facultyRes = await API.get("/faculty");
      setFaculty(facultyRes.data);

      const roomsRes = await API.get("/rooms");
      setRooms(roomsRes.data);

      // 2. Fetch specific slot parameters
      const slotRes = await API.get(`/timetables/${id}`);
      const slot = slotRes.data;

      setSelectedBranch(slot.branch);
      setSection(slot.section);
      setSemester(slot.semester);
      setDay(slot.day);
      setSubject(slot.subject);
      setSelectedFaculty(slot.faculty);
      setStartTime(slot.startTime || "09:00");
      setEndTime(slot.endTime || "10:30");
      setRoom(slot.room);
      setClassType(slot.classType || "Theory");
      setRemarks(slot.remarks || "");
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve slot configuration details.");
      navigate("/timetables");
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (branchVal: string) => {
    setSelectedBranch(branchVal);
    const match = branches.find((b) => b.branchName === branchVal);
    if (match) {
      setSection(match.section || "A");
      setSemester(match.semester || "1");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClashError(null);

    const toMins = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMins(endTime) <= toMins(startTime)) {
      addAlert("error", "End time must be after start time.");
      return;
    }

    const payload = {
      branch: selectedBranch,
      section,
      semester,
      day,
      subject,
      faculty: selectedFaculty,
      startTime,
      endTime,
      room,
      classType,
      remarks,
    };

    try {
      await API.put(`/timetables/${id}`, payload);
      addAlert("success", "Timetable slot updated. Re-submitted for Principal review.");
      navigate("/timetables");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setClashError(err.response.data.message);
        addAlert("error", "Clash detected! Please alter times or resources.");
      } else {
        addAlert("error", err.response?.data?.message || "Failed to update slot.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="edit-timetable-page">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Modify Timetable Slot</h1>
        <p className="text-sm text-gray-500">Edit schedule allocations. Saving resets the status back to Pending review.</p>
      </div>

      {/* Clash Panel */}
      {clashError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Schedule Allocation Clash!</h4>
            <p className="mt-1 leading-normal font-medium">{clashError}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Branch *
              </label>
              <select
                required
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="">-- Select Branch --</option>
                {Array.from(new Set(branches.map((b) => b.branchName))).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Section *
              </label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Semester *
              </label>
              <input
                type="text"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Subject *
              </label>
              <select
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.subjectName}>
                    {s.subjectName} ({s.subjectCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Lecturer / Professor *
              </label>
              <select
                required
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="">-- Select Faculty --</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Day */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Weekday *
              </label>
              <select
                required
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Room */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Lecture Room / Lab *
              </label>
              <select
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="">-- Select Room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.roomNumber}>
                    Room {r.roomNumber} ({r.roomType}, {r.block})
                  </option>
                ))}
              </select>
            </div>

            {/* Class Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Class Type
              </label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="Seminar">Seminar</option>
                <option value="Project">Project</option>
                <option value="Free Period">Free Period</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Draft notes / comments (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Controls */}
          <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/timetables")}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
            >
              Update & Request Re-Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
