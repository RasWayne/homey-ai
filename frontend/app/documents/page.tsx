import { FileText } from 'lucide-react';
import { DocumentsPageShell } from '@/components/documents/documents-page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocumentsPage(): JSX.Element {
  const transactionId = process.env.NEXT_PUBLIC_DEFAULT_TRANSACTION_ID ?? '';
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID ?? '';

  if (!transactionId || !userId) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Documents ready for demo mode
          </CardTitle>
          <CardDescription>
            Seeded demo records are required before uploading and explaining documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Run `bash scripts/setup-local.sh` and return here.
        </CardContent>
      </Card>
    );
  }

  return <DocumentsPageShell transactionId={transactionId} userId={userId} />;
}
