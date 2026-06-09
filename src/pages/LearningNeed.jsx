import { Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import LearningNeedForm from "../components/LearningNeedForm";
import { useApp } from "../store/authStore";

export default function LearningNeed() {
  const { studentProfile, saveStudentProfile, generateRecommendations } = useApp();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">Learning profile</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Hồ sơ học tập</h1>
        <p className="mt-1 text-slate-500">
          Cập nhật mục tiêu, kỹ năng hiện tại và kỹ năng muốn học để hệ thống mapping khóa học chính xác hơn.
        </p>
      </div>

      {!studentProfile && (
        <EmptyState
          icon={Target}
          title="Bạn chưa có hồ sơ học tập. Hãy nhập thông tin để bắt đầu nhận gợi ý."
        />
      )}

      <LearningNeedForm
        profile={studentProfile}
        onSubmit={handleSave}
        onGenerate={handleGenerate}
        saving={saving}
        generating={generating}
      />

      {studentProfile && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4" />
            Hồ sơ đã sẵn sàng để tạo gợi ý khóa học.
          </div>
        </div>
      )}
    </div>
  );
}
