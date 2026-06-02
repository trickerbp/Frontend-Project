import { BookOpen, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "../api/axiosClient";
import EmptyState from "../components/EmptyState";
import StatusBadge, { getClassDisplayStatus } from "../components/StatusBadge";
import { useApp } from "../store/authStore";
import { normalizeText } from "../utils/format";

const emptyForm = {
  class_name: "",
  description: "",
  teacher_name: "",
  schedule: "",
  room: "",
  max_students: 30,
  status: "open"
};

export default function AdminCourses() {
  const { classes, enrollments, addClass, updateClass, deleteClass } = useApp();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return classes.filter((cls) =>
      normalizeText(`${cls.class_name} ${cls.teacher_name} ${cls.schedule} ${cls.room}`).includes(keyword)
    );
  }, [classes, search]);

  const pendingCount = (classId) =>
    enrollments.filter((item) => item.class_id === classId && item.status === "pending").length;

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (cls) => {
    setEditing(cls);
    setForm({
      class_name: cls.class_name,
      description: cls.description,
      teacher_name: cls.teacher_name,
      schedule: cls.schedule,
      room: cls.room,
      max_students: cls.max_students,
      status: cls.status
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "max_students" ? Number(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateClass(editing.id, form);
        toast.success("Cập nhật lớp học thành công.");
      } else {
        await addClass({ ...form, current_students: 0 });
        toast.success("Thêm lớp học thành công.");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClass(deleteTarget.id);
      toast.success("Đã xóa lớp học.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Quản lý lớp học</h1>
          <p className="mt-1 text-slate-500">Tổng cộng {classes.length} lớp trong hệ thống.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          Thêm lớp
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm lớp theo tên, giảng viên, phòng..."
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Không có lớp học phù hợp." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Lớp học</th>
                  <th className="px-5 py-3 font-medium">Giảng viên</th>
                  <th className="px-5 py-3 font-medium">Lịch / Phòng</th>
                  <th className="px-5 py-3 font-medium">Sĩ số</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{cls.class_name}</p>
                      <p className="mt-1 max-w-sm truncate text-xs text-slate-500">{cls.description}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{cls.teacher_name}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <p>{cls.schedule}</p>
                      <p className="mt-1 text-xs text-slate-400">Phòng {cls.room}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>
                          {cls.current_students}/{cls.max_students}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{pendingCount(cls.id)} chờ duyệt</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={getClassDisplayStatus(cls)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Sửa lớp"
                          onClick={() => openEdit(cls)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Xóa lớp"
                          onClick={() => setDeleteTarget(cls)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ClassFormModal
          form={form}
          editing={editing}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          cls={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function ClassFormModal({ form, editing, saving, onChange, onSubmit, onClose }) {
  const inputClass =
    "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-950">
            {editing ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <label className={labelClass}>Tên lớp</label>
            <input
              name="class_name"
              value={form.class_name}
              onChange={onChange}
              required
              minLength={2}
              placeholder="Lập trình Web cơ bản"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              required
              minLength={5}
              rows={4}
              placeholder="Mô tả nội dung lớp học..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Giảng viên</label>
              <input
                name="teacher_name"
                value={form.teacher_name}
                onChange={onChange}
                required
                minLength={2}
                placeholder="Nguyen Van B"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phòng học</label>
              <input
                name="room"
                value={form.room}
                onChange={onChange}
                required
                placeholder="A101"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Lịch học</label>
            <input
              name="schedule"
              value={form.schedule}
              onChange={onChange}
              required
              minLength={2}
              placeholder="Thứ 2, Thứ 4 - 18:00 đến 20:00"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Sĩ số tối đa</label>
              <input
                name="max_students"
                type="number"
                min={1}
                max={500}
                value={form.max_students}
                onChange={onChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select name="status" value={form.status} onChange={onChange} className={inputClass}>
                <option value="open">Mở đăng ký</option>
                <option value="closed">Đóng đăng ký</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:bg-slate-300"
            >
              {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm lớp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ cls, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-center text-lg font-semibold text-slate-950">Xóa lớp học?</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Lớp "{cls.class_name}" sẽ bị xóa khỏi backend. Thao tác này không thể hoàn tác.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-10 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
