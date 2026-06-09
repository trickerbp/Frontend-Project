import { Users } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { useApp } from "../store/authStore";

export default function AdminUsers() {
  const { users } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Người dùng</h1>
        <p className="mt-1 text-slate-500">Danh sách tài khoản trong hệ thống EduMatch Resource.</p>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="Backend chưa cung cấp danh sách người dùng hoặc chưa có dữ liệu." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Tên</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id || user.email}>
                    <td className="px-5 py-4 font-medium text-slate-950">{user.name || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{user.role || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
