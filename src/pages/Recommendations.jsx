import { Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import RecommendationList from "../components/RecommendationList";
import { useApp } from "../store/authStore";

export default function Recommendations() {
  const { studentProfile, recommendations, courses, generateRecommendations } = useApp();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRecommendations();
      toast.success("Đã tạo gợi ý khóa học mới.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">Course matching</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Gợi ý khóa học</h1>
          <p className="mt-1 text-slate-500">
            Ranking khóa học dựa trên hồ sơ học tập, kỹ năng mục tiêu và tài nguyên đã xử lý.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!studentProfile || generating}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:bg-slate-300"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Đang tạo..." : "Tạo gợi ý mới"}
        </button>
      </div>

      {!studentProfile ? (
        <EmptyState
          icon={Target}
          title="Bạn cần cập nhật hồ sơ học tập trước khi tạo gợi ý."
          action={
            <Link
              to="/student/profile"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Cập nhật hồ sơ
            </Link>
          }
        />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Chưa có gợi ý nào cho hồ sơ hiện tại."
          action={
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:bg-slate-300"
            >
              Tạo gợi ý
            </button>
          }
        />
      ) : (
        <RecommendationList recommendations={recommendations} courses={courses} />
      )}
    </div>
  );
}
