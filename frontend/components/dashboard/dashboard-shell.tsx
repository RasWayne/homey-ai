'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import { AIChatPanel } from '@/components/ai/ai-chat-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs } from '@/components/ui/tabs';
import { createAiSession, getAiSessionMessages } from '@/lib/api/modules/ai';
import {
  getDeadlines,
  getDealHealth,
  getNextStep,
  getTransactionContext,
  getWorkflow,
} from '@/lib/api/modules/transactions';
import {
  AiMessageResponse,
  DeadlineItem,
  DealHealthResponse,
  NextStepResponse,
  TransactionContextResponse,
  WorkflowResponse,
} from '@/lib/api/types';
import { formatDate, formatStageName } from '@/lib/format';

interface DashboardShellProps {
  transactionId: string;
  userId: string;
}

const canonicalBuyTimeline = [
  'submit_offer',
  'offer_accepted',
  'inspection_period',
  'mortgage_process',
  'closing_preparation',
  'closing',
];

const defaultHealth: DealHealthResponse = {
  score: 0,
  completedTasks: 0,
  totalTasks: 0,
  overdueTasks: 0,
  status: 'at_risk',
};

const defaultContext: TransactionContextResponse = {
  transaction: {
    id: '',
    transactionType: 'buy',
    createdAt: new Date().toISOString(),
  },
  currentMilestone: null,
  dealHealth: defaultHealth,
  nextStep: null,
  upcomingDeadlines: [],
  pendingTasks: [],
};

const defaultWorkflow: WorkflowResponse = {
  transactionId: '',
  currentMilestoneId: null,
  milestones: [],
  progressPercentage: 0,
};

export function DashboardShell({ transactionId, userId }: DashboardShellProps): JSX.Element {
  const [health, setHealth] = useState<DealHealthResponse>(defaultHealth);
  const [nextStep, setNextStep] = useState<NextStepResponse | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowResponse>(defaultWorkflow);
  const [context, setContext] = useState<TransactionContextResponse>(defaultContext);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<AiMessageResponse[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadDashboard(): Promise<void> {
      const [nextStepData, healthData, deadlinesData, workflowData, contextData] = await Promise.all([
        getNextStep(transactionId),
        getDealHealth(transactionId),
        getDeadlines(transactionId),
        getWorkflow(transactionId),
        getTransactionContext(transactionId),
      ]);

      setNextStep(nextStepData);
      setHealth(healthData);
      setDeadlines(deadlinesData);
      setWorkflow(workflowData);
      setContext(contextData);
    }

    void loadDashboard().catch(() => undefined);
  }, [transactionId]);

  useEffect(() => {
    async function initSession(): Promise<void> {
      const session = await createAiSession({ userId, transactionId });
      setSessionId(session.sessionId);
      const history = await getAiSessionMessages(session.sessionId);
      setMessages(history);
    }

    void initSession().catch(() => undefined);
  }, [transactionId, userId]);

  const healthColor =
    health.status === 'healthy' ? '#10B981' : health.status === 'warning' ? '#F59E0B' : '#EF4444';

  const timelineItems = useMemo(() => {
    if (workflow.milestones.length > 0) {
      return workflow.milestones.map((milestone) => ({
        key: milestone.id,
        label: formatStageName(milestone.stageName),
        status: milestone.status,
      }));
    }

    return canonicalBuyTimeline.map((stage) => ({
      key: stage,
      label: formatStageName(stage),
      status: 'pending' as const,
    }));
  }, [workflow.milestones]);

  return (
    <section className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-blue-200/60 bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100">EstateAI - AI Transaction Copilot</p>
          <h2 className="mt-2 text-3xl font-semibold">Understand your deal in 10 seconds</h2>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            See your next action, deal risk, and deadlines instantly. Ask the copilot for simple guidance.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="success">Deal Health {health.score}/100</Badge>
            <Badge variant="default">{context.transaction.transactionType.toUpperCase()} Transaction</Badge>
            <Badge variant="neutral">{context.pendingTasks.length} tasks pending</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'deadlines', label: 'Deadlines' },
            ]}
            defaultTabId="overview"
            onChange={setActiveTab}
          />
          <Button variant="secondary">
            Ask Copilot
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" /> EstateAI Copilot
              </CardTitle>
              <CardDescription>Recommended next action in your transaction workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold text-slate-900">
                {nextStep?.taskTitle ?? 'No pending tasks right now'}
              </p>
              <p className="text-sm text-slate-600">
                {nextStep
                  ? `Focus on ${nextStep.milestone} before ${formatDate(nextStep.dueDate)}.`
                  : 'Great progress. You can ask EstateAI for strategic preparation tips.'}
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {nextStep?.reason ?? 'This recommendation updates automatically as milestones progress.'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Health Score</CardTitle>
              <CardDescription>A live risk score based on completed and overdue tasks.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 120 120" className="h-24 w-24 -rotate-90">
                  <circle cx="60" cy="60" r="50" stroke="#E2E8F0" strokeWidth="12" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={healthColor}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(health.score / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-slate-900">
                  {health.score}
                </div>
              </div>
              <div className="space-y-2">
                <Badge
                  variant={
                    health.status === 'healthy'
                      ? 'success'
                      : health.status === 'warning'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {health.status.replace('_', ' ')}
                </Badge>
                <p className="text-sm text-slate-600">{health.completedTasks} tasks completed</p>
                <p className="text-sm text-slate-600">{health.overdueTasks} overdue tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-amber-500" /> Upcoming Deadlines
              </CardTitle>
              <CardDescription>Track what is due next to avoid deal risk.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'deadlines' ? (
                <p className="mb-3 text-sm text-slate-600">Showing your next 5 upcoming due dates.</p>
              ) : null}
              <div className="space-y-3">
                {(deadlines.length > 0
                  ? deadlines
                  : [
                      { taskId: '1', title: 'Inspection', dueDate: new Date().toISOString(), daysRemaining: 3 },
                      { taskId: '2', title: 'Appraisal', dueDate: new Date().toISOString(), daysRemaining: 6 },
                      {
                        taskId: '3',
                        title: 'Mortgage approval',
                        dueDate: new Date().toISOString(),
                        daysRemaining: 9,
                      },
                    ]
                ).map((deadline) => (
                  <div key={deadline.taskId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">{deadline.title}</p>
                    <p className="text-sm text-slate-600">
                      {formatDate(deadline.dueDate)} • {deadline.daysRemaining} days remaining
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Timeline</CardTitle>
              <CardDescription>Milestone progress from offer to closing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timelineItems.map((item, index) => {
                const isActive = item.status === 'active';
                const isComplete = item.status === 'completed';

                return (
                  <div key={item.key} className="relative flex gap-3">
                    {index < timelineItems.length - 1 ? (
                      <div className="absolute left-[9px] top-5 h-8 w-px bg-slate-200" />
                    ) : null}
                    <div>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : isActive ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      {isActive ? <Badge variant="warning">Current milestone</Badge> : null}
                    </div>
                  </div>
                );
              })}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Readiness</span>
                  <span>{workflow.progressPercentage}%</span>
                </div>
                <Progress
                  value={workflow.progressPercentage}
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
        {sessionId ? (
          <AIChatPanel sessionId={sessionId} initialMessages={messages} title="Ask EstateAI" />
        ) : (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Ask EstateAI</CardTitle>
              <CardDescription>Preparing your AI session...</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </section>
  );
}
