import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import CourseCard from "../components/CourseCard";
import EmptyState from "../components/EmptyState";
import { useApp } from "../store/authStore";
import { normalizeText } from "../utils/format";

const levels = [
  { value: "all", label: "Tất cả trình độ" },
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" }
];

const statuses = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang mở" },
  { value: "archived", label: "Lưu trữ" }
];

function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export default function Courses({ scope = "all" }) {
  const {
    courses,
    courseResources,
    currentUser,
    deleteCourse,
    generateRecommendations
  } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [skill, setSkill] = useState("");

  const visibleCourses = useMemo(() => {
    const keyword = normalizeText(search);
    const skillKeyword = normalizeText(skill);
    return courses.filter((course) => {
      const tags = toList(course.manual_tags);
      const skills = toList(course.extracted_skills);
      const haystack = normalizeText(
        `${course.title} ${course.description} ${course.course_code} ${tags.join(" ")} ${skills.join(" ")}`
      );
      const belongsToTeacher =
        currentUser?.role !== "teacher" ||
        !course.teacher_id ||
        course.teacher_id === currentUser.id ||
        course.teacher_name === currentUser.name;
      return (
        (scope !== "teacher" || belongsToTeacher) &&
        (!keyword || haystack.includes(keyword)) &&
        (!skillKeyword || normalizeText(`${tags.join(" ")} ${skills.join(" ")}`).includes(skillKeyword)) &&
        (level === "all" || course.level === level) &&
        (status === "all" || course.status === status)
      );
    });
  }, [courses, currentUser, level, scope, search, skill, status]);

  const handleDelete = async (course) => {
    if (!window.confirm(`Xóa khóa học "${course.title || course.course_code}"?`)) return;
    try {
      await deleteCourse(course.id);
      toast.success("Đã xóa khóa học.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGenerate = async () => {
    try {
      await generateRecommendations();
      toast.success("Đã tạo gợi ý khóa học.");
      navigate("/student/recommendations");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const canCreate = currentUser?.role === "teacher" || currentUser?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">Course catalog</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            {scope === "teacher" ? "Khóa học của tôi" : "Danh sách khóa học"}
          </h1>
          <p className="mt-1 text-slate-500">
            Tra cứu khóa học theo kỹ năng, chủ đề, tag và trạng thái xử lý tài nguyên.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/teacher/courses/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" />
            Tạo khóa học
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, mô tả, mã, kỹ năng..."
              className="input pl-10"
            />
          </div>
          <select value={level} onChange={(event) => setLevel(event.target.value)} className="input">
            {levels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="input">
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              placeholder="Lọc skill/tag"
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {visibleCourses.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Chưa có khóa học phù hợp với bộ lọc."
          action={
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLevel("all");
                setStatus("all");
                setSkill("");
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
            Hiển thị <span className="font-medium text-slate-900">{visibleCourses.length}</span> khóa học
          </p>
          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                resources={courseResources[course.id] || []}
                currentUser={currentUser}
                onDelete={handleDelete}
                onGenerate={handleGenerate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
