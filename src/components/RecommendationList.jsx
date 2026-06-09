import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function scoreToPercent(score) {
  const numeric = Number(score || 0);
  return numeric <= 10 ? Math.round(numeric * 10) : Math.min(100, Math.round(numeric));
}

export default function RecommendationList({ recommendations = [], courses = [] }) {
  return (
    <div className="space-y-3">
      {recommendations.map((item, index) => {
        const course =
          item.course ||
          courses.find((candidate) => candidate.id === item.course_id) ||
          {};
        const percent = scoreToPercent(item.score || item.match_score);
        const skills = toList(item.matched_skills);
        const reasons = toList(item.matched_reasons || item.reasons);

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
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Score</span>
                    <span className="font-semibold text-teal-700">{percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                {course.id || item.course_id ? (
                  <Link
                    to={`/courses/${course.id || item.course_id}`}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Xem khóa học
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
