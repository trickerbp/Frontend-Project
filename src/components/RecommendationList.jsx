import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function scoreToPercent(score) {
  const numeric = Number(score || 0);
  if (numeric <= 1) return Math.round(numeric * 100);
  return numeric <= 10 ? Math.round(numeric * 10) : Math.min(100, Math.round(numeric));
}

function scoreDetailItems(detail = {}) {
  return [
    ["Kỹ năng", detail.skill_gap_score],
    ["Ngữ nghĩa", detail.semantic_match_score],
    ["Hành vi", detail.behavior_match_score],
    ["Lĩnh vực", detail.topic_match_score],
    ["Mục tiêu", detail.goal_match_score]
  ]
    .map(([label, value]) => [label, scoreToPercent(value)])
    .filter(([, value]) => value > 0);
}

export default function RecommendationList({ recommendations = [], courses = [], onTrack }) {
  const [selectedIds, setSelectedIds] = useState([]);

  return (
    <div className="space-y-3">
      {recommendations.map((item, index) => {
        const course =
          item.course ||
          courses.find((candidate) => candidate.id === item.course_id) ||
          {};
        const percent = scoreToPercent(item.score || item.match_score);
        const skills = toList(item.matched_skills);
        const missingSkills = toList(item.missing_skills);
        const unmetPrerequisites = toList(item.unmet_prerequisites);
        const reasons = toList(item.matched_reasons || item.reasons);
        const details = scoreDetailItems(item.score_detail);
        const courseId = course.id || item.course_id;
        const selected = selectedIds.includes(courseId);

        return (
          <article key={item.id || item.course_id || index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-teal-700 px-2 py-1 text-xs font-semibold text-white">
                    #{index + 1}
                  </span>
                  <h3 className="truncate text-base font-semibold text-slate-950">
                    {course.title || item.course_title || "Khóa học phù hợp"}
                  </h3>
                  <span className="text-sm text-slate-500">{course.course_code || item.course_code}</span>
                </div>
                {skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {skills.slice(0, 8).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {reasons.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {reasons.slice(0, 3).map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {(missingSkills.length > 0 || unmetPrerequisites.length > 0) && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <div className="flex gap-2 font-medium">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Cần cân nhắc trước khi chọn</span>
                    </div>
                    {missingSkills.length > 0 && (
                      <p className="mt-2">Kỹ năng còn thiếu: {missingSkills.slice(0, 6).join(", ")}</p>
                    )}
                    {unmetPrerequisites.length > 0 && (
                      <p className="mt-1">Tiên quyết chưa chắc đáp ứng: {unmetPrerequisites.slice(0, 3).join(", ")}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Phù hợp</span>
                    <span className="font-semibold text-teal-700">{percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                {details.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    {details.slice(0, 4).map(([label, value]) => (
                      <div key={label} className="rounded-md bg-slate-50 px-2 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span>{label}</span>
                          <span className="font-semibold text-slate-800">{value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {courseId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIds((prev) => (prev.includes(courseId) ? prev : [...prev, courseId]));
                      onTrack?.(courseId, "select", "recommendation_card");
                    }}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
                  >
                    {selected ? "Đã chọn" : "Chọn môn"}
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                ) : null}
                {courseId ? (
                  <Link
                    to={`/courses/${courseId}`}
                    onClick={() => onTrack?.(courseId, "view", "recommendation_card")}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Xem nội dung môn
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
