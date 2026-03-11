import { apiRequest } from '../client';
import {
  AiMessageResponse,
  AiSessionResponse,
  ExplainDocumentResponse,
} from '../types';

export async function createAiSession(input: {
  userId: string;
  transactionId?: string;
}): Promise<AiSessionResponse> {
  return apiRequest('/ai/sessions', {
    method: 'POST',
    body: input,
  });
}

export async function createAiMessage(
  sessionId: string,
  input: { messageText: string },
): Promise<AiMessageResponse> {
  return apiRequest(`/ai/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: input,
  });
}

export async function getAiSessionMessages(sessionId: string): Promise<AiMessageResponse[]> {
  return apiRequest(`/ai/sessions/${sessionId}/messages`);
}

export async function explainDocument(
  documentId: string,
  input: { prompt: string },
): Promise<ExplainDocumentResponse> {
  return apiRequest(`/ai/documents/${documentId}/explain`, {
    method: 'POST',
    body: input,
  });
}
