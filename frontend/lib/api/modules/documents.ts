import { apiRequest } from '../client';
import { DocumentItem } from '../types';

export async function createDocumentUploadUrl(input: {
  fileName: string;
  fileType: string;
}): Promise<{ uploadUrl: string; fileUrl: string }> {
  return apiRequest('/documents/upload-url', {
    method: 'POST',
    body: input,
  });
}

export async function createDocument(input: {
  transactionId: string;
  uploadedBy: string;
  documentType: string;
  fileUrl: string;
}): Promise<DocumentItem> {
  return apiRequest('/documents', {
    method: 'POST',
    body: input,
  });
}

export async function getTransactionDocuments(
  transactionId: string,
): Promise<DocumentItem[]> {
  return apiRequest(`/transactions/${transactionId}/documents`);
}

export async function getDocumentAccessUrl(
  documentId: string,
): Promise<{ accessUrl: string }> {
  return apiRequest(`/documents/${documentId}/access-url`);
}
