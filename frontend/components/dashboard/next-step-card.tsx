import { NextStepResponse } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

interface NextStepCardProps {
  nextStep: NextStepResponse | null;
}

export function NextStepCard({ nextStep }: NextStepCardProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Next Step</h2>
      {!nextStep ? (
        <p className="mt-3 text-sm text-slate-600">No pending tasks.</p>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-xl font-semibold text-slate-900">{nextStep.taskTitle}</p>
          <p className="text-sm text-slate-600">Milestone: {nextStep.milestone}</p>
          <p className="text-sm text-slate-600">Due: {formatDate(nextStep.dueDate)}</p>
          <p className="text-sm text-slate-500">{nextStep.reason}</p>
        </div>
      )}
    </section>
  );
}
