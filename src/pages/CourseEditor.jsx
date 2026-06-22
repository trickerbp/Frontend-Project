import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import CourseForm from "../components/CourseForm";
import EmptyState from "../components/EmptyState";
import { useApp } from "../store/authStore";
import { useState } from "react";

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, createCourse, updateCourse, extractCourseDraft, currentUser } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const editing = Boolean(id);
  const course = courses.find((item) => item.id === id);
  const listPath = currentUser?.role === "teacher" ? "/teacher/courses" : "/courses";

  if (editing && !course) {
    return (
      <EmptyState
        title="Không tìm thấy khóa học để chỉnh sửa."
        action={
          <Link to={listPath} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white">
            Quay lại danh sách
          </Link>
        }
      />
    );
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const saved = editing ? await updateCourse(id, payload) : await createCourse(payload);
      toast.success(editing ? "Đã cập nhật khóa học." : "Đã tạo khóa học.");
      navigate(`/courses/${saved.id || id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtract = async (file) => {
    setExtracting(true);
    try {
      const extracted = await extractCourseDraft(file);
      toast.success("Đã rút trích dữ liệu khóa học. Bạn có thể chỉnh lại trước khi lưu.");
      return extracted;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link
        to={editing ? `/courses/${id}` : listPath}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>
      <div>
        <p className="text-sm font-medium text-teal-700">Course builder</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
          {editing ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
        </h1>
      </div>
      <CourseForm
        initialCourse={course}
        onSubmit={handleSubmit}
        onExtract={handleExtract}
        submitting={submitting}
        extracting={extracting}
      />
    </div>
  );
}
