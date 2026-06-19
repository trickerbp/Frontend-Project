import { BookOpen, Clock, FileText, Tags, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge, { CourseStatusBadge, LevelBadge } from "./StatusBadge";

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function TagList({ items, limit = 5 }) {
  const visible = items.slice(0, limit);
  const extra = Math.max(0, items.length - visible.length);

  if (!items.length) return <span className="text-sm text-slate-400">Chưa có tag</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item) => (
        <span
          key={item}
          className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
        >
          {item}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500">
          +{extra}
        </span>
      )}
    </div>
  );
}

export default function CourseCard({ course, resources = [], currentUser, onDelete, onGenerate }) {
  const tags = toList(course.manual_tags);
  const skills = toList(course.extracted_skills);
  const canManage = currentUser?.role === "admin" || currentUser?.role === "teacher";

  return (
    <article className="flex h-full min-h-[360px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex min-h-[58px] items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/courses/${course.id}`}
              className="line-clamp-2 text-base font-semibold leading-6 text-slate-950 hover:text-teal-700"
            >
              {course.title || course.name || "Khóa học chưa đặt tên"}
            </Link>
            <p className="mt-1 truncate text-sm text-slate-500">{course.course_code || "Chưa có mã"}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <CourseStatusBadge status={course.status} />
            <LevelBadge level={course.level} />
          </div>
        </div>

        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {course.description || "Chưa có mô tả khóa học."}
        </p>

        <div className="mt-5 grid gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">
              {course.teacher_name || course.instructor || course.teacher_id || "Chưa gán giảng viên"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{course.duration_hours ? `${course.duration_hours} giờ` : "Chưa cập nhật thời lượng"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{resources.length || course.resource_count || 0} tài nguyên</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
              <Tags className="h-3.5 w-3.5" />
              Tag
            </div>
            <TagList items={tags} />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
              <BookOpen className="h-3.5 w-3.5" />
              Kỹ năng
            </div>
            <TagList items={skills} limit={4} />
          </div>
        </div>
      </div>

      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
        <Link to={`/courses/${course.id}`} className="text-sm font-medium text-teal-700 hover:text-teal-800">
          Xem chi tiết
        </Link>
        <div className="flex flex-wrap justify-end gap-2">
          {currentUser?.role === "student" && (
            <button
              type="button"
              onClick={() => onGenerate?.()}
              className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              Tạo gợi ý
            </button>
          )}
          {canManage && (
            <>
              <Link
                to={`/teacher/courses/${course.id}/edit`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Chỉnh sửa
              </Link>
              <Link
                to={`/teacher/courses/${course.id}/resources`}
                className="rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-sm font-medium text-cyan-700 hover:bg-cyan-50"
              >
                Tài nguyên
              </Link>
              <button
                type="button"
                onClick={() => onDelete?.(course)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                Xóa
              </button>
            </>
          )}
          {!course.status && <StatusBadge status="draft" />}
        </div>
      </div>
    </article>
  );
}
