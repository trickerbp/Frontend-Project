import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./store/authStore";
import Layout from "./components/Layout";
import AdminCourses from "./pages/AdminCourses";
import AdminEnrollments from "./pages/AdminEnrollments";
import CourseDetail from "./pages/CourseDetail";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MyEnrollments from "./pages/MyEnrollments";
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

function RequireAdmin({ children }) {
  const { currentUser } = useApp();

  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-teal-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Trang không tồn tại</h1>
        <p className="mt-2 text-slate-500">Đường dẫn này không có trong ClassEnroll Mini.</p>
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
          <Route path="classes" element={<Courses />} />
          <Route path="classes/:id" element={<CourseDetail />} />
          <Route path="my-enrollments" element={<MyEnrollments />} />
          <Route
            path="admin/classes"
            element={
              <RequireAdmin>
                <AdminCourses />
              </RequireAdmin>
            }
          />
          <Route
            path="admin/enrollments"
            element={
              <RequireAdmin>
                <AdminEnrollments />
              </RequireAdmin>
            }
          />
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
