import { Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import LearningNeedForm from "../components/LearningNeedForm";
import { useApp } from "../store/authStore";

export default function LearningNeed() {
  const {
    studentProfile,
    saveStudentProfile,
    analyzeStudentProfileDraft,
    extractStudentProfileDraft,
    generateRecommendations
  } = useApp();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      await saveStudentProfile(payload);
      toast.success("Đã lưu hồ sơ học tập.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRecommendations();
      toast.success("Đã tạo gợi ý khóa học.");
      navigate("/student/recommendations");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyze = async (payload) => {
    setAnalyzing(true);
    try {
      const extracted = await analyzeStudentProfileDraft(payload);
      toast.success("Đã phân tích và điền thêm mảng quan tâm.");
      return extracted;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExtract = async (file) => {
    setExtracting(true);
    try {
      const extracted = await extractStudentProfileDraft(file);
      toast.success("Đã rút trích hồ sơ. Bạn có thể chỉnh lại trước khi lưu.");
      return extracted;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">Learning intent</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Nhu cầu học</h1>
        <p className="mt-1 text-slate-500">
          Nhập điều bạn muốn học theo cách tự nhiên, hoặc chọn vài tín hiệu nhanh.
        </p>
      </div>

      {!studentProfile && (
        <EmptyState
          icon={Target}
          title="Bạn chưa có nhu cầu học nào."
        />
      )}

      <LearningNeedForm
        profile={studentProfile}
        onSubmit={handleSave}
        onGenerate={handleGenerate}
        onAnalyze={handleAnalyze}
        onExtract={handleExtract}
        saving={saving}
        generating={generating}
        analyzing={analyzing}
        extracting={extracting}
      />

      {studentProfile && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4" />
            Nhu cầu đã sẵn sàng để tạo gợi ý.
          </div>
        </div>
      )}
    </div>
  );
}
