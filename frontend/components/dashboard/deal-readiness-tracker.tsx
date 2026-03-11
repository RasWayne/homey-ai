import { TransactionContextResponse, WorkflowResponse } from '@/lib/api/types';

interface DealReadinessTrackerProps {
  context: TransactionContextResponse;
  workflow: WorkflowResponse;
}

export function DealReadinessTracker({
  context,
  workflow,
}: DealReadinessTrackerProps): JSX.Element {
  const readiness = workflow.progressPercentage;
  const savingsEstimate = Math.max(0, context.dealHealth.score * 15);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Deal Readiness Tracker</h2>
      <p className="mt-3 text-3xl font-bold text-slate-900">Deal Readiness: {readiness}%</p>
      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${Math.min(100, readiness)}%` }}
        />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        You avoided an estimated ${savingsEstimate.toLocaleString()} risk by completing key steps
        early.
      </p>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {context.pendingTasks.slice(0, 3).map((task) => (
          <li key={task.id} className="rounded-lg bg-slate-50 px-3 py-2">
            {task.taskName}
          </li>
        ))}
      </ul>
    </section>
  );
}
