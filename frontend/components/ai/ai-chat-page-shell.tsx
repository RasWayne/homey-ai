'use client';

import { useEffect, useState } from 'react';
import { createAiSession, getAiSessionMessages } from '@/lib/api/modules/ai';
import { AiMessageResponse } from '@/lib/api/types';
import { AIChatPanel } from './ai-chat-panel';

interface AiChatPageShellProps {
  transactionId: string;
  userId: string;
}

export function AiChatPageShell({
  transactionId,
  userId,
}: AiChatPageShellProps): JSX.Element {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<AiMessageResponse[]>([]);

  useEffect(() => {
    async function initialize(): Promise<void> {
      const session = await createAiSession({ userId, transactionId });
      setSessionId(session.sessionId);
      const history = await getAiSessionMessages(session.sessionId);
      setMessages(history);
    }

    void initialize().catch(() => undefined);
  }, [transactionId, userId]);

  if (!sessionId) {
    return <p className="text-sm text-slate-600">Initializing AI session...</p>;
  }

  return <AIChatPanel sessionId={sessionId} initialMessages={messages} />;
}
