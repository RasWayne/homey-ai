import { apiRequest } from '../client';
import {
  DeadlineItem,
  DealHealthResponse,
  NextStepResponse,
  TransactionContextResponse,
  WorkflowResponse,
} from '../types';

export async function getTransaction(id: string): Promise<unknown> {
  return apiRequest(`/transactions/${id}`);
}

export async function getTransactionMilestones(id: string): Promise<unknown> {
  return apiRequest(`/transactions/${id}/milestones`);
}

export async function getNextStep(transactionId: string): Promise<NextStepResponse | null> {
  return apiRequest(`/transactions/${transactionId}/next-step`);
}

export async function getDealHealth(transactionId: string): Promise<DealHealthResponse> {
  return apiRequest(`/transactions/${transactionId}/health`);
}

export async function getDeadlines(transactionId: string): Promise<DeadlineItem[]> {
  return apiRequest(`/transactions/${transactionId}/deadlines`);
}

export async function getWorkflow(transactionId: string): Promise<WorkflowResponse> {
  return apiRequest(`/transactions/${transactionId}/workflow`);
}

export async function getTransactionContext(
  transactionId: string,
): Promise<TransactionContextResponse> {
  return apiRequest(`/transactions/${transactionId}/context`);
}
