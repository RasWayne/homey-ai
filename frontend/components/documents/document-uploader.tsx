'use client';

import { FormEvent, useState } from 'react';
import { createDocument, createDocumentUploadUrl } from '@/lib/api/modules/documents';

interface DocumentUploaderProps {
  transactionId: string;
  uploadedBy: string;
  onCreated: () => Promise<void>;
}

export function DocumentUploader({
  transactionId,
  uploadedBy,
  onCreated,
}: DocumentUploaderProps): JSX.Element {
  const [documentType, setDocumentType] = useState('purchase_agreement');
  const [fileName, setFileName] = useState('sample.pdf');
  const [fileType, setFileType] = useState('application/pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { fileUrl } = await createDocumentUploadUrl({ fileName, fileType });
      await createDocument({
        transactionId,
        uploadedBy,
        documentType,
        fileUrl,
      });
      await onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Upload Document</h2>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
        <input
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="File name"
        />
        <input
          value={fileType}
          onChange={(event) => setFileType(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="File type"
        />
        <input
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Document type"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white sm:col-span-2"
        >
          {isSubmitting ? 'Uploading...' : 'Create Document Record'}
        </button>
      </form>
    </section>
  );
}
