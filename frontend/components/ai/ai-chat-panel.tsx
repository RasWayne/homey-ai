'use client';

import { FormEvent, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { createAiMessage } from '@/lib/api/modules/ai';
import { AiMessageResponse } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIChatPanelProps {
  sessionId: string;
  initialMessages: AiMessageResponse[];
  title?: string;
}

export function AIChatPanel({
  sessionId,
  initialMessages,
  title = 'Ask Homey AI',
}: AIChatPanelProps): JSX.Element {
  const [messages, setMessages] = useState<AiMessageResponse[]>(initialMessages);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      const assistant = await createAiMessage(sessionId, { messageText: trimmed });
      setMessages((current) => [
        ...current,
        {
          role: 'user',
          messageText: trimmed,
          createdAt: new Date().toISOString(),
        },
        assistant,
      ]);
      setMessageText('');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[65vh] flex-col gap-4">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">
              Ask about deadlines, next actions, or request a plain-language explanation.
            </p>
          ) : null}
          {messages.map((message, index) => (
            <div
              key={`${message.createdAt}-${index}`}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 shadow-sm',
                )}
              >
                {message.messageText}
              </div>
            </div>
          ))}
        </div>

        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <input
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500 transition focus:ring-2"
            placeholder="Ask Homey AI anything about your deal"
          />
          <Button type="submit" disabled={isSending}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
