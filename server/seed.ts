import bcryptjs from "bcryptjs";
import { Users, Branches, Subjects, Faculty, Students, Rooms, Timetables, Notifications } from "./db.ts";

export async function seedDatabase() {
  console.log("Seeding Database...");

  // Clear existing tables
  Users.clear();
  Branches.clear();
  Subjects.clear();
  Faculty.clear();
  Students.clear();
  Rooms.clear();
  Timetables.clear();
  Notifications.clear();

  // 1. Hash passwords
  const adminPasswordHash = await bcryptjs.hash("admin123", 10);
  const principalPasswordHash = await bcryptjs.hash("principal123", 10);
  const inchargePasswordHash = await bcryptjs.hash("incharge123", 10);
  const facultyPasswordHash = await bcryptjs.hash("faculty123", 10);
  const studentPasswordHash = await bcryptjs.hash("student123", 10);
  const extraFacultyPasswordHash = await bcryptjs.hash("sneha123", 10);

  // 2. Create Users
  const adminUser = Users.create({
    name: "System Admin",
    email: "admin@gmail.com",
    password: adminPasswordHash,
    role: "Admin",
    phone: "9999999999",
    status: "Active",
  });

  const principalUser = Users.create({
    name: "Dr. Prabhakar Rao (Principal)",
    email: "principal@gmail.com",
    password: principalPasswordHash,
    role: "Principal",
    phone: "8888888888",
    status: "Active",
  });

  const inchargeUser = Users.create({
    name: "Prof. Raghav (In-Charge)",
    email: "incharge@gmail.com",
    password: inchargePasswordHash,
    role: "Incharge",
    phone: "7777777777",
    status: "Active",
  });

  const facultyUser = Users.create({
    name: "Dr. Anil Kumar",
    email: "faculty@gmail.com",
    password: facultyPasswordHash,
    role: "Faculty",
    phone: "9876543210",
    status: "Active",
    branch: "CSE",
  });

  const extraFacultyUser = Users.create({
    name: "Prof. Sneha Rao",
    email: "sneha@gmail.com",
    password: extraFacultyPasswordHash,
    role: "Faculty",
    phone: "9876543211",
    status: "Active",
    branch: "CSE",
  });

  const studentUser = Users.create({
    name: "Akhil Reddy",
    email: "student@gmail.com",
    password: studentPasswordHash,
    role: "Student",
    phone: "9123456780",
    branch: "CSE",
    section: "A",
    semester: "3",
    status: "Active",
  });

  console.log("Users Seeded.");

  // 3. Create Branches
  const bCSE = Branches.create({
    branchName: "CSE",
    section: "A",
    semester: "3",
    academicYear: "2026-2027",
  });

  const bAI = Branches.create({
    branchName: "AI",
    section: "A",
    semester: "2",
    academicYear: "2026-2027",
  });

  const bBCom = Branches.create({
    branchName: "B.Com",
    section: "A",
    semester: "4",
    academicYear: "2026-2027",
  });

  const bDS = Branches.create({
    branchName: "DS",
    section: "A",
    semester: "5",
    academicYear: "2026-2027",
  });

  console.log("Branches Seeded.");

  // 4. Create Rooms
  const room101 = Rooms.create({
    roomNumber: "101",
    roomType: "Classroom",
    capacity: 60,
    block: "Block A",
    availability: "Available",
  });

  const room203 = Rooms.create({
    roomNumber: "203",
    roomType: "Classroom",
    capacity: 50,
    block: "Block B",
    availability: "Available",
  });

  const lab1 = Rooms.create({
    roomNumber: "Lab 1",
    roomType: "Computer Lab",
    capacity: 40,
    block: "Tech Center",
    availability: "Available",
  });

  const lab2 = Rooms.create({
    roomNumber: "Lab 2",
    roomType: "Computer Lab",
    capacity: 40,
    block: "Tech Center",
    availability: "Available",
  });

  const semHall = Rooms.create({
    roomNumber: "Seminar Hall",
    roomType: "Seminar Hall",
    capacity: 120,
    block: "Block A",
    availability: "Available",
  });

  console.log("Rooms Seeded.");

  // 5. Create Faculty Profile
  Faculty.create({
    name: "Dr. Anil Kumar",
    email: "faculty@gmail.com",
    phone: "9876543210",
    department: "Computer Science",
    qualification: "Ph.D in AI & ML",
    experience: "12 Years",
    subject: "Web Development",
  });

  Faculty.create({
    name: "Prof. Sneha Rao",
    email: "sneha@gmail.com",
    phone: "9876543211",
    department: "Computer Science",
    qualification: "M.Tech",
    experience: "8 Years",
    subject: "Database Management Systems",
  });

  console.log("Faculty Seeded.");

  // 6. Create Student Profile
  Students.create({
    name: "Akhil Reddy",
    rollNumber: "CS26001",
    email: "student@gmail.com",
    phone: "9123456780",
    branch: "CSE",
    section: "A",
    semester: "3",
  });

  console.log("Students Seeded.");

  // 7. Create Subjects
  const sWebDev = Subjects.create({
    subjectName: "Web Development",
    subjectCode: "CS301",
    branch: "CSE",
    semester: "3",
    faculty: "Dr. Anil Kumar",
    credits: 4,
  });

  const sDBMS = Subjects.create({
    subjectName: "Database Management Systems",
    subjectCode: "CS302",
    branch: "CSE",
    semester: "3",
    faculty: "Prof. Sneha Rao",
    credits: 3,
  });

  const sAIFoundations = Subjects.create({
    subjectName: "Artificial Intelligence Foundations",
    subjectCode: "AI201",
    branch: "AI",
    semester: "2",
    faculty: "Dr. Anil Kumar",
    credits: 4,
  });

  console.log("Subjects Seeded.");

  // 8. Create Timetable records
  // Seed sample timetables for Monday (CSE Section A Semester 3)
  Timetables.create({
    branch: "CSE",
    section: "A",
    semester: "3",
    day: "Monday",
    subject: "Web Development",
    faculty: "Dr. Anil Kumar",
    time: "09:00 AM - 10:30 AM",
    startTime: "09:00",
    endTime: "10:30",
    room: "101",
    classType: "Theory",
    status: "Approved",
    remarks: "Initial setup",
  });

  Timetables.create({
    branch: "CSE",
    section: "A",
    semester: "3",
    day: "Monday",
    subject: "Database Management Systems",
    faculty: "Prof. Sneha Rao",
    time: "10:45 AM - 12:15 PM",
    startTime: "10:45",
    endTime: "12:15",
    room: "Lab 1",
    classType: "Lab",
    status: "Approved",
    remarks: "Initial setup",
  });

  Timetables.create({
    branch: "CSE",
    section: "A",
    semester: "3",
    day: "Tuesday",
    subject: "Web Development",
    faculty: "Dr. Anil Kumar",
    time: "09:00 AM - 10:30 AM",
    startTime: "09:00",
    endTime: "10:30",
    room: "101",
    classType: "Theory",
    status: "Pending",
    remarks: "Pending principal sign-off",
  });

  console.log("Timetables Seeded.");

  // 9. Seed some notifications
  Notifications.create({
    title: "Welcome to Timetable Management System",
    message: "Your account is activated and ready for use.",
    role: "All",
    userId: "All",
    read: false,
  });

  Notifications.create({
    title: "Monday Timetable Released",
    message: "The timetable for CSE Sem 3 on Monday has been approved.",
    role: "Student",
    userId: "All",
    read: false,
  });

  console.log("Notifications Seeded.");
  console.log("Database Seeding Completed Successfully!");
}
