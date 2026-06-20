import { Save, Sparkles, UploadCloud } from "lucide-react";
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

export default function LearningNeedForm({ profile, onSubmit, onGenerate, onExtract, saving, generating, extracting = false }) {
  const initial = useMemo(
    () => ({
      career_goal: profile?.career_goal || "",
      current_level: profile?.current_level || "beginner",
      current_skills: listToText(profile?.current_skills),
      desired_skills: listToText(profile?.desired_skills),
      interested_topics: listToText(profile?.interested_topics),
      hours_per_week: profile?.hours_per_week || "",
      learning_format: profile?.learning_format || "online"
    }),
    [profile]
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
    if (!form.career_goal.trim()) {
      setError("Vui lòng nhập mục tiêu học tập hoặc nghề nghiệp.");
      return;
    }
    onSubmit({
      career_goal: form.career_goal.trim(),
      current_level: form.current_level,
      current_skills: textToList(form.current_skills),
      desired_skills: textToList(form.desired_skills),
      interested_topics: textToList(form.interested_topics),
      hours_per_week: form.hours_per_week ? Number(form.hours_per_week) : null,
      learning_format: form.learning_format
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
        career_goal: extracted.career_goal || prev.career_goal,
        current_level: extracted.current_level || prev.current_level,
        current_skills: listToText(extracted.current_skills),
        desired_skills: listToText(extracted.desired_skills),
        interested_topics: listToText(extracted.interested_topics),
        hours_per_week: extracted.hours_per_week || prev.hours_per_week,
        learning_format: extracted.learning_format || prev.learning_format
      }));
    } catch {
      setError("Không rút trích được hồ sơ từ file này.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {onExtract && (
          <div className="mb-5 rounded-lg border border-dashed border-teal-200 bg-teal-50 p-4">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-teal-200 hover:bg-teal-100">
              <UploadCloud className="h-4 w-4" />
              {extracting ? "Đang rút trích..." : "Upload hồ sơ/CV để tự điền form"}
              <input
                type="file"
                accept=".pdf,.pptx,.docx"
                className="sr-only"
                disabled={extracting}
                onChange={handleExtract}
              />
            </label>
            <p className="mt-2 text-sm text-teal-800">
              Hệ thống sẽ đọc file, điền trước mục tiêu, kỹ năng, chủ đề quan tâm và cách học. Bạn có thể chỉnh lại rồi tạo gợi ý.
            </p>
          </div>
        )}
        <h2 className="text-base font-semibold text-slate-950">Mục tiêu</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Mục tiêu nghề nghiệp" htmlFor="career_goal">
            <textarea
              id="career_goal"
              name="career_goal"
              rows={4}
              value={form.career_goal}
              onChange={handleChange}
              className="input resize-none"
              placeholder="Ví dụ: trở thành Data Analyst trong 6 tháng"
            />
          </Field>
          <Field label="Trình độ hiện tại" htmlFor="current_level">
            <select
              id="current_level"
              name="current_level"
              value={form.current_level}
              onChange={handleChange}
              className="input"
            >
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Kỹ năng và chủ đề</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Kỹ năng hiện tại" htmlFor="current_skills">
            <textarea
              id="current_skills"
              name="current_skills"
              rows={4}
              value={form.current_skills}
              onChange={handleChange}
              className="input resize-none"
              placeholder="excel, sql cơ bản, ..."
            />
          </Field>
          <Field label="Kỹ năng muốn học" htmlFor="desired_skills">
            <textarea
              id="desired_skills"
              name="desired_skills"
              rows={4}
              value={form.desired_skills}
              onChange={handleChange}
              className="input resize-none"
              placeholder="python, dashboard, statistics, ..."
            />
          </Field>
          <Field label="Chủ đề quan tâm" htmlFor="interested_topics">
            <textarea
              id="interested_topics"
              name="interested_topics"
              rows={4}
              value={form.interested_topics}
              onChange={handleChange}
              className="input resize-none"
              placeholder="data visualization, machine learning, ..."
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Cách học</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Số giờ học mỗi tuần" htmlFor="hours_per_week">
            <input
              id="hours_per_week"
              name="hours_per_week"
              type="number"
              min="0"
              value={form.hours_per_week}
              onChange={handleChange}
              className="input"
              placeholder="8"
            />
          </Field>
          <Field label="Hình thức học" htmlFor="learning_format">
            <select
              id="learning_format"
              name="learning_format"
              value={form.learning_format}
              onChange={handleChange}
              className="input"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Field>
        </div>
      </section>

      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        {profile && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Đang tạo gợi ý..." : "Tạo gợi ý khóa học"}
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
        >
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Lưu hồ sơ"}
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
