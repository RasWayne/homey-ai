import { DeadlineItem } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

interface DeadlineRadarProps {
  deadlines: DeadlineItem[];
}

export function DeadlineRadar({ deadlines }: DeadlineRadarProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Deadline Radar</h2>
      {deadlines.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No upcoming deadlines.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {deadlines.map((deadline) => (
            <li key={deadline.taskId} className="rounded-lg bg-slate-50 p-3">
              <p className="font-medium text-slate-900">{deadline.title}</p>
              <p className="text-sm text-slate-600">
                {formatDate(deadline.dueDate)} ({deadline.daysRemaining} days remaining)
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
