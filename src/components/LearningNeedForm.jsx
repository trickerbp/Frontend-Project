import { Save, SlidersHorizontal, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function listToText(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

function textToList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function mergeUnique(...groups) {
  const result = [];
  const seen = new Set();
  groups.flat().forEach((value) => {
    const text = String(value || "").trim();
    const key = text.toLocaleLowerCase();
    if (!text || seen.has(key)) return;
    seen.add(key);
    result.push(text);
  });
  return result;
}

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function parseHours(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

const DOMAIN_OPTIONS = [
  "Công nghệ thông tin",
  "Trí tuệ nhân tạo",
  "Data/Phân tích",
  "Kinh doanh/Quản trị",
  "Marketing/Bán hàng",
  "Tài chính/Kế toán",
  "Ngoại ngữ",
  "Thiết kế/Sáng tạo",
  "Y tế/Sức khỏe",
  "Giáo dục/Sư phạm",
  "Kỹ thuật/Cơ khí",
  "Luật/Xã hội",
  "Du lịch/Nhà hàng",
  "Logistics/Chuỗi cung ứng",
  "Nông nghiệp/Môi trường",
  "Kỹ năng mềm"
];

const OUTCOME_OPTIONS = [
  "Tìm khóa dễ bắt đầu",
  "Làm được project",
  "Đi thực tập/đi làm",
  "Đổi hướng nghề nghiệp",
  "Bổ sung môn còn yếu"
];

const TIME_OPTIONS = ["2-4 giờ/tuần", "5-8 giờ/tuần", "9-12 giờ/tuần", "Chưa rõ"];
const FORMAT_OPTIONS = [
  ["online", "Online"],
  ["offline", "Offline"],
  ["hybrid", "Hybrid"],
  ["", "Chưa rõ"]
];
const LEVEL_OPTIONS = [
  ["", "Chưa rõ"],
  ["beginner", "Mới bắt đầu"],
  ["intermediate", "Đã biết cơ bản"],
  ["advanced", "Muốn học nâng cao"]
];

export default function LearningNeedForm({
  profile,
  onSubmit,
  onGenerate,
  onAnalyze,
  onExtract,
  saving,
  generating,
  analyzing = false,
  extracting = false
}) {
  const initial = useMemo(
    () => {
      const outcomes = mergeUnique(
        asList(profile?.question_answers?.outcomes),
        profile?.question_answers?.outcome ? [profile.question_answers.outcome] : []
      );
      return {
      intent_text: profile?.intent_text || profile?.cleaned_text || "",
      domains: mergeUnique(
        asList(profile?.question_answers?.domains),
        asList(profile?.interested_topics)
      ),
      outcomes,
      time_budget: profile?.question_answers?.time_budget || "",
      learning_format: profile?.learning_format || "",
      current_level: profile?.current_level || "",
      career_goal: profile?.career_goal || "",
      current_skills: listToText(profile?.current_skills),
      desired_skills: listToText(profile?.desired_skills),
      interested_topics: listToText(profile?.interested_topics)
    };
    },
    [profile]
  );

  const [form, setForm] = useState(initial);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const domainOptions = useMemo(() => mergeUnique(form.domains), [form.domains]);

  const update = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError("");
  };

  const handleIntentTextChange = (value) => {
    setForm((prev) => {
      const replacingExistingNeed =
        Boolean(profile) &&
        prev.intent_text === initial.intent_text &&
        value !== initial.intent_text;
      if (!replacingExistingNeed) {
        return { ...prev, intent_text: value };
      }
      return {
        ...prev,
        intent_text: value,
        domains: [],
        career_goal: "",
        current_skills: "",
        desired_skills: "",
        interested_topics: ""
      };
    });
    setError("");
  };

  const hasSignal = () => {
    return Boolean(
      form.intent_text.trim() ||
        form.domains.length ||
        form.outcomes.length ||
        form.career_goal.trim() ||
        form.desired_skills.trim() ||
        form.interested_topics.trim()
    );
  };

  const buildPayload = () => {
    const extraTopics = textToList(form.interested_topics);
    const interestedTopics = mergeUnique(form.domains, extraTopics);
    return {
      intent_text: form.intent_text.trim(),
      question_answers: {
        domains: interestedTopics,
        outcomes: form.outcomes,
        outcome: form.outcomes[0] || "",
        time_budget: form.time_budget,
        level_hint: form.current_level || "unknown"
      },
      career_goal: form.career_goal.trim(),
      current_level: form.current_level || null,
      current_skills: textToList(form.current_skills),
      desired_skills: textToList(form.desired_skills),
      interested_topics: interestedTopics,
      hours_per_week: parseHours(form.time_budget),
      learning_format: form.learning_format || null
    };
  };

  const buildAnalysisPayload = () => ({
    intent_text: form.intent_text.trim(),
    question_answers: {
      domains: [],
      outcomes: form.outcomes,
      outcome: form.outcomes[0] || "",
      time_budget: form.time_budget,
      level_hint: form.current_level || "unknown"
    },
    career_goal: "",
    current_level: form.current_level || null,
    current_skills: [],
    desired_skills: [],
    interested_topics: [],
    hours_per_week: parseHours(form.time_budget),
    learning_format: form.learning_format || null
  });

  const applyExtractedProfile = (extracted, { replace = false } = {}) => {
    if (!extracted) return;
    setForm((prev) => {
      const extractedDomains = mergeUnique(
        asList(extracted.question_answers?.domains),
        asList(extracted.interested_topics)
      );
      const extractedOutcomes = mergeUnique(
        asList(extracted.question_answers?.outcomes),
        extracted.question_answers?.outcome ? [extracted.question_answers.outcome] : []
      );
      const currentSkills = mergeUnique(
        textToList(prev.current_skills),
        asList(extracted.current_skills)
      );
      const desiredSkills = mergeUnique(
        textToList(prev.desired_skills),
        asList(extracted.desired_skills)
      );
      const topics = mergeUnique(
        textToList(prev.interested_topics),
        asList(extracted.interested_topics)
      );

      return {
        ...prev,
        intent_text: extracted.intent_text || prev.intent_text,
        domains: replace ? extractedDomains : (
          extractedDomains.length ? mergeUnique(prev.domains, extractedDomains) : prev.domains
        ),
        outcomes: replace
          ? (extractedOutcomes.length ? extractedOutcomes : prev.outcomes)
          : (extractedOutcomes.length ? mergeUnique(prev.outcomes, extractedOutcomes) : prev.outcomes),
        career_goal: replace ? extracted.career_goal || "" : extracted.career_goal || prev.career_goal,
        current_level: extracted.current_level || prev.current_level,
        current_skills: replace ? listToText(extracted.current_skills) : listToText(currentSkills),
        desired_skills: replace ? listToText(extracted.desired_skills) : listToText(desiredSkills),
        interested_topics: replace ? listToText(extracted.interested_topics) : listToText(topics),
        time_budget:
          prev.time_budget ||
          extracted.question_answers?.time_budget ||
          (extracted.hours_per_week ? `${extracted.hours_per_week} giờ/tuần` : ""),
        learning_format: extracted.learning_format || prev.learning_format
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasSignal()) {
      setError("Nhập nhu cầu học hoặc chọn vài tín hiệu quan tâm.");
      return;
    }
    onSubmit(buildPayload());
  };

  const handleAnalyze = async () => {
    if (!onAnalyze) return;
    if (!hasSignal()) {
      setError("Nhập nhu cầu học hoặc chọn vài tín hiệu quan tâm.");
      return;
    }
    setError("");
    try {
      const extracted = await onAnalyze(buildAnalysisPayload());
      applyExtractedProfile(extracted, { replace: true });
    } catch {
      setError("Không phân tích được nhu cầu lúc này.");
    }
  };

  const handleExtract = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onExtract) return;
    setError("");
    try {
      const extracted = await onExtract(file);
      applyExtractedProfile(extracted);
    } catch {
      setError("Không rút trích được hồ sơ từ file này.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <Field label="Nhu cầu học" htmlFor="intent_text">
            <textarea
              id="intent_text"
              rows={7}
              value={form.intent_text}
              onChange={(event) => handleIntentTextChange(event.target.value)}
              className="input resize-none"
              placeholder="Ví dụ: Em muốn học digital marketing để chạy quảng cáo, hiện mới biết viết content cơ bản."
            />
          </Field>

          {(onAnalyze || onExtract) && (
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {onAnalyze && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || extracting}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <Sparkles className="h-4 w-4" />
                  {analyzing ? "Đang phân tích..." : "Phân tích bằng AI"}
                </button>
              )}
              {onExtract && (
                <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                  <UploadCloud className="h-4 w-4" />
                  {extracting ? "Đang đọc file..." : "Upload file"}
                  <input
                    type="file"
                    accept=".pdf,.pptx,.docx"
                    className="sr-only"
                    disabled={extracting}
                    onChange={handleExtract}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-2">
          <ChoiceGroup
            label="Bạn đang nghiêng về mảng nào?"
            options={domainOptions}
            values={form.domains}
            onToggle={(value) => update({ domains: toggleValue(form.domains, value) })}
          />
          <ChoiceGroup
            label="Kết quả mong muốn"
            options={OUTCOME_OPTIONS}
            values={form.outcomes}
            onToggle={(value) => update({ outcomes: toggleValue(form.outcomes, value) })}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-3">
          <SingleChoice
            label="Thời gian học"
            options={TIME_OPTIONS}
            value={form.time_budget}
            onChange={(value) => update({ time_budget: value })}
          />
          <SingleChoice
            label="Hình thức"
            options={FORMAT_OPTIONS}
            value={form.learning_format}
            onChange={(value) => update({ learning_format: value })}
          />
          <SingleChoice
            label="Mức nền"
            options={LEVEL_OPTIONS}
            value={form.current_level}
            onChange={(value) => update({ current_level: value })}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Tín hiệu bổ sung
        </button>

        {showAdvanced && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Mục tiêu nghề nghiệp" htmlFor="career_goal">
              <input
                id="career_goal"
                value={form.career_goal}
                onChange={(event) => update({ career_goal: event.target.value })}
                className="input"
                placeholder="Marketing Executive, Kế toán viên, Giáo viên tiếng Anh..."
              />
            </Field>
            <Field label="Kỹ năng hiện có" htmlFor="current_skills">
              <input
                id="current_skills"
                value={form.current_skills}
                onChange={(event) => update({ current_skills: event.target.value })}
                className="input"
                placeholder="excel, giao tiếp, viết content, tiếng Anh..."
              />
            </Field>
            <Field label="Kỹ năng muốn học" htmlFor="desired_skills">
              <input
                id="desired_skills"
                value={form.desired_skills}
                onChange={(event) => update({ desired_skills: event.target.value })}
                className="input"
                placeholder="SEO, kế toán, IELTS, thiết kế, Python..."
              />
            </Field>
            <Field label="Chủ đề khác" htmlFor="interested_topics">
              <input
                id="interested_topics"
                value={form.interested_topics}
                onChange={(event) => update({ interested_topics: event.target.value })}
                className="input"
                placeholder="marketing, tài chính, ngoại ngữ, logistics..."
              />
            </Field>
          </div>
        )}
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
            {generating ? "Đang tạo..." : "Tạo gợi ý"}
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
        >
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Lưu nhu cầu"}
        </button>
      </div>
    </form>
  );
}

function ChoiceGroup({ label, options, values, onToggle }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                active
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SingleChoice({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = Array.isArray(option) ? option[0] : option;
          const optionLabel = Array.isArray(option) ? option[1] : option;
          const active = value === optionValue;
          return (
            <button
              key={`${label}-${optionValue}`}
              type="button"
              onClick={() => onChange(optionValue)}
              className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                active
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
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
