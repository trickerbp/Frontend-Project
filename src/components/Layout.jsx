import {
  Activity,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Target,
  UploadCloud,
  UserRound,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useApp } from "../store/authStore";

const roleLabels = {
  admin: "Quản trị viên",
  teacher: "Giảng viên",
  student: "Học viên"
};

function NavItem({ to, icon: Icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { currentUser, dataLoading, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const nav = (
    <>
      <NavItem to="/dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)}>
        Tổng quan
      </NavItem>
      {currentUser?.role === "student" && (
      <NavItem to="/courses" icon={BookOpen} onClick={() => setOpen(false)}>
        Khóa học
      </NavItem>
      )}
      {currentUser?.role === "teacher" && (
        <>
          <NavItem to="/teacher/courses" icon={UploadCloud} onClick={() => setOpen(false)}>
            Khóa học của tôi
          </NavItem>
        </>
      )}
      {currentUser?.role === "student" && (
        <>
          <NavItem to="/student/profile" icon={Target} onClick={() => setOpen(false)}>
            Hồ sơ học tập
          </NavItem>
          <NavItem to="/student/recommendations" icon={ListChecks} onClick={() => setOpen(false)}>
            Gợi ý khóa học
          </NavItem>
        </>
      )}
      {currentUser?.role === "admin" && (
        <>
          <NavItem to="/admin/courses" icon={FileText} onClick={() => setOpen(false)}>
            Quản lý khóa học
          </NavItem>
          <NavItem to="/admin/processing-logs" icon={Activity} onClick={() => setOpen(false)}>
            Nhật ký xử lý
          </NavItem>
          <NavItem to="/admin/users" icon={Users} onClick={() => setOpen(false)}>
            Người dùng
          </NavItem>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-transparent">
      <Toaster richColors position="top-right" />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Mở menu"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-700 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="truncate text-base font-semibold text-slate-950">EduMatch Resource</span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">{nav}</nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-44 truncate text-sm font-medium text-slate-950">
                {currentUser?.name}
              </p>
              <p className="text-xs text-slate-500">{roleLabels[currentUser?.role] || "Người dùng"}</p>
            </div>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-50 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100">
              <UserRound className="h-4 w-4" />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
        {dataLoading && <div className="h-0.5 animate-pulse bg-teal-600" />}
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-80 max-w-[86vw] bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-700 text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="font-semibold text-slate-950">EduMatch Resource</span>
              </div>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">{nav}</nav>
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
