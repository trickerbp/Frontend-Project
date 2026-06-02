import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge, { getClassDisplayStatus } from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatDate, shortId } from "../utils/format";

function StatCard({ icon: Icon, label, value, tone }) {
  const toneMap = {
    teal: "bg-teal-50 text-teal-700",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 grid h-10 w-10 place-items-center rounded-lg ${toneMap[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, classes, enrollments, students, lastError } = useApp();

  const openClasses = classes.filter((cls) => getClassDisplayStatus(cls) === "open");
  const pendingEnrollments = enrollments.filter((item) => item.status === "pending");
  const approvedEnrollments = enrollments.filter((item) => item.status === "approved");
  const rejectedEnrollments = enrollments.filter((item) => item.status === "rejected");
  const findClass = (id) => classes.find((item) => item.id === id);
  const findStudent = (id) => students.find((item) => item.id === id);

  if (currentUser.role === "admin") {
    const recent = pendingEnrollments.slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-teal-700">Admin workspace</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              Xin chào, {currentUser.name}
            </h1>
            <p className="mt-1 text-slate-500">Theo dõi lớp học và duyệt đăng ký đang chờ xử lý.</p>
          </div>
          <Link
            to="/admin/classes"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Quản lý lớp
          </Link>
        </div>

        {lastError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {lastError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Tổng lớp" value={classes.length} tone="teal" />
          <StatCard icon={CheckCircle} label="Đang mở" value={openClasses.length} tone="cyan" />
          <StatCard icon={ClipboardCheck} label="Tổng đăng ký" value={enrollments.length} tone="amber" />
          <StatCard icon={AlertCircle} label="Chờ duyệt" value={pendingEnrollments.length} tone="rose" />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Đăng ký chờ duyệt</h2>
            <Link to="/admin/enrollments" className="text-sm font-medium text-teal-700 hover:text-teal-800">
              Xem tất cả
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Không có đăng ký nào đang chờ duyệt.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((item) => {
                const cls = findClass(item.class_id);
                const student = findStudent(item.student_id);
                return (
                  <div
                    key={item.id}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">
                        {student?.name || `Sinh viên ${shortId(item.student_id)}`}
                      </p>
                      <p className="truncate text-sm text-slate-500">{cls?.class_name || shortId(item.class_id)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-slate-400 sm:inline">
                        {formatDate(item.created_at)}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  const recent = enrollments.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">Student workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Xin chào, {currentUser.name}
          </h1>
          <p className="mt-1 text-slate-500">Xem lớp đang mở và theo dõi trạng thái đăng ký của bạn.</p>
        </div>
        <Link
          to="/classes"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Xem lớp học
        </Link>
      </div>

      {lastError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {lastError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Tổng đăng ký" value={enrollments.length} tone="teal" />
        <StatCard icon={CheckCircle} label="Đã duyệt" value={approvedEnrollments.length} tone="cyan" />
        <StatCard icon={Clock} label="Chờ duyệt" value={pendingEnrollments.length} tone="amber" />
        <StatCard icon={BookOpen} label="Lớp đang mở" value={openClasses.length} tone="rose" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-950">Đăng ký gần đây</h2>
          <Link to="/my-enrollments" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            Xem tất cả
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Bạn chưa đăng ký lớp học nào.
            <div className="mt-4">
              <Link
                to="/classes"
                className="inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Khám phá lớp học
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((item) => {
              const cls = findClass(item.class_id);
              return (
                <div
                  key={item.id}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {cls?.class_name || shortId(item.class_id)}
                    </p>
                    <p className="truncate text-sm text-slate-500">{cls?.schedule || "Lịch học đang cập nhật"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      {formatDate(item.created_at)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {rejectedEnrollments.length > 0 && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{rejectedEnrollments.length} đăng ký bị từ chối</p>
          </div>
          <Link to="/my-enrollments" className="mt-2 inline-flex text-sm font-medium text-rose-700 hover:text-rose-900">
            Xem chi tiết
          </Link>
        </section>
      )}
    </div>
  );
}
