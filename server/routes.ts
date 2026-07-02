import express, { Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  Users,
  Branches,
  Subjects,
  Faculty,
  Students,
  Rooms,
  Timetables,
  Notifications,
  checkTimetableClash,
} from "./db.ts";
import { authMiddleware, roleMiddleware, AuthRequest } from "./authMiddleware.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "college_timetable_secret_key";

// Helper to send notifications
function createNotification(title: string, message: string, role: string = "All", userId: string = "All") {
  try {
    Notifications.create({
      title,
      message,
      role,
      userId,
      read: false,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// ==========================================
// 1. AUTHENTICATION APIs
// ==========================================

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "Your account is deactivated. Please contact Admin." });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Sign Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        branch: user.branch,
        section: user.section,
        semester: user.semester,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/auth/register (For Admins to register users)
router.post("/auth/register", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  const { name, email, password, role, phone, branch, section, semester } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  try {
    const existingUser = Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = Users.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      branch: branch || "",
      section: section || "",
      semester: semester || "",
      status: "Active",
    });

    // Create secondary profiles if role is Student or Faculty
    if (role === "Student") {
      const rollNumber = `ST${Math.floor(10000 + Math.random() * 90000)}`;
      Students.create({
        name,
        rollNumber,
        email,
        phone: phone || "",
        branch: branch || "",
        section: section || "",
        semester: semester || "",
      });
      createNotification("Welcome!", `Student ${name} has been enrolled.`, "Student", newUser.id);
    } else if (role === "Faculty") {
      Faculty.create({
        name,
        email,
        phone: phone || "",
        department: branch || "Computer Science",
        qualification: "M.Tech / Ph.D",
        experience: "1 Year",
        subject: "",
      });
      createNotification("Welcome!", `Faculty member ${name} has joined the institute.`, "Faculty", newUser.id);
    }

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: newUser.id, name, email, role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/auth/me
router.get("/auth/me", authMiddleware, (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/change-password
router.put("/auth/change-password", authMiddleware, async (req: AuthRequest, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old password and new password are required." });
  }

  try {
    const user = Users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    Users.findByIdAndUpdate(user.id, { password: hashedNewPassword });

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// ==========================================
// 2. USER MANAGEMENT APIs (Admin Only)
// ==========================================

router.get("/users", authMiddleware, roleMiddleware(["Admin"]), (req, res) => {
  const { role } = req.query;
  let list = Users.find();
  if (role) {
    list = list.filter((u) => u.role === role);
  }
  // Strip passwords for security
  const safeList = list.map(({ password, ...u }) => u);
  return res.json(safeList);
});

router.post("/users", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  const { name, email, password, role, phone, branch, section, semester, status } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  try {
    const existing = Users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = Users.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      branch: branch || "",
      section: section || "",
      semester: semester || "",
      status: status || "Active",
    });

    if (role === "Student") {
      Students.create({
        name,
        rollNumber: `ST${Math.floor(10000 + Math.random() * 90000)}`,
        email,
        phone: phone || "",
        branch: branch || "",
        section: section || "",
        semester: semester || "",
      });
    } else if (role === "Faculty") {
      Faculty.create({
        name,
        email,
        phone: phone || "",
        department: branch || "Computer Science",
        qualification: "M.Tech",
        experience: "1 Year",
        subject: "",
      });
    }

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/users/:id", authMiddleware, (req, res) => {
  const user = Users.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  const { password, ...safeUser } = user;
  return res.json(safeUser);
});

router.put("/users/:id", authMiddleware, async (req: AuthRequest, res) => {
  // Allow Admin to edit any user, and others to edit their own profile
  const isAdmin = req.user?.role === "Admin";
  if (!isAdmin && req.user?.id !== req.params.id) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { name, phone, branch, section, semester, status, password } = req.body;
  const updateData: any = {};

  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (branch !== undefined) updateData.branch = branch;
  if (section !== undefined) updateData.section = section;
  if (semester !== undefined) updateData.semester = semester;
  if (isAdmin && status) updateData.status = status;

  if (password) {
    updateData.password = await bcryptjs.hash(password, 10);
  }

  try {
    const updated = Users.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    // Sync profiles
    if (updated.role === "Student") {
      const stud = Students.findOne({ email: updated.email });
      if (stud) {
        Students.findByIdAndUpdate(stud.id, {
          name: updated.name,
          phone: updated.phone,
          branch: updated.branch,
          section: updated.section,
          semester: updated.semester,
        });
      }
    } else if (updated.role === "Faculty") {
      const fac = Faculty.findOne({ email: updated.email });
      if (fac) {
        Faculty.findByIdAndUpdate(fac.id, {
          name: updated.name,
          phone: updated.phone,
          department: updated.branch || fac.department,
        });
      }
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.delete("/users/:id", authMiddleware, roleMiddleware(["Admin"]), (req, res) => {
  const user = Users.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });

  // Delete secondary profile
  if (user.role === "Student") {
    const stud = Students.findOne({ email: user.email });
    if (stud) Students.findByIdAndDelete(stud.id);
  } else if (user.role === "Faculty") {
    const fac = Faculty.findOne({ email: user.email });
    if (fac) Faculty.findByIdAndDelete(fac.id);
  }

  Users.findByIdAndDelete(req.params.id);
  return res.json({ message: "User deleted successfully." });
});

// ==========================================
// 3. BRANCH MANAGEMENT APIs
// ==========================================

router.get("/branches", authMiddleware, (req, res) => {
  return res.json(Branches.find());
});

router.post("/branches", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const { branchName, section, semester, academicYear } = req.body;
  if (!branchName || !section || !semester) {
    return res.status(400).json({ message: "Branch name, section, and semester are required." });
  }
  const newBranch = Branches.create({ branchName, section, semester, academicYear: academicYear || "2026-2027" });
  return res.status(201).json(newBranch);
});

router.get("/branches/:id", authMiddleware, (req, res) => {
  const b = Branches.findById(req.params.id);
  if (!b) return res.status(404).json({ message: "Branch not found." });
  return res.json(b);
});

router.put("/branches/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const b = Branches.findByIdAndUpdate(req.params.id, req.body);
  if (!b) return res.status(404).json({ message: "Branch not found." });
  return res.json(b);
});

router.delete("/branches/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const success = Branches.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Branch not found." });
  return res.json({ message: "Branch deleted." });
});

// ==========================================
// 4. SUBJECT MANAGEMENT APIs
// ==========================================

router.get("/subjects", authMiddleware, (req, res) => {
  return res.json(Subjects.find());
});

router.post("/subjects", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const { subjectName, subjectCode, branch, semester, faculty, credits } = req.body;
  if (!subjectName || !subjectCode || !branch || !semester) {
    return res.status(400).json({ message: "Subject name, code, branch, and semester are required." });
  }

  // Check unique subjectCode
  const existing = Subjects.findOne({ subjectCode });
  if (existing) {
    return res.status(400).json({ message: "Subject code already exists." });
  }

  const newSub = Subjects.create({
    subjectName,
    subjectCode,
    branch,
    semester,
    faculty: faculty || "",
    credits: Number(credits) || 3,
  });

  return res.status(201).json(newSub);
});

