import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./store/authStore";
import Layout from "./components/Layout";
import AdminCourses from "./pages/AdminCourses";
import AdminUsers from "./pages/AdminUsers";
import CourseDetail from "./pages/CourseDetail";
import CourseEditor from "./pages/CourseEditor";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import LearningNeed from "./pages/LearningNeed";
import Login from "./pages/Login";
import ProcessingLogs from "./pages/ProcessingLogs";
import Recommendations from "./pages/Recommendations";
import Register from "./pages/Register";

function SplashScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { currentUser, booting } = useApp();

  if (booting) return <SplashScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ roles, children }) {
  const { currentUser } = useApp();
  if (!roles.includes(currentUser?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-teal-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Trang không tồn tại</h1>
        <p className="mt-2 text-slate-500">Đường dẫn này không có trong EduMatch Resource.</p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Về tổng quan
        </a>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="classes" element={<Navigate to="/courses" replace />} />
          <Route path="classes/:id" element={<Navigate to="/courses" replace />} />
          <Route path="my-enrollments" element={<Navigate to="/student/recommendations" replace />} />

          <Route
            path="teacher/courses"
            element={
              <RequireRole roles={["teacher", "admin"]}>
                <Courses scope="teacher" />
              </RequireRole>
            }
          />
          <Route
            path="teacher/courses/new"
            element={
              <RequireRole roles={["teacher", "admin"]}>
                <CourseEditor />
              </RequireRole>
            }
          />
          <Route
            path="teacher/courses/:id/edit"
            element={
              <RequireRole roles={["teacher", "admin"]}>
                <CourseEditor />
              </RequireRole>
            }
          />
          <Route
            path="teacher/courses/:id/resources"
            element={
              <RequireRole roles={["teacher", "admin"]}>
                <CourseDetail resourcesOnly />
              </RequireRole>
            }
          />
          <Route
            path="teacher/resources/:resourceId"
            element={
              <RequireRole roles={["teacher", "admin"]}>
                <ProcessingLogs />
              </RequireRole>
            }
          />

          <Route
            path="student/profile"
            element={
              <RequireRole roles={["student"]}>
                <LearningNeed />
              </RequireRole>
            }
          />
          <Route
            path="student/recommendations"
            element={
              <RequireRole roles={["student"]}>
                <Recommendations />
              </RequireRole>
            }
          />

          <Route
            path="admin/courses"
            element={
              <RequireRole roles={["admin"]}>
                <AdminCourses />
              </RequireRole>
            }
          />
          <Route
            path="admin/users"
            element={
              <RequireRole roles={["admin"]}>
                <AdminUsers />
              </RequireRole>
            }
          />
          <Route
            path="admin/processing-logs"
            element={
              <RequireRole roles={["admin"]}>
                <ProcessingLogs />
              </RequireRole>
            }
          />
          <Route path="admin/classes" element={<Navigate to="/admin/courses" replace />} />
          <Route path="admin/enrollments" element={<Navigate to="/admin/processing-logs" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
