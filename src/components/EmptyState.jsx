export default function EmptyState({ icon: Icon, title, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-10 w-10 text-slate-300" />}
      <p className="font-medium text-slate-700">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
