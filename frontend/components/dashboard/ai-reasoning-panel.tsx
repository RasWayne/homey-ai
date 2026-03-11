'use client';

import { useState } from 'react';
import { TransactionContextResponse } from '@/lib/api/types';
import { formatDate, formatStageName } from '@/lib/format';

interface AIReasoningPanelProps {
  context: TransactionContextResponse;
}

export function AIReasoningPanel({ context }: AIReasoningPanelProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">AI Transparency Panel</h2>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          onClick={() => setIsOpen((value) => !value)}
        >
          Why am I seeing this?
        </button>
      </div>
      {isOpen ? (
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>
            Current milestone:{' '}
            {context.currentMilestone ? formatStageName(context.currentMilestone.stageName) : 'Not set'}
          </p>
          <p>Pending tasks: {context.pendingTasks.length}</p>
          <p>Upcoming deadlines: {context.upcomingDeadlines.length}</p>
          <p>Deal health: {context.dealHealth.score}</p>
          {context.pendingTasks.slice(0, 3).map((task) => (
            <p key={task.id}>
              - {task.taskName} ({formatDate(task.dueDate)})
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          View the context signals the copilot uses for recommendations.
        </p>
      )}
    </section>
  );
}
