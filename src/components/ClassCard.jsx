import { BookOpen, Clock, MapPin, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge, { getClassDisplayStatus } from "./StatusBadge";

export default function ClassCard({ cls, enrollment, onEnroll }) {
  const status = getClassDisplayStatus(cls);
  const hasActiveEnrollment =
    enrollment?.status === "pending" || enrollment?.status === "approved";
  const seatsLeft = Math.max(0, cls.max_students - cls.current_students);

  return (
    <article className="flex h-full min-h-[350px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="mb-3 flex min-h-[52px] items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/classes/${cls.id}`}
              className="block truncate text-base font-semibold text-slate-950 hover:text-teal-700"
            >
              {cls.class_name}
            </Link>
            <p className="mt-1 truncate text-sm text-slate-500">{cls.teacher_name}</p>
          </div>
          <div className="shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {cls.description}
        </p>

        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{cls.teacher_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{cls.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Phòng {cls.room}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{seatsLeft} chỗ còn lại</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span className={status === "full" ? "font-medium text-rose-700" : ""}>
                {cls.current_students}/{cls.max_students}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-14 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3">
        <Link to={`/classes/${cls.id}`} className="text-sm font-medium text-teal-700 hover:text-teal-800">
          Xem chi tiết
        </Link>
        {hasActiveEnrollment ? (
          <StatusBadge status={enrollment.status} />
        ) : onEnroll ? (
          <button
            type="button"
            onClick={() => onEnroll(cls.id)}
            disabled={status !== "open"}
            className="min-h-9 rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-500"
          >
            Đăng ký
          </button>
        ) : null}
      </div>
    </article>
  );
}
