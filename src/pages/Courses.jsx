import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ClassCard from "../components/ClassCard";
import EmptyState from "../components/EmptyState";
import { getClassDisplayStatus } from "../components/StatusBadge";
import { getErrorMessage } from "../api/axiosClient";
import { useApp } from "../store/authStore";
import { normalizeText } from "../utils/format";

const filters = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Mở đăng ký" },
  { value: "full", label: "Đã đầy" },
  { value: "closed", label: "Đã đóng" }
];

export default function Courses() {
  const { classes, enrollments, currentUser, enrollClass } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [submittingId, setSubmittingId] = useState("");

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return classes.filter((cls) => {
      const status = getClassDisplayStatus(cls);
      const haystack = normalizeText(
        `${cls.class_name} ${cls.teacher_name} ${cls.room} ${cls.schedule}`
      );
      return (!keyword || haystack.includes(keyword)) && (filter === "all" || status === filter);
    });
  }, [classes, filter, search]);

  const getEnrollment = (classId) => enrollments.find((item) => item.class_id === classId);

  const handleEnroll = async (classId) => {
    setSubmittingId(classId);
    try {
      await enrollClass(classId);
      toast.success("Đăng ký thành công. Yêu cầu đang chờ admin duyệt.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-950">Danh sách lớp học</h1>
        <p className="text-slate-500">Tìm lớp theo tên, giảng viên, lịch học hoặc phòng học.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm lớp học..."
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto app-scrollbar">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="flex gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`min-h-10 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === item.value
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy lớp học phù hợp."
          action={
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-900">{filtered.length}</span> lớp học
          </p>
          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((cls) => (
              <div
                key={cls.id}
                className={`h-full ${submittingId === cls.id ? "pointer-events-none opacity-70" : ""}`}
              >
                <ClassCard
                  cls={cls}
                  enrollment={getEnrollment(cls.id)}
                  onEnroll={currentUser.role === "student" ? handleEnroll : undefined}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
