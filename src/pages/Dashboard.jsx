import { Activity, AlertCircle, BookOpen, CheckCircle, FileText, Sparkles, Target, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import RecommendationList from "../components/RecommendationList";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatDate } from "../utils/format";

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

function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export default function Dashboard() {
  const {
    currentUser,
    courses,
    courseResources,
    studentProfile,
    recommendations,
    processingLogs,
    lastError
  } = useApp();

  const allResources = Object.values(courseResources).flat();
  const completedResources = allResources.filter((item) => (item.processing_status || item.status) === "completed");
  const issueResources = allResources.filter((item) =>
    ["pending", "processing", "failed", "needs_ocr"].includes(item.processing_status || item.status)
  );
  const activeCourses = courses.filter((course) => course.status === "active");
  const teacherCourses = courses.filter(
    (course) =>
      currentUser.role !== "teacher" ||
      !course.teacher_id ||
      course.teacher_id === currentUser.id ||
      course.teacher_name === currentUser.name
  );

  const roleLabel = {
    admin: "Admin workspace",
    teacher: "Teacher workspace",
    student: "Student workspace"
  }[currentUser.role];

  const intro = {
    admin: "Theo dõi khóa học, trạng thái xử lý tài nguyên và dữ liệu vận hành.",
    teacher: "Quản lý khóa học, upload tài nguyên và kích hoạt xử lý nội dung.",
    student: "Cập nhật hồ sơ học tập và nhận gợi ý khóa học phù hợp."
  }[currentUser.role];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">{roleLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Xin chào, {currentUser.name}</h1>
          <p className="mt-1 text-slate-500">{intro}</p>
        </div>
        <RoleActions role={currentUser.role} />
      </div>

      {lastError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {lastError}
        </div>
      )}

      {currentUser.role === "admin" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Tổng khóa học" value={courses.length} tone="teal" />
            <StatCard icon={CheckCircle} label="Khóa học active" value={activeCourses.length} tone="cyan" />
            <StatCard icon={FileText} label="Tài nguyên đã xử lý" value={completedResources.length} tone="amber" />
            <StatCard icon={AlertCircle} label="Chờ xử lý/lỗi" value={issueResources.length} tone="rose" />
          </div>
          <RecentCourses courses={courses} title="Khóa học gần đây" />
          <ProcessingLogs logs={processingLogs} />
        </>
      )}

      {currentUser.role === "teacher" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Khóa học của tôi" value={teacherCourses.length} tone="teal" />
            <StatCard icon={UploadCloud} label="Tài nguyên đã upload" value={allResources.length} tone="cyan" />
            <StatCard icon={CheckCircle} label="Đã xử lý" value={completedResources.length} tone="amber" />
            <StatCard icon={AlertCircle} label="Cần xử lý/lỗi" value={issueResources.length} tone="rose" />
          </div>
          <RecentCourses courses={teacherCourses.filter((course) => !course.resource_count)} title="Khóa học cần bổ sung tài nguyên" />
          <ResourceSummary resources={allResources} />
        </>
      )}

      {currentUser.role === "student" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Khóa học khả dụng" value={activeCourses.length} tone="teal" />
            <StatCard icon={Target} label="Hồ sơ học tập" value={studentProfile ? "Đã có" : "Chưa có"} tone="cyan" />
            <StatCard icon={Sparkles} label="Gợi ý đã tạo" value={recommendations.length} tone="amber" />
            <StatCard icon={CheckCircle} label="Kỹ năng mục tiêu" value={toList(studentProfile?.desired_skills).length} tone="rose" />
          </div>
          <StudentProfileSummary profile={studentProfile} />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-950">Top gợi ý khóa học</h2>
              <Link to="/student/recommendations" className="text-sm font-medium text-teal-700 hover:text-teal-800">
                Xem tất cả
              </Link>
            </div>
            {recommendations.length ? (
              <RecommendationList recommendations={recommendations.slice(0, 3)} courses={courses} />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                Chưa có gợi ý. Cập nhật hồ sơ để tạo recommendation đầu tiên.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function RoleActions({ role }) {
  if (role === "teacher") {
    return (
      <div className="flex flex-wrap gap-2">
        <Link to="/teacher/courses/new" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          Tạo khóa học
        </Link>
        <Link to="/teacher/courses" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Upload tài nguyên
        </Link>
      </div>
    );
  }
  if (role === "student") {
    return (
      <div className="flex flex-wrap gap-2">
        <Link to="/student/profile" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          Cập nhật hồ sơ
        </Link>
        <Link to="/student/recommendations" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Tạo gợi ý mới
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/admin/courses" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
        Xem khóa học
      </Link>
      <Link to="/admin/processing-logs" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Kiểm tra log xử lý
      </Link>
    </div>
  );
}

function RecentCourses({ courses, title }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">{title}</h2>
      </div>
      {courses.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Chưa có dữ liệu khóa học.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {courses.slice(0, 5).map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="grid gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-950">{course.title || course.course_code}</p>
                <p className="truncate text-sm text-slate-500">{course.description || "Chưa có mô tả"}</p>
              </div>
              <StatusBadge status={course.status || "draft"} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ProcessingLogs({ logs }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Activity className="h-4 w-4 text-slate-400" />
        <h2 className="font-semibold text-slate-950">Processing logs gần đây</h2>
      </div>
      {logs.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Backend chưa cung cấp log xử lý hoặc chưa có log.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id || log.created_at} className="px-5 py-4 text-sm text-slate-600">
              <span className="font-medium text-slate-950">{log.message || log.action || "Log xử lý"}</span>
              <span className="ml-2 text-slate-400">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ResourceSummary({ resources }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">Tài nguyên mới upload</h2>
      </div>
      {resources.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Chưa có tài nguyên trong workspace hiện tại.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {resources.slice(0, 5).map((resource) => (
            <div key={resource.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <p className="truncate text-sm font-medium text-slate-950">{resource.file_name || resource.name}</p>
              <StatusBadge status={resource.processing_status || resource.status || "pending"} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StudentProfileSummary({ profile }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Hồ sơ học tập của bạn</h2>
      {profile ? (
        <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <p><span className="font-medium text-slate-900">Mục tiêu:</span> {profile.career_goal || "-"}</p>
          <p><span className="font-medium text-slate-900">Trình độ:</span> {profile.current_level || "-"}</p>
          <p><span className="font-medium text-slate-900">Giờ/tuần:</span> {profile.hours_per_week || "-"}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Bạn chưa tạo hồ sơ học tập.</p>
      )}
    </section>
  );
}
