import { CheckCircle, Filter, Search, Users, X, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatDate, normalizeText, shortId } from "../utils/format";

const filters = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" }
];

export default function AdminEnrollments() {
  const { enrollments, classes, students, approveEnrollment, rejectEnrollment } = useApp();
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [confirmReject, setConfirmReject] = useState(null);
  const [processingId, setProcessingId] = useState("");

  const findClass = (id) => classes.find((item) => item.id === id);
  const findStudent = (id) => students.find((item) => item.id === id);

  const counts = useMemo(
    () => ({
      all: enrollments.length,
      pending: enrollments.filter((item) => item.status === "pending").length,
      approved: enrollments.filter((item) => item.status === "approved").length,
      rejected: enrollments.filter((item) => item.status === "rejected").length
    }),
    [enrollments]
  );

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return enrollments.filter((item) => {
      const cls = findClass(item.class_id);
      const student = findStudent(item.student_id);
      const haystack = normalizeText(
        `${cls?.class_name} ${cls?.teacher_name} ${student?.name} ${student?.email} ${item.student_id}`
      );
      return (filter === "all" || item.status === filter) && (!keyword || haystack.includes(keyword));
    });
  }, [classes, enrollments, filter, search, students]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveEnrollment(id);
      toast.success("Đã duyệt đăng ký.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async () => {
    if (!confirmReject) return;
    setProcessingId(confirmReject.id);
    try {
      await rejectEnrollment(confirmReject.id);
      toast.success("Đã từ chối đăng ký.");
      setConfirmReject(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Duyệt đăng ký lớp học</h1>
        <p className="mt-1 text-slate-500">
          {counts.pending} đăng ký chờ duyệt trên tổng {counts.all} đăng ký.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo sinh viên, email, lớp học..."
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
              <Filter className="h-3.5 w-3.5" />
              {item.label}
              <span className={filter === item.value ? "text-teal-100" : "text-slate-400"}>
                {counts[item.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Không có đăng ký phù hợp." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Sinh viên</th>
                  <th className="px-5 py-3 font-medium">Lớp học</th>
                  <th className="px-5 py-3 font-medium">Ngày đăng ký</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const cls = findClass(item.class_id);
                  const student = findStudent(item.student_id);
                  const disabled = processingId === item.id;

                  return (
                    <tr key={item.id} className={disabled ? "bg-slate-50 opacity-70" : "hover:bg-slate-50"}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">
                          {student?.name || `Sinh viên ${shortId(item.student_id)}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{student?.email || item.student_id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-950">{cls?.class_name || shortId(item.class_id)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {cls ? `${cls.teacher_name} · Phòng ${cls.room}` : "Không tìm thấy lớp"}
                        </p>
                        {item.note && (
                          <p className="mt-2 max-w-md truncate rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-500">
                            Ghi chú: {item.note}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4">
                        {item.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => handleApprove(item.id)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Duyệt
                            </button>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => setConfirmReject(item)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                            >
                              <XCircle className="h-4 w-4" />
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">Cập nhật {formatDate(item.updated_at)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmReject && (
        <RejectModal
          enrollment={confirmReject}
          student={findStudent(confirmReject.student_id)}
          cls={findClass(confirmReject.class_id)}
          onCancel={() => setConfirmReject(null)}
          onConfirm={handleReject}
          loading={processingId === confirmReject.id}
        />
      )}
    </div>
  );
}

function RejectModal({ enrollment, student, cls, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Từ chối đăng ký?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Backend sẽ chuyển trạng thái sang rejected cho yêu cầu này.
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onCancel}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-950">
            {student?.name || `Sinh viên ${shortId(enrollment.student_id)}`}
          </p>
          <p className="mt-1 text-slate-500">{cls?.class_name || shortId(enrollment.class_id)}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="min-h-10 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:bg-slate-300"
          >
            {loading ? "Đang xử lý..." : "Từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}
