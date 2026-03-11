export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
}

export interface NextStepResponse {
  taskId: string;
  taskTitle: string;
  milestone: string;
  dueDate: string | null;
  reason: string;
}

export interface DealHealthResponse {
  score: number;
  completedTasks: number;
  totalTasks: number;
  overdueTasks: number;
  status: 'healthy' | 'warning' | 'at_risk';
}

export interface DeadlineItem {
  taskId: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
}

export interface WorkflowTask {
  id: string;
  taskName: string;
  status: 'pending' | 'completed' | 'blocked';
  taskOrder: number;
  isRequired: boolean;
  dueDate: string | null;
  completedAt: string | null;
  blockedReason: string | null;
}

export interface WorkflowMilestone {
  id: string;
  stageName: string;
  status: 'pending' | 'active' | 'completed';
  tasks: WorkflowTask[];
}

export interface WorkflowResponse {
  transactionId: string;
  currentMilestoneId: string | null;
  milestones: WorkflowMilestone[];
  progressPercentage: number;
}

export interface TransactionContextResponse {
  transaction: {
    id: string;
    transactionType: 'buy' | 'sell';
    createdAt: string;
  };
  currentMilestone: {
    id: string;
    stageName: string;
    status: 'pending' | 'active' | 'completed';
    stageOrder: number;
  } | null;
  dealHealth: DealHealthResponse;
  nextStep: NextStepResponse | null;
  upcomingDeadlines: DeadlineItem[];
  pendingTasks: Array<{
    id: string;
    taskName: string;
    status: 'pending' | 'completed' | 'blocked';
    dueDate: string | null;
    milestoneId: string;
    milestoneStageName: string;
    milestoneStageOrder: number;
  }>;
}

export interface AiSessionResponse {
  sessionId: string;
  createdAt: string;
}

export interface AiMessageResponse {
  role: 'user' | 'assistant';
  messageText: string;
  createdAt: string;
}

export interface ExplainDocumentResponse {
  documentId: string;
  summary: string;
  keyPoints: string[];
  risks: string[];
  disclaimer: string;
}

export interface DocumentItem {
  id: string;
  documentType: string;
  fileUrl: string;
  uploadedAt: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}
