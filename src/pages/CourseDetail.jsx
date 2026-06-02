import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquareText,
  User,
  Users,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import StatusBadge, { getClassDisplayStatus } from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatDate } from "../utils/format";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classes, enrollments, currentUser, enrollClass } = useApp();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const cls = classes.find((item) => item.id === id);
  const enrollment = useMemo(
    () => enrollments.find((item) => item.class_id === id),
    [enrollments, id]
  );

  if (!cls) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Không tìm thấy lớp học.</p>
        <Link to="/classes" className="mt-4 inline-flex font-medium text-teal-700 hover:text-teal-800">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const status = getClassDisplayStatus(cls);
  const fillPercent = Math.min(
    100,
    Math.round((cls.current_students / Math.max(1, cls.max_students)) * 100)
  );

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await enrollClass(cls.id, note);
      toast.success("Đăng ký thành công. Yêu cầu đang chờ admin duyệt.");
      setNote("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const canEnroll = currentUser.role === "student" && !enrollment && status === "open";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-teal-300">Chi tiết lớp học</p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">{cls.class_name}</h1>
              <p className="mt-2 text-slate-300">{cls.description}</p>
            </div>
            <StatusBadge status={status} size="md" />
          </div>
        </header>

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={User} label="Giảng viên" value={cls.teacher_name} />
              <InfoItem icon={Clock} label="Lịch học" value={cls.schedule} />
              <InfoItem icon={MapPin} label="Phòng học" value={`Phòng ${cls.room}`} />
              <InfoItem icon={Calendar} label="Ngày tạo" value={formatDate(cls.created_at)} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>
                    Sĩ số {cls.current_students}/{cls.max_students}
                  </span>
                </div>
                <span className="font-medium text-slate-700">{fillPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    fillPercent >= 100 ? "bg-rose-500" : fillPercent >= 80 ? "bg-amber-500" : "bg-teal-600"
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            {currentUser.role === "student" && (
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h2 className="font-semibold text-slate-950">Trạng thái đăng ký</h2>

                {enrollment ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={enrollment.status} />
                      <span className="text-sm text-slate-500">
                        Ngày đăng ký {formatDate(enrollment.created_at)}
                      </span>
                    </div>
                    {enrollment.status === "approved" && (
                      <p className="flex items-center gap-2 text-sm text-emerald-700">
                        <CheckCircle className="h-4 w-4" />
                        Admin đã duyệt đăng ký này.
                      </p>
                    )}
                    {enrollment.status === "rejected" && (
                      <p className="flex items-center gap-2 text-sm text-rose-700">
                        <XCircle className="h-4 w-4" />
                        Đăng ký đã bị từ chối. Backend hiện không cho đăng ký lại cùng lớp.
                      </p>
                    )}
                    {enrollment.note && (
                      <p className="rounded-lg bg-white p-3 text-sm text-slate-600">
                        Ghi chú của bạn: {enrollment.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <label htmlFor="note" className="block text-sm font-medium text-slate-700">
                      Ghi chú cho admin
                    </label>
                    <textarea
                      id="note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder="Ví dụ: Em muốn đăng ký lớp này để bổ sung kiến thức nền tảng."
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={!canEnroll || loading}
                      className="min-h-11 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
                    >
                      {loading ? "Đang gửi..." : status === "open" ? "Đăng ký lớp học" : "Không thể đăng ký"}
                    </button>
                  </div>
                )}
              </section>
            )}
          </section>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-semibold text-slate-950">Tóm tắt</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Trạng thái" value={<StatusBadge status={status} />} />
              <SummaryRow label="Còn lại" value={`${Math.max(0, cls.max_students - cls.current_students)} chỗ`} />
              <SummaryRow label="Cập nhật" value={formatDate(cls.updated_at)} />
              <SummaryRow label="ID lớp" value={cls.id} wrap />
            </dl>
          </aside>
        </div>
      </article>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-900">{value || "-"}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, wrap = false }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right font-medium text-slate-900 ${wrap ? "break-all" : ""}`}>{value || "-"}</dd>
    </div>
  );
}
