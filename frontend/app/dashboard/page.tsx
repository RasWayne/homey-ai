import { Sparkles } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage(): JSX.Element {
  const transactionId = process.env.NEXT_PUBLIC_DEFAULT_TRANSACTION_ID ?? '';
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID ?? '';

  if (!transactionId || !userId) {
    return (
      <section className="space-y-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" /> Demo mode is not initialized yet
            </CardTitle>
            <CardDescription>
              Run local setup once and Homey AI will auto-generate a demo buyer, property, and transaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>1. Start local stack: `bash scripts/setup-local.sh`</p>
            <p>2. Setup writes demo IDs to `frontend/.env.local` automatically</p>
            <p>3. Refresh this page to load the AI copilot dashboard</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return <DashboardShell transactionId={transactionId} userId={userId} />;
}
