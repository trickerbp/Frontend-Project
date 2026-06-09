const statusMap = {
  draft: {
    label: "Bản nháp",
    className: "border-slate-200 bg-slate-100 text-slate-700"
  },
  active: {
    label: "Đang mở",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  archived: {
    label: "Lưu trữ",
    className: "border-slate-200 bg-white text-slate-500"
  },
  beginner: {
    label: "Cơ bản",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700"
  },
  intermediate: {
    label: "Trung cấp",
    className: "border-blue-200 bg-blue-50 text-blue-700"
  },
  advanced: {
    label: "Nâng cao",
    className: "border-violet-200 bg-violet-50 text-violet-700"
  },
  pending: {
    label: "Chờ xử lý",
    className: "border-amber-200 bg-amber-50 text-amber-700"
  },
  processing: {
    label: "Đang xử lý",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700"
  },
  completed: {
    label: "Hoàn tất",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  failed: {
    label: "Lỗi",
    className: "border-rose-200 bg-rose-50 text-rose-700"
  },
  needs_ocr: {
    label: "Cần OCR",
    className: "border-violet-200 bg-violet-50 text-violet-700"
  }
};

export function getCourseStatus(course) {
  return course?.status || "draft";
}

export function getLevel(level) {
  return level || "beginner";
}

export default function StatusBadge({ status, size = "sm" }) {
  const config = statusMap[status] || {
    label: status || "Không rõ",
    className: "border-slate-200 bg-slate-100 text-slate-600"
  };
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex max-w-full whitespace-nowrap rounded-full border font-medium ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function CourseStatusBadge({ status }) {
  return <StatusBadge status={status || "draft"} />;
}

export function LevelBadge({ level }) {
  return <StatusBadge status={level || "beginner"} />;
}

export function ProcessingStatusBadge({ status }) {
  return <StatusBadge status={status || "pending"} />;
}
