import { Save, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export default function CourseForm({ initialCourse, onSubmit, onExtract, submitting = false, extracting = false }) {
  const initial = useMemo(
    () => ({
      title: initialCourse?.title || initialCourse?.name || "",
      course_code: initialCourse?.course_code || "",
      description: initialCourse?.description || "",
      level: initialCourse?.level || "beginner",
      target_goals: listToText(initialCourse?.target_goals),
      manual_tags: listToText(initialCourse?.manual_tags),
      tools: listToText(initialCourse?.tools),
      duration_hours: initialCourse?.duration_hours || "",
      status: initialCourse?.status || "draft"
    }),
    [initialCourse]
  );
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initial);
  }, [initial]);

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
      tools: textToList(form.tools),
      duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
      status: form.status
    });
  };

  const handleExtract = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onExtract) return;
    setError("");
    try {
      const extracted = await onExtract(file);
      setForm((prev) => ({
        ...prev,
        title: extracted.title || prev.title,
        course_code: prev.course_code || extracted.course_code || "",
        description: extracted.description || prev.description,
        level: extracted.level || prev.level,
        target_goals: listToText(extracted.target_goals),
        manual_tags: listToText(extracted.manual_tags || extracted.extracted_skills),
        tools: listToText(extracted.tools),
        duration_hours: extracted.duration_hours || prev.duration_hours,
        status: prev.status || extracted.status || "draft"
      }));
    } catch {
      setError("Không rút trích được dữ liệu từ file này.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {onExtract && (
          <div className="mb-5 rounded-lg border border-dashed border-teal-200 bg-teal-50 p-4">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-teal-200 hover:bg-teal-100">
              <UploadCloud className="h-4 w-4" />
              {extracting ? "Đang rút trích..." : "Upload tài liệu để tự điền form"}
              <input
                type="file"
                accept=".pdf,.pptx,.docx"
                className="sr-only"
                disabled={extracting}
                onChange={handleExtract}
              />
            </label>
            <p className="mt-2 text-sm text-teal-800">
              Hệ thống sẽ đọc PDF/DOCX/PPTX, điền trước mô tả, trình độ, kỹ năng và mục tiêu. Giảng viên có thể chỉnh lại trước khi lưu.
            </p>
          </div>
        )}
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
          <Field label="Công cụ sử dụng" htmlFor="tools">
            <textarea
              id="tools"
              name="tools"
              rows={3}
              value={form.tools}
              onChange={handleChange}
              className="input resize-none"
              placeholder="VS Code, Git, Figma, Docker, ..."
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
