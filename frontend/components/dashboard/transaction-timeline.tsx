import { WorkflowResponse } from '@/lib/api/types';
import { formatStageName } from '@/lib/format';

interface TransactionTimelineProps {
  workflow: WorkflowResponse;
}

function statusGlyph(status: 'pending' | 'active' | 'completed'): string {
  if (status === 'completed') return '✓';
  if (status === 'active') return '●';
  return '○';
}

export function TransactionTimeline({ workflow }: TransactionTimelineProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Transaction Timeline</h2>
        <p className="text-sm text-slate-600">Progress: {workflow.progressPercentage}%</p>
      </div>
      <ul className="mt-4 space-y-2">
        {workflow.milestones.map((milestone) => (
          <li key={milestone.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-lg text-slate-700">{statusGlyph(milestone.status)}</span>
            <span className="text-sm font-medium text-slate-900">{formatStageName(milestone.stageName)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
