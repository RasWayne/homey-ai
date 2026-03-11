'use client';

import { FormEvent, useState } from 'react';
import { createAiMessage } from '@/lib/api/modules/ai';
import {
  getDeadlines,
  getDealHealth,
  getNextStep,
} from '@/lib/api/modules/transactions';

interface CopilotCommandBarProps {
  transactionId: string;
  aiSessionId: string;
  onResult: (message: string) => void;
}

export function CopilotCommandBar({
  transactionId,
  aiSessionId,
  onResult,
}: CopilotCommandBarProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    setIsLoading(true);
    try {
      if (normalized.includes('next')) {
        const nextStep = await getNextStep(transactionId);
        onResult(nextStep ? `Next step: ${nextStep.taskTitle}` : 'No pending tasks.');
      } else if (normalized.includes('risk') || normalized.includes('health')) {
        const health = await getDealHealth(transactionId);
        onResult(`Deal health is ${health.score} (${health.status}).`);
      } else if (normalized.includes('deadline') || normalized.includes('inspection')) {
        const deadlines = await getDeadlines(transactionId);
        onResult(
          deadlines.length > 0
            ? `Nearest deadline: ${deadlines[0].title} in ${deadlines[0].daysRemaining} days.`
            : 'No upcoming deadlines found.',
        );
      } else {
        const response = await createAiMessage(aiSessionId, { messageText: query });
        onResult(response.messageText);
      }
    } catch {
      onResult('Unable to process this command right now.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Ask: "What should I do next?"'
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? 'Thinking...' : 'Ask Copilot'}
        </button>
      </form>
    </section>
  );
}
