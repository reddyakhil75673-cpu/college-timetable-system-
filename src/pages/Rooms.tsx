import React, { useEffect, useState } from "react";
import API from "../api/api.ts";
import { useApp } from "../context/AppContext.tsx";
import { DoorOpen, Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";

export const Rooms: React.FC = () => {
  const { user, addAlert } = useApp();
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomUsage, setRoomUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("Classroom");
  const [capacity, setCapacity] = useState(60);
  const [block, setBlock] = useState("Block A");
  const [availability, setAvailability] = useState("Available");

  const canEdit = user?.role === "Admin" || user?.role === "Incharge";

  useEffect(() => {
    fetchRoomsData();
  }, []);

  const fetchRoomsData = async () => {
    setLoading(true);
    try {
      const roomsRes = await API.get("/rooms");
      setRooms(roomsRes.data);

      const usageRes = await API.get("/reports/room-usage");
      setRoomUsage(usageRes.data);
    } catch (err) {
      console.error(err);
      addAlert("error", "Failed to retrieve rooms.");
    } finally {
      setLoading(false);
    }
  };

  const getUsageCount = (roomNo: string) => {
    const item = roomUsage.find((r) => r.roomNumber === roomNo);
    return item ? item.slotsCount : 0;
  };

  const getUsageSlots = (roomNo: string) => {
    const item = roomUsage.find((r) => r.roomNumber === roomNo);
    return item ? item.slots : [];
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setRoomNumber("");
    setRoomType("Classroom");
    setCapacity(60);
    setBlock("Block A");
    setAvailability("Available");
    setShowModal(true);
  };

  const handleOpenEdit = (r: any) => {
    setEditId(r.id);
    setRoomNumber(r.roomNumber);
    setRoomType(r.roomType);
    setCapacity(Number(r.capacity) || 50);
    setBlock(r.block || "Main Block");
    setAvailability(r.availability || "Available");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await API.delete(`/rooms/${id}`);
      addAlert("success", "Room deleted successfully.");
      fetchRoomsData();
    } catch (err) {
      addAlert("error", "Failed to delete room.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !roomType) {
      addAlert("error", "Room number and room type are mandatory.");
      return;
    }

    const payload = {
      roomNumber,
      roomType,
      capacity: Number(capacity) || 50,
      block,
      availability,
    };

    try {
      if (editId) {
        await API.put(`/rooms/${editId}`, payload);
        addAlert("success", "Room updated successfully.");
      } else {
        await API.post("/rooms", payload);
        addAlert("success", "New lecture hall / lab registered.");
      }
      setShowModal(false);
      fetchRoomsData();
    } catch (err: any) {
      addAlert("error", err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6" id="rooms-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Room & Resource Management</h1>
          <p className="text-sm text-gray-500">Manage lecture halls, labs, seminars, and verify room booking availability</p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      {/* Rooms Cards showing availability */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
          No lecture halls or labs registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => {
            const usageCount = getUsageCount(r.roomNumber);
            const usageSlots = getUsageSlots(r.roomNumber);

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Heading */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                      <DoorOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Room {r.roomNumber}</h3>
                      <p className="text-xs font-semibold text-slate-500">{r.block}</p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      r.availability === "Available"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {r.availability === "Available" ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Maintenance</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Sub Metadata */}
                <div className="mt-4 flex justify-between text-xs font-medium text-gray-600">
                  <div>
                    <span className="text-gray-400">Room Type:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{r.roomType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400">Capacity:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{r.capacity} Seats</p>
                  </div>
                </div>

                {/* Booking count status */}
                <div className="mt-5 border-t border-gray-50 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Weekly Booking Slots:</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                      {usageCount} Approved Classes
                    </span>
                  </div>

                  {/* Sub bookings list */}
                  {usageSlots.length > 0 && (
                    <div className="mt-3 bg-slate-50/50 rounded-lg p-2 max-h-24 overflow-y-auto space-y-1.5">
                      {usageSlots.map((slot: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[10px] text-gray-500 font-medium border-b border-gray-100/60 pb-1 last:border-0 last:pb-0">
                          <span className="font-bold text-slate-700">{slot.day} - {slot.time}</span>
                          <span>{slot.branch}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit Controls */}
                {canEdit && (
                  <div className="mt-4 flex justify-end gap-2 border-t border-gray-50 pt-3">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editId ? "Update Room Parameters" : "Register Lecture Hall / Lab"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editId}
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm disabled:opacity-60 focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. 203"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Room Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. 60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Seminar Hall">Seminar Hall</option>
                    <option value="Auditorium">Auditorium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Building Block / Location
                  </label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                    placeholder="E.g. Block A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Availability Status *
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-sm focus:border-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="Available">Available (Active)</option>
                  <option value="Booked">Booked (Maintenance)</option>
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
