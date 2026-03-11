'use client';

import { useEffect, useState } from 'react';
import { explainDocument } from '@/lib/api/modules/ai';
import { getTransactionDocuments } from '@/lib/api/modules/documents';
import { DocumentItem, ExplainDocumentResponse } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { DocumentUploader } from './document-uploader';

interface DocumentsPageShellProps {
  transactionId: string;
  userId: string;
}

export function DocumentsPageShell({
  transactionId,
  userId,
}: DocumentsPageShellProps): JSX.Element {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [explanation, setExplanation] = useState<ExplainDocumentResponse | null>(null);

  async function loadDocuments(): Promise<void> {
    const rows = await getTransactionDocuments(transactionId);
    setDocuments(rows);
  }

  useEffect(() => {
    void loadDocuments().catch(() => undefined);
  }, [transactionId]);

  async function handleExplain(documentId: string): Promise<void> {
    const response = await explainDocument(documentId, {
      prompt: 'Explain this document for a first-time homebuyer',
    });
    setExplanation(response);
  }

  return (
    <section className="space-y-6">
      <DocumentUploader transactionId={transactionId} uploadedBy={userId} onCreated={loadDocuments} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
        <ul className="mt-4 space-y-3">
          {documents.map((document) => (
            <li key={document.id} className="rounded-lg bg-slate-50 p-4">
              <p className="font-medium text-slate-900">{document.documentType}</p>
              <p className="text-sm text-slate-600">
                Uploaded by {document.uploader.name} on {formatDate(document.createdAt)}
              </p>
              <button
                type="button"
                className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                onClick={() => void handleExplain(document.id)}
              >
                Explain with AI
              </button>
            </li>
          ))}
        </ul>
      </section>

      {explanation ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">AI Document Explanation</h3>
          <p className="mt-3 text-sm text-slate-700">{explanation.summary}</p>
          <p className="mt-3 text-xs text-slate-500">{explanation.disclaimer}</p>
        </section>
      ) : null}
    </section>
  );
}
