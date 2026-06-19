import { Activity } from "lucide-react";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { formatDate } from "../utils/format";

export default function ProcessingLogs() {
  const { processingLogs } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">Processing</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Nhật ký xử lý</h1>
        <p className="mt-1 text-slate-500">Theo dõi pipeline trích xuất text, kỹ năng, chủ đề và summary từ tài nguyên.</p>
      </div>

      {processingLogs.length === 0 ? (
        <EmptyState icon={Activity} title="Backend chưa cung cấp processing logs hoặc chưa có log xử lý." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {processingLogs.map((log) => (
              <div key={log.id || `${log.resource_id}-${log.created_at}`} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950">{log.message || log.action || "Sự kiện xử lý"}</p>
                  <p className="mt-1 text-sm text-slate-500">{log.resource_id || log.course_id || "Không có mã tài nguyên"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">{formatDate(log.created_at)}</span>
                  <StatusBadge status={log.status || log.processing_status || "pending"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
