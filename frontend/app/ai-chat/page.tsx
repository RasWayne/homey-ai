import { Brain } from 'lucide-react';
import { AiChatPageShell } from '@/components/ai/ai-chat-page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AiChatPage(): JSX.Element {
  const transactionId = process.env.NEXT_PUBLIC_DEFAULT_TRANSACTION_ID ?? '';
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID ?? '';

  if (!transactionId || !userId) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" /> AI chat awaiting demo context
          </CardTitle>
          <CardDescription>
            Chat quality improves when EstateAI has a seeded demo transaction context.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Run `bash scripts/setup-local.sh` to auto-create demo user and transaction IDs.
        </CardContent>
      </Card>
    );
  }

  return <AiChatPageShell transactionId={transactionId} userId={userId} />;
}
