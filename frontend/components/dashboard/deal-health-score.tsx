import { DealHealthResponse } from '@/lib/api/types';

interface DealHealthScoreProps {
  health: DealHealthResponse;
}

const statusStyles: Record<DealHealthResponse['status'], string> = {
  healthy: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  at_risk: 'bg-rose-100 text-rose-700',
};

export function DealHealthScore({ health }: DealHealthScoreProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Deal Health Score</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[health.status]}`}>
          {health.status.replace('_', ' ')}
        </span>
      </div>
      <p className="mt-4 text-4xl font-bold text-slate-900">{health.score}</p>
      <p className="mt-2 text-sm text-slate-600">
        {health.completedTasks}/{health.totalTasks} tasks complete, {health.overdueTasks} overdue.
      </p>
    </section>
  );
}
