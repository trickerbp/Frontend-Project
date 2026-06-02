import { BookOpen, CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatDate, normalizeText, shortId } from "../utils/format";

const filters = [
  { value: "all", label: "Tất cả" },
  { value: "approved", label: "Đã duyệt" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "rejected", label: "Từ chối" }
];

export default function MyEnrollments() {
  const { enrollments, classes } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const findClass = (id) => classes.find((item) => item.id === id);

  const counts = useMemo(
    () => ({
      all: enrollments.length,
      approved: enrollments.filter((item) => item.status === "approved").length,
      pending: enrollments.filter((item) => item.status === "pending").length,
      rejected: enrollments.filter((item) => item.status === "rejected").length
    }),
    [enrollments]
  );

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return enrollments.filter((item) => {
      const cls = findClass(item.class_id);
      const haystack = normalizeText(`${cls?.class_name} ${cls?.teacher_name} ${cls?.room}`);
      return (filter === "all" || item.status === filter) && (!keyword || haystack.includes(keyword));
    });
  }, [enrollments, filter, search, classes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Đăng ký của tôi</h1>
          <p className="mt-1 text-slate-500">
            {counts.approved} đã duyệt, {counts.pending} đang chờ, {counts.rejected} bị từ chối.
          </p>
        </div>
        <Link
          to="/classes"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Đăng ký thêm
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm trong đăng ký..."
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto app-scrollbar">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? "bg-teal-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-800"
              }`}
            >
              {item.label}
              <span className={filter === item.value ? "text-teal-100" : "text-slate-400"}>
                {counts[item.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Không có đăng ký phù hợp."
          action={
            <Link
              to="/classes"
              className="inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Xem lớp học
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Lớp học</th>
                  <th className="px-5 py-3 font-medium">Giảng viên</th>
                  <th className="px-5 py-3 font-medium">Ngày đăng ký</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const cls = findClass(item.class_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link
                          to={`/classes/${item.class_id}`}
                          className="font-medium text-slate-950 hover:text-teal-700"
                        >
                          {cls?.class_name || shortId(item.class_id)}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">{cls?.schedule || "Không có lịch học"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{cls?.teacher_name || "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle className="h-4 w-4" /> Đã được duyệt
                          </span>
                        )}
                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 text-amber-700">
                            <Clock className="h-4 w-4" /> Đợi admin xử lý
                          </span>
                        )}
                        {item.status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 text-rose-700">
                            <XCircle className="h-4 w-4" /> Không được duyệt
                          </span>
                        )}
                        {item.note && <p className="mt-1 max-w-xs truncate text-slate-500">{item.note}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