router.get("/subjects/:id", authMiddleware, (req, res) => {
  const s = Subjects.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Subject not found." });
  return res.json(s);
});

router.put("/subjects/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const s = Subjects.findByIdAndUpdate(req.params.id, req.body);
  if (!s) return res.status(404).json({ message: "Subject not found." });
  return res.json(s);
});

router.delete("/subjects/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const success = Subjects.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Subject not found." });
  return res.json({ message: "Subject deleted." });
});

// ==========================================
// 5. FACULTY MANAGEMENT APIs
// ==========================================

router.get("/faculty", authMiddleware, (req, res) => {
  return res.json(Faculty.find());
});

router.post("/faculty", authMiddleware, roleMiddleware(["Admin"]), (req, res) => {
  const { name, email, phone, department, qualification, experience, subject } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }
  const newFac = Faculty.create({
    name,
    email,
    phone: phone || "",
    department: department || "",
    qualification: qualification || "",
    experience: experience || "",
    subject: subject || "",
  });
  return res.status(201).json(newFac);
});

router.get("/faculty/:id", authMiddleware, (req, res) => {
  const f = Faculty.findById(req.params.id);
  if (!f) return res.status(404).json({ message: "Faculty not found." });
  return res.json(f);
});

router.put("/faculty/:id", authMiddleware, roleMiddleware(["Admin", "Faculty"]), (req, res) => {
  const f = Faculty.findByIdAndUpdate(req.params.id, req.body);
  if (!f) return res.status(404).json({ message: "Faculty not found." });
  return res.json(f);
});

