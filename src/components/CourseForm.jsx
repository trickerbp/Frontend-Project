import { Save } from "lucide-react";
import { useMemo, useState } from "react";

function listToText(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

function textToList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CourseForm({ initialCourse, onSubmit, submitting = false }) {
  const initial = useMemo(
    () => ({
      title: initialCourse?.title || initialCourse?.name || "",
      course_code: initialCourse?.course_code || "",
      description: initialCourse?.description || "",
      level: initialCourse?.level || "beginner",
      target_goals: listToText(initialCourse?.target_goals),
      manual_tags: listToText(initialCourse?.manual_tags),
      duration_hours: initialCourse?.duration_hours || "",
      status: initialCourse?.status || "draft"
    }),
    [initialCourse]
  );
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Vui lòng nhập tên khóa học.");
      return;
    }
    if (!form.course_code.trim()) {
      setError("Vui lòng nhập mã khóa học.");
      return;
    }

    onSubmit({
      title: form.title.trim(),
      course_code: form.course_code.trim(),
      description: form.description.trim(),
      level: form.level,
      target_goals: textToList(form.target_goals),
      manual_tags: textToList(form.manual_tags),
      duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
      status: form.status
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tên khóa học" htmlFor="title">
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              placeholder="Ví dụ: Data Analysis Foundation"
            />
          </Field>
          <Field label="Mã khóa học" htmlFor="course_code">
            <input
              id="course_code"
              name="course_code"
              value={form.course_code}
              onChange={handleChange}
              className="input"
              placeholder="DA101"
            />
          </Field>
          <Field label="Trình độ" htmlFor="level">
            <select id="level" name="level" value={form.level} onChange={handleChange} className="input">
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </Field>
          <Field label="Trạng thái" htmlFor="status">
            <select id="status" name="status" value={form.status} onChange={handleChange} className="input">
              <option value="draft">Bản nháp</option>
              <option value="active">Đang mở</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </Field>
          <Field label="Thời lượng (giờ)" htmlFor="duration_hours">
            <input
              id="duration_hours"
              name="duration_hours"
              type="number"
              min="0"
              value={form.duration_hours}
              onChange={handleChange}
              className="input"
              placeholder="24"
            />
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Mô tả" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="input resize-none"
              placeholder="Tóm tắt nội dung, đối tượng học và kết quả mong đợi."
            />
          </Field>
          <Field label="Mục tiêu nghề nghiệp" htmlFor="target_goals">
            <textarea
              id="target_goals"
              name="target_goals"
              rows={3}
              value={form.target_goals}
              onChange={handleChange}
              className="input resize-none"
              placeholder="Data Analyst, Business Intelligence, ..."
            />
          </Field>
          <Field label="Tag thủ công" htmlFor="manual_tags">
            <textarea
              id="manual_tags"
              name="manual_tags"
              rows={3}
              value={form.manual_tags}
              onChange={handleChange}
              className="input resize-none"
              placeholder="python, excel, dashboard, ..."
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Đang lưu..." : "Lưu khóa học"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
