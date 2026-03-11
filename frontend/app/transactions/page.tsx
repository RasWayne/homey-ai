import { WalletCards } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TransactionsPage(): JSX.Element {
  const transactionId = process.env.NEXT_PUBLIC_DEFAULT_TRANSACTION_ID ?? '';
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID ?? '';

  if (!transactionId || !userId) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-blue-600" /> No active demo transaction
          </CardTitle>
          <CardDescription>Homey AI needs one seeded transaction to show timeline and task guidance.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Run `bash scripts/setup-local.sh` to seed demo transaction data.
        </CardContent>
      </Card>
    );
  }

  return <DashboardShell transactionId={transactionId} userId={userId} />;
}