router.delete("/faculty/:id", authMiddleware, roleMiddleware(["Admin"]), (req, res) => {
  const success = Faculty.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Faculty not found." });
  return res.json({ message: "Faculty deleted." });
});

// ==========================================
// 6. STUDENT MANAGEMENT APIs
// ==========================================

router.get("/students", authMiddleware, (req, res) => {
  const { rollNumber, branch, section, semester } = req.query;
  let list = Students.find();

  if (rollNumber) {
    list = list.filter((s) => s.rollNumber.toLowerCase().includes((rollNumber as string).toLowerCase()));
  }
  if (branch) list = list.filter((s) => s.branch === branch);
  if (section) list = list.filter((s) => s.section === section);
  if (semester) list = list.filter((s) => s.semester === semester);

  return res.json(list);
});

router.post("/students", authMiddleware, roleMiddleware(["Admin"]), (req, res) => {
  const { name, rollNumber, email, phone, branch, section, semester } = req.body;
  if (!name || !rollNumber || !email) {
    return res.status(400).json({ message: "Name, roll number, and email are required." });
  }

  const existing = Students.findOne({ rollNumber });
  if (existing) {
    return res.status(400).json({ message: "Roll number already exists." });
  }

  const newStud = Students.create({
    name,
    rollNumber,
    email,
    phone: phone || "",
    branch: branch || "",
    section: section || "",
    semester: semester || "",
  });

  return res.status(201).json(newStud);
});

router.get("/students/:id", authMiddleware, (req, res) => {
  const s = Students.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Student not found." });
  return res.json(s);
});

router.put("/students/:id", authMiddleware, roleMiddleware(["Admin", "Student"]), (req, res) => {
  const s = Students.findByIdAndUpdate(req.params.id, req.body);
  if (!s) return res.status(404).json({ message: "Student not found." });
  return res.json(s);
});

router.delete("/students/:id", authMiddleware, roleMiddleware(["Admin"]), (req, res) => {
  const success = Students.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Student not found." });
  return res.json({ message: "Student deleted." });
});

// ==========================================
// 7. ROOM MANAGEMENT APIs
// ==========================================

router.get("/rooms", authMiddleware, (req, res) => {
  return res.json(Rooms.find());
});

router.post("/rooms", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const { roomNumber, roomType, capacity, block, availability } = req.body;
  if (!roomNumber || !roomType) {
    return res.status(400).json({ message: "Room number and type are required." });
  }

  const existing = Rooms.findOne({ roomNumber });
  if (existing) {
    return res.status(400).json({ message: "Room number already exists." });
  }

  const newRoom = Rooms.create({
    roomNumber,
    roomType,
    capacity: Number(capacity) || 50,
    block: block || "Main Block",
    availability: availability || "Available",
  });

  return res.status(201).json(newRoom);
});

router.get("/rooms/:id", authMiddleware, (req, res) => {
  const r = Rooms.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Room not found." });
  return res.json(r);
});

router.put("/rooms/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const r = Rooms.findByIdAndUpdate(req.params.id, req.body);
  if (!r) return res.status(404).json({ message: "Room not found." });
  return res.json(r);
});

router.delete("/rooms/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const success = Rooms.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Room not found." });
  return res.json({ message: "Room deleted." });
});

// ==========================================
// 8. TIMETABLE MANAGEMENT APIs
// ==========================================

