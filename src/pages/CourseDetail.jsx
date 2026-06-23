import { ArrowLeft, Clock, FileText, Play, Trash2, UploadCloud, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import RecommendationList from "../components/RecommendationList";
import StatusBadge, { CourseStatusBadge, LevelBadge, ProcessingStatusBadge } from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatBytes, formatDate } from "../utils/format";

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export default function CourseDetail({ resourcesOnly = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    courses,
    courseResources,
    currentUser,
    recommendations,
    loadCourseResources,
    uploadCourseResource,
    processResource,
    deleteResource,
    trackRecommendationEvent
  } = useApp();
  const [tab, setTab] = useState(resourcesOnly ? "resources" : "overview");
  const [selectedFile, setSelectedFile] = useState(null);
  const [busy, setBusy] = useState("");

  const course = courses.find((item) => item.id === id);
  const resources = courseResources[id] || [];
  const canManage = currentUser?.role === "admin" || currentUser?.role === "teacher";
  const courseRecommendations = useMemo(
    () => recommendations.filter((item) => item.course_id === id || item.course?.id === id),
    [id, recommendations]
  );

  useEffect(() => {
    if (id && !courseResources[id]) {
      loadCourseResources(id).catch(() => {});
    }
  }, [courseResources, id, loadCourseResources]);

  useEffect(() => {
    if (id && currentUser?.role === "student") {
      trackRecommendationEvent?.(id, "view", "course_detail");
    }
  }, [currentUser?.role, id, trackRecommendationEvent]);

  if (!course) {
    return (
      <EmptyState
        icon={FileText}
        title="Không tìm thấy khóa học."
        action={
          <Link to="/courses" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white">
            Quay lại danh sách
          </Link>
        }
      />
    );
  }

  const handleUpload = async () => {
    if (!selectedFile) return;
    setBusy("upload");
    try {
      await uploadCourseResource(course.id, selectedFile);
      toast.success("Đã upload và tự rút trích tài nguyên.");
      setSelectedFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy("");
    }
  };

  const handleProcess = async (resourceId) => {
    setBusy(resourceId);
    try {
      await processResource(course.id, resourceId);
      toast.success("Đã xử lý lại tài nguyên.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy("");
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm("Xóa tài nguyên này?")) return;
    setBusy(resourceId);
    try {
      await deleteResource(course.id, resourceId);
      toast.success("Đã xóa tài nguyên.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <CourseStatusBadge status={course.status} />
              <LevelBadge level={course.level} />
              {course.course_code && <StatusBadge status={course.course_code} />}
            </div>
            <h1 className="text-2xl font-semibold text-slate-950">{course.title || "Khóa học chưa đặt tên"}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">{course.description || "Chưa có mô tả."}</p>
          </div>
          {canManage && (
            <Link
              to={`/teacher/courses/${course.id}/edit`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Chỉnh sửa
            </Link>
          )}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto app-scrollbar">
        {[
          ["overview", "Tổng quan"],
          ["skills", "Kỹ năng & chủ đề"],
          ["resources", "Tài nguyên"],
          ...(currentUser?.role === "student" ? [["mapping", "Gợi ý/mapping"]] : [])
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`min-h-10 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
              tab === value ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Mục tiêu nghề nghiệp</h2>
            <TagBlock items={toList(course.target_goals)} empty="Chưa khai báo mục tiêu." />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Thông tin nhanh</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow icon={UserRound} label="Giảng viên" value={course.teacher_name || course.instructor || course.teacher_id} />
              <SummaryRow icon={Clock} label="Thời lượng" value={course.duration_hours ? `${course.duration_hours} giờ` : "-"} />
              <SummaryRow icon={FileText} label="Tài nguyên" value={`${resources.length || course.resource_count || 0} file`} />
              <SummaryRow label="Cập nhật" value={formatDate(course.updated_at)} />
            </dl>
          </aside>
        </section>
      )}

      {tab === "skills" && (
        <section className="grid gap-5 lg:grid-cols-3">
          <Panel title="Tag thủ công" items={toList(course.manual_tags)} />
          <Panel title="Kỹ năng trích xuất" items={toList(course.extracted_skills)} />
          <Panel title="Chủ đề trích xuất" items={toList(course.extracted_topics)} />
        </section>
      )}

      {tab === "resources" && (
        <section className="space-y-5">
          {canManage && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950">Upload tài nguyên</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center hover:border-teal-300 hover:bg-teal-50">
                  <UploadCloud className="mb-2 h-6 w-6 text-teal-700" />
                  <span className="text-sm font-medium text-slate-700">
                    {selectedFile ? selectedFile.name : "Chọn file .pdf, .pptx hoặc .docx"}
                  </span>
                  {selectedFile && <span className="mt-1 text-xs text-slate-500">{formatBytes(selectedFile.size)}</span>}
                  <input
                    type="file"
                    accept=".pdf,.pptx,.docx"
                    className="sr-only"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || busy === "upload"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
                >
                  <UploadCloud className="h-4 w-4" />
                  {busy === "upload" ? "Đang upload..." : "Upload"}
                </button>
              </div>
            </div>
          )}
          <ResourceList resources={resources} busy={busy} canManage={canManage} onProcess={handleProcess} onDelete={handleDelete} />
        </section>
      )}

      {tab === "mapping" && (
        <section>
          {courseRecommendations.length > 0 ? (
            <RecommendationList
              recommendations={courseRecommendations}
              courses={courses}
              onTrack={trackRecommendationEvent}
            />
          ) : (
            <EmptyState icon={FileText} title="Chưa có dữ liệu mapping cho khóa học này." />
          )}
        </section>
      )}
    </div>
  );
}

function ResourceList({ resources, busy, canManage, onProcess, onDelete }) {
  if (!resources.length) return <EmptyState icon={FileText} title="Khóa học chưa có tài nguyên." />;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {resources.map((resource) => {
          const extractedTags = [
            ...toList(resource.extracted_skills),
            ...toList(resource.extracted_topics)
          ];
          return (
          <div key={resource.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <h3 className="truncate font-medium text-slate-950">{resource.original_file_name || resource.file_name || resource.name}</h3>
                <ProcessingStatusBadge status={resource.processing_status || resource.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {resource.file_type || resource.content_type || "file"} · {formatBytes(resource.file_size || resource.size)}
              </p>
              {resource.summary && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{resource.summary}</p>}
              <TagBlock items={extractedTags} />
            </div>
            {canManage && (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onProcess(resource.id)}
                  disabled={busy === resource.id}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-cyan-200 px-3 py-1.5 text-sm font-medium text-cyan-700 hover:bg-cyan-50 disabled:opacity-60"
                >
                  <Play className="h-4 w-4" />
                  Xử lý lại
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(resource.id)}
                  disabled={busy === resource.id}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function Panel({ title, items }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <TagBlock items={items} />
    </div>
  );
}

function TagBlock({ items, empty = "Chưa có dữ liệu." }) {
  if (!items.length) return <p className="mt-3 text-sm text-slate-500">{empty}</p>;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-700">
          {item}
        </span>
      ))}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="flex items-center gap-2 text-slate-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </dt>
      <dd className="max-w-40 break-words text-right font-medium text-slate-900">{value || "-"}</dd>
    </div>
  );
}
