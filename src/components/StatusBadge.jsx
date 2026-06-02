const statusMap = {
  open: {
    label: "Mở đăng ký",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  closed: {
    label: "Đã đóng",
    className: "border-slate-200 bg-slate-100 text-slate-600"
  },
  full: {
    label: "Đã đầy",
    className: "border-rose-200 bg-rose-50 text-rose-700"
  },
  pending: {
    label: "Chờ duyệt",
    className: "border-amber-200 bg-amber-50 text-amber-700"
  },
  approved: {
    label: "Đã duyệt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  rejected: {
    label: "Từ chối",
    className: "border-rose-200 bg-rose-50 text-rose-700"
  }
};

export function getClassDisplayStatus(cls) {
  if (!cls) return "closed";
  if (cls.status === "open" && cls.current_students >= cls.max_students) return "full";
  return cls.status;
}

export default function StatusBadge({ status, size = "sm" }) {
  const config = statusMap[status] || statusMap.closed;
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border font-medium ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