router.get("/timetables", authMiddleware, (req, res) => {
  const { branch, section, semester, day, faculty, room, status } = req.query;
  let list = Timetables.find();

  if (branch) list = list.filter((t) => t.branch === branch);
  if (section) list = list.filter((t) => t.section === section);
  if (semester) list = list.filter((t) => t.semester === semester);
  if (day) list = list.filter((t) => t.day === day);
  if (faculty) list = list.filter((t) => t.faculty === faculty);
  if (room) list = list.filter((t) => t.room === room);
  if (status) list = list.filter((t) => t.status === status);

  return res.json(list);
});

// POST /api/timetables (Create timetable - Clash detection integrated)
router.post("/timetables", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const { branch, section, semester, day, subject, faculty, startTime, endTime, room, classType, remarks } =
    req.body;

  if (!branch || !section || !semester || !day || !subject || !faculty || !startTime || !endTime || !room) {
    return res.status(400).json({ message: "All timetable fields are required." });
  }

  // 1. Run Clash Detection
  const clashResult = checkTimetableClash({
    day,
    startTime,
    endTime,
    faculty,
    room,
    branch,
    section,
    semester,
  });

  if (clashResult.clash) {
    return res.status(409).json({ message: clashResult.message });
  }

  // Construct readable time string e.g. "09:00 AM - 10:30 AM"
  const formatTime = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, "0")}:${mStr} ${ampm}`;
  };

  const timeLabel = `${formatTime(startTime)} - ${formatTime(endTime)}`;

  // Create record with default 'Pending' status
  const newTimetable = Timetables.create({
    branch,
    section,
    semester,
    day,
    subject,
    faculty,
    time: timeLabel,
    startTime,
    endTime,
    room,
    classType: classType || "Theory",
    status: "Pending",
    remarks: remarks || "",
  });

  // Notify Principal & In-Charges
  createNotification(
    "New Timetable Pending Approval",
    `Timetable for ${branch} Sec ${section} Sem ${semester} on ${day} (${timeLabel}) is submitted and pending approval.`,
    "Principal"
  );

  return res.status(201).json(newTimetable);
});

// GET /api/timetables/:id
router.get("/timetables/:id", authMiddleware, (req, res) => {
  const t = Timetables.findById(req.params.id);
  if (!t) return res.status(404).json({ message: "Timetable slot not found." });
  return res.json(t);
});

// PUT /api/timetables/:id (Update - Clash check included)
router.put("/timetables/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const currentSlot = Timetables.findById(req.params.id);
  if (!currentSlot) {
    return res.status(404).json({ message: "Timetable slot not found." });
  }

  const { branch, section, semester, day, subject, faculty, startTime, endTime, room, classType, remarks } =
    req.body;

  // Run clash detection excluding current slot
  const clashResult = checkTimetableClash({
    id: req.params.id,
    day: day || currentSlot.day,
    startTime: startTime || currentSlot.startTime,
    endTime: endTime || currentSlot.endTime,
    faculty: faculty || currentSlot.faculty,
    room: room || currentSlot.room,
    branch: branch || currentSlot.branch,
    section: section || currentSlot.section,
    semester: semester || currentSlot.semester,
  });

  if (clashResult.clash) {
    return res.status(409).json({ message: clashResult.message });
  }

  const formatTime = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, "0")}:${mStr} ${ampm}`;
  };

  const updatePayload: any = { ...req.body };
  if (startTime && endTime) {
    updatePayload.time = `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  // When updated, status resets to Pending so Principal can review again
  updatePayload.status = "Pending";

  const updated = Timetables.findByIdAndUpdate(req.params.id, updatePayload);
  createNotification(
    "Timetable Updated",
    `Timetable for ${updated?.branch} Sec ${updated?.section} was updated and submitted for approval.`,
    "Principal"
  );

  return res.json(updated);
});

// DELETE /api/timetables/:id
router.delete("/timetables/:id", authMiddleware, roleMiddleware(["Admin", "Incharge"]), (req, res) => {
  const success = Timetables.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Timetable slot not found." });
  return res.json({ message: "Timetable slot deleted successfully." });
});

// PUT /api/timetables/:id/approve (Principal/Admin)
router.put("/timetables/:id/approve", authMiddleware, roleMiddleware(["Principal", "Admin"]), (req, res) => {
  const { remarks } = req.body;
  const updated = Timetables.findByIdAndUpdate(req.params.id, {
    status: "Approved",
    remarks: remarks || "Approved by Principal",
  });

  if (!updated) return res.status(404).json({ message: "Timetable slot not found." });

  // Notify Students & Faculty
  createNotification(
    "Timetable Approved!",
    `Timetable for ${updated.branch} Sec ${updated.section} Sem ${updated.semester} on ${updated.day} is APPROVED.`,
    "Student"
  );
  createNotification(
    "Your Teaching Slot Approved",
    `Your class for "${updated.subject}" on ${updated.day} (${updated.time}) has been approved.`,
    "Faculty"
  );

  return res.json(updated);
});

// PUT /api/timetables/:id/reject (Principal/Admin)
router.put("/timetables/:id/reject", authMiddleware, roleMiddleware(["Principal", "Admin"]), (req, res) => {
  const { remarks } = req.body;
  const updated = Timetables.findByIdAndUpdate(req.params.id, {
    status: "Rejected",
    remarks: remarks || "Rejected by Principal. Review required.",
  });

  if (!updated) return res.status(404).json({ message: "Timetable slot not found." });

  // Notify Incharges
  createNotification(
    "Timetable Slot Rejected",
    `The slot for ${updated.branch} Sec ${updated.section} Sem ${updated.semester} on ${updated.day} (${updated.subject}) was rejected. Remarks: ${remarks}`,
    "Incharge"
  );

  return res.json(updated);
});

// GET /api/timetables/student/my-timetable
router.get("/timetables/student/my-timetable", authMiddleware, (req: AuthRequest, res) => {
  if (req.user?.role !== "Student") {
    return res.status(403).json({ message: "Only students can access this route." });
  }

  const { branch, section, semester } = req.user;
  if (!branch || !section || !semester) {
    return res.status(400).json({ message: "Student profile is incomplete. Branch/Section/Semester missing." });
  }

  // Students see ONLY Approved slots
  const list = Timetables.find((t) => {
    return (
      t.status === "Approved" &&
      t.branch === branch &&
      t.section === section &&
      t.semester === semester
    );
  });

  return res.json(list);
});

// GET /api/timetables/faculty/my-timetable
router.get("/timetables/faculty/my-timetable", authMiddleware, (req: AuthRequest, res) => {
  if (req.user?.role !== "Faculty") {
    return res.status(403).json({ message: "Only faculty can access this route." });
  }

  // Match faculty name in timetable slots
  const list = Timetables.find((t) => {
    return t.status === "Approved" && t.faculty.toLowerCase() === req.user!.name.toLowerCase();
  });

  return res.json(list);
});

// GET /api/timetables/today/classes
router.get("/timetables/today/classes", authMiddleware, (req: AuthRequest, res) => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDay = daysOfWeek[new Date().getDay()];

  let list = Timetables.find((t) => t.status === "Approved" && t.day === todayDay);

  if (req.user?.role === "Student") {
    list = list.filter(
      (t) =>
        t.branch === req.user!.branch &&
        t.section === req.user!.section &&
        t.semester === req.user!.semester
    );
  } else if (req.user?.role === "Faculty") {
    list = list.filter((t) => t.faculty.toLowerCase() === req.user!.name.toLowerCase());
  }

  return res.json(list);
});

// ==========================================
// 9. NOTIFICATION APIs
// ==========================================

router.get("/notifications", authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const list = Notifications.find((n) => {
    // If targeted at All, allow access
    if (n.role === "All" || n.userId === "All") return true;
    // If matches user's specific role
    if (n.role === user.role) return true;
    // If matches user's specific ID
    if (n.userId === user.id) return true;
    return false;
  });

  // Sort by newest
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json(list);
});

router.post("/notifications", authMiddleware, (req, res) => {
  const { title, message, role, userId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required." });
  }
  const n = Notifications.create({
    title,
    message,
    role: role || "All",
    userId: userId || "All",
    read: false,
  });
  return res.status(201).json(n);
});

router.put("/notifications/:id/read", authMiddleware, (req, res) => {
  const updated = Notifications.findByIdAndUpdate(req.params.id, { read: true });
  if (!updated) return res.status(404).json({ message: "Notification not found." });
  return res.json(updated);
});

router.delete("/notifications/:id", authMiddleware, (req, res) => {
  const success = Notifications.findByIdAndDelete(req.params.id);
  if (!success) return res.status(404).json({ message: "Notification not found." });
  return res.json({ message: "Notification deleted." });
});

// ==========================================
// 10. REPORTS MODULE APIs
// ==========================================

// GET /api/reports/dashboard
router.get("/reports/dashboard", authMiddleware, (req, res) => {
  const users = Users.find();
  const students = Students.find();
  const faculty = Faculty.find();
  const branches = Branches.find();
  const subjects = Subjects.find();
  const rooms = Rooms.find();
  const timetables = Timetables.find();

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDay = daysOfWeek[new Date().getDay()];

  const todayClasses = timetables.filter((t) => t.status === "Approved" && t.day === todayDay).length;
  const pendingApprovals = timetables.filter((t) => t.status === "Pending").length;

  return res.json({
    totalUsers: users.length,
    totalStudents: students.length,
    totalFaculty: faculty.length,
    totalBranches: branches.length,
    totalSubjects: subjects.length,
    totalRooms: rooms.length,
    totalTimetables: timetables.length,
    todayClasses,
    pendingApprovals,
  });
});

// GET /api/reports/faculty-workload (Hours or Slots per faculty)
router.get("/reports/faculty-workload", authMiddleware, (req, res) => {
  const facultyList = Faculty.find();
  const approvedSlots = Timetables.find((t) => t.status === "Approved");

  const report = facultyList.map((fac) => {
    const slots = approvedSlots.filter((s) => s.faculty.toLowerCase() === fac.name.toLowerCase());
    return {
      facultyId: fac.id,
      name: fac.name,
      email: fac.email,
      department: fac.department,
      slotsCount: slots.length,
      slots: slots.map((s) => ({
        day: s.day,
        time: s.time,
        subject: s.subject,
        branch: `${s.branch} - ${s.section}`,
      })),
    };
  });

  return res.json(report);
});

// GET /api/reports/room-usage
router.get("/reports/room-usage", authMiddleware, (req, res) => {
  const roomsList = Rooms.find();
  const approvedSlots = Timetables.find((t) => t.status === "Approved");

  const report = roomsList.map((room) => {
    const slots = approvedSlots.filter((s) => s.room === room.roomNumber);
    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      slotsCount: slots.length,
      slots: slots.map((s) => ({
        day: s.day,
        time: s.time,
        subject: s.subject,
        faculty: s.faculty,
        branch: `${s.branch} - ${s.section}`,
      })),
    };
  });

  return res.json(report);
});

// GET /api/reports/branch-wise
router.get("/reports/branch-wise", authMiddleware, (req, res) => {
  const branchesList = Branches.find();
  const timetables = Timetables.find((t) => t.status === "Approved");

  const report = branchesList.map((b) => {
    const slots = timetables.filter(
      (s) => s.branch === b.branchName && s.section === b.section && s.semester === b.semester
    );
    return {
      branchId: b.id,
      branchName: b.branchName,
      section: b.section,
      semester: b.semester,
      academicYear: b.academicYear,
      slotsCount: slots.length,
      slots: slots.map((s) => ({
        day: s.day,
        time: s.time,
        subject: s.subject,
        faculty: s.faculty,
        room: s.room,
      })),
    };
  });

  return res.json(report);
});

// GET /api/reports/classes-per-day
router.get("/reports/classes-per-day", authMiddleware, (req, res) => {
  const approvedSlots = Timetables.find((t) => t.status === "Approved");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const report = days.map((day) => {
    const slots = approvedSlots.filter((s) => s.day === day);
    return {
      day,
      count: slots.length,
      slots: slots.map((s) => ({
        subject: s.subject,
        faculty: s.faculty,
        time: s.time,
        room: s.room,
        branch: `${s.branch} ${s.section}`,
      })),
    };
  });

  return res.json(report);
});

export default router;
