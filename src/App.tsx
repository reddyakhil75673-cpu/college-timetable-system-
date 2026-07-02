import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PrincipalDashboard } from "./pages/PrincipalDashboard";
import { InchargeDashboard } from "./pages/InchargeDashboard";
import { FacultyDashboard } from "./pages/FacultyDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { Users } from "./pages/Users";
import { Branches } from "./pages/Branches";
import { Subjects } from "./pages/Subjects";
import { Faculty } from "./pages/Faculty";
import { Students } from "./pages/Students";
import { Rooms } from "./pages/Rooms";
import { AddTimetable } from "./pages/AddTimetable";
import { ViewTimetable } from "./pages/ViewTimetable";
import { EditTimetable } from "./pages/EditTimetable";
import { Approvals } from "./pages/Approvals";
import { Reports } from "./pages/Reports";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";

export default function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/login" replace />} />

            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="principal/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Principal"]}>
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="incharge/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Incharge"]}>
                  <InchargeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Faculty"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="faculty/timetable"
              element={
                <ProtectedRoute allowedRoles={["Faculty"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="student/timetable"
              element={
                <ProtectedRoute allowedRoles={["Student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="branches"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Incharge"]}>
                  <Branches />
                </ProtectedRoute>
              }
            />

            <Route
              path="subjects"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Incharge"]}>
                  <Subjects />
                </ProtectedRoute>
              }
            />

            <Route
              path="faculty"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <Faculty />
                </ProtectedRoute>
              }
            />

            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <Students />
                </ProtectedRoute>
              }
            />

            <Route
              path="rooms"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Incharge"]}>
                  <Rooms />
                </ProtectedRoute>
              }
            />

            <Route
              path="timetables"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Principal", "Incharge"]}>
                  <ViewTimetable />
                </ProtectedRoute>
              }
            />

            <Route
              path="add-timetable"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Incharge"]}>
                  <AddTimetable />
                </ProtectedRoute>
              }
            />

            <Route
              path="edit-timetable/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Incharge"]}>
                  <EditTimetable />
                </ProtectedRoute>
              }
            />

            <Route
              path="approvals"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Principal"]}>
                  <Approvals />
                </ProtectedRoute>
              }
            />

            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Principal"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}