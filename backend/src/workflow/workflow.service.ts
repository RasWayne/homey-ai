import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MilestoneStatus,
  Prisma,
  PrismaClient,
  TaskStatus,
  TransactionType,
  WorkflowStage,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly jobsService: JobsService,
  ) {}

  private formatStageName(stage: WorkflowStage): string {
    return stage
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private readonly stageOrderByType: Record<TransactionType, WorkflowStage[]> = {
    [TransactionType.buy]: [
      WorkflowStage.select_property,
      WorkflowStage.submit_offer,
      WorkflowStage.offer_accepted,
      WorkflowStage.inspection_period,
      WorkflowStage.mortgage_process,
      WorkflowStage.appraisal,
      WorkflowStage.closing_preparation,
      WorkflowStage.closing,
    ],
    [TransactionType.sell]: [
      WorkflowStage.prepare_home_for_sale,
      WorkflowStage.list_property,
      WorkflowStage.receive_offers,
      WorkflowStage.accept_offer,
      WorkflowStage.inspection_period,
      WorkflowStage.title_and_escrow,
      WorkflowStage.closing_preparation,
      WorkflowStage.closing,
    ],
  };

  async generateWorkflowForTransaction(
    transactionId: string,
    prismaClient: PrismaExecutor = this.prisma,
  ): Promise<string> {
    const transaction = await prismaClient.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true, transactionType: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const template = await prismaClient.workflowTemplate.findFirst({
      where: { transactionType: transaction.transactionType },
      include: {
        templateTasks: {
          orderBy: [{ stageName: 'asc' }, { taskOrder: 'asc' }],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!template) {
      throw new NotFoundException(
        `Workflow template not found for transaction type: ${transaction.transactionType}`,
      );
    }

    const milestones = await this.createMilestonesFromTemplate(
      transaction.id,
      transaction.transactionType,
      template.templateTasks,
      prismaClient,
    );

    await this.createTasksFromTemplate(milestones, template.templateTasks, prismaClient);

    return milestones[0].id;
  }

  async createMilestonesFromTemplate(
    transactionId: string,
    transactionType: TransactionType,
    templateTasks: Array<{ stageName: WorkflowStage }>,
    prismaClient: PrismaExecutor = this.prisma,
  ): Promise<Array<{ id: string; stageName: WorkflowStage; stageOrder: number }>> {
    const stageOrder = this.stageOrderByType[transactionType];
    const stageSet = new Set(templateTasks.map((task) => task.stageName));

    const orderedStages = stageOrder.filter((stage) => stageSet.has(stage));
    if (orderedStages.length === 0) {
      throw new BadRequestException('Workflow template has no stages');
    }

    const createdMilestones: Array<{
      id: string;
      stageName: WorkflowStage;
      stageOrder: number;
    }> = [];

    for (let index = 0; index < orderedStages.length; index += 1) {
      const stageName = orderedStages[index];
      const milestone = await prismaClient.milestone.create({
        data: {
          transactionId,
          stageName,
          stageOrder: index + 1,
          status: index === 0 ? MilestoneStatus.active : MilestoneStatus.pending,
          startedAt: index === 0 ? new Date() : null,
        },
        select: { id: true, stageName: true, stageOrder: true },
      });

      createdMilestones.push(milestone);
    }

    return createdMilestones;
  }

  async createTasksFromTemplate(
    milestones: Array<{ id: string; stageName: WorkflowStage }>,
    templateTasks: Array<{
      stageName: WorkflowStage;
      taskName: string;
      taskOrder: number;
    }>,
    prismaClient: PrismaExecutor = this.prisma,
  ): Promise<void> {
    const milestoneIdByStage = new Map(
      milestones.map((milestone) => [milestone.stageName, milestone.id]),
    );

    const tasksData = templateTasks
      .filter((task) => milestoneIdByStage.has(task.stageName))
      .map((task) => ({
        milestoneId: milestoneIdByStage.get(task.stageName)!,
        taskName: task.taskName,
        taskDescription: null,
        taskOrder: task.taskOrder,
        isRequired: true,
        status: TaskStatus.pending,
      }));

    if (tasksData.length > 0) {
      await prismaClient.task.createMany({
        data: tasksData,
      });
    }
  }

  async listMilestones(transactionId: string): Promise<
    Array<{
      id: string;
      stageName: WorkflowStage;
      status: MilestoneStatus;
      stageOrder: number;
      startedAt: Date | null;
      completedAt: Date | null;
    }>
  > {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.milestone.findMany({
      where: { transactionId },
      select: {
        id: true,
        stageName: true,
        status: true,
        stageOrder: true,
        startedAt: true,
        completedAt: true,
      },
      orderBy: { stageOrder: 'asc' },
    });
  }

  async listTasks(milestoneId: string): Promise<
    Array<{
      id: string;
      taskName: string;
      taskDescription: string | null;
      status: TaskStatus;
      taskOrder: number;
      isRequired: boolean;
      dueDate: Date | null;
      completedAt: Date | null;
      blockedReason: string | null;
    }>
  > {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      select: { id: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return this.prisma.task.findMany({
      where: { milestoneId },
      select: {
        id: true,
        taskName: true,
        taskDescription: true,
        status: true,
        taskOrder: true,
        isRequired: true,
        dueDate: true,
        completedAt: true,
        blockedReason: true,
      },
      orderBy: { taskOrder: 'asc' },
    });
  }

  async updateTaskStatus(
    taskId: string,
    dto: UpdateTaskStatusDto,
  ): Promise<{
    id: string;
    status: TaskStatus;
    completedAt: Date | null;
    milestoneId: string;
  }> {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          status: true,
          taskName: true,
          dueDate: true,
          milestoneId: true,
          completedAt: true,
          milestone: {
            select: {
              transactionId: true,
              transaction: { select: { userId: true } },
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const nextStatus = dto.status as TaskStatus;
      if (nextStatus === TaskStatus.completed && task.status === TaskStatus.completed) {
        throw new BadRequestException('Task is already completed');
      }

      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          status: nextStatus,
          completedAt: nextStatus === TaskStatus.completed ? new Date() : null,
        },
        select: {
          id: true,
          status: true,
          completedAt: true,
          milestoneId: true,
        },
      });

      if (nextStatus === TaskStatus.completed) {
        await this.notificationsService.createNotification(
          task.milestone.transaction.userId,
          'task_completed',
          `${task.taskName} completed.`,
          tx,
        );

        const milestoneCompletion = await tx.task.aggregate({
          where: {
            milestoneId: task.milestoneId,
            isRequired: true,
          },
          _count: { _all: true },
        });

        const completedRequiredCount = await tx.task.aggregate({
          where: {
            milestoneId: task.milestoneId,
            isRequired: true,
            status: TaskStatus.completed,
          },
          _count: { _all: true },
        });

        const allRequiredCompleted =
          milestoneCompletion._count._all === completedRequiredCount._count._all;

        if (allRequiredCompleted) {
          await this.advanceMilestone(task.milestone.transactionId, tx);
        }

        await this.jobsService.queueNotification({
          userId: task.milestone.transaction.userId,
          type: 'task_completed',
          message: `${task.taskName} completed.`,
        });
      } else if (task.dueDate && task.dueDate.getTime() < Date.now()) {
        await this.notificationsService.createNotification(
          task.milestone.transaction.userId,
          'task_due',
          `${task.taskName} is overdue.`,
          tx,
        );

        await this.jobsService.queueNotification({
          userId: task.milestone.transaction.userId,
          type: 'task_due',
          message: `${task.taskName} is overdue.`,
        });
      }

      return updatedTask;
    });
  }

  async advanceMilestone(
    transactionId: string,
    prismaClient: PrismaExecutor = this.prisma,
  ): Promise<void> {
    const transaction = await prismaClient.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true, currentMilestoneId: true, userId: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.currentMilestoneId) {
      throw new BadRequestException('Transaction has no current milestone');
    }

    const currentMilestone = await prismaClient.milestone.findUnique({
      where: { id: transaction.currentMilestoneId },
      select: {
        id: true,
        transactionId: true,
        stageName: true,
        stageOrder: true,
        status: true,
      },
    });

    if (!currentMilestone || currentMilestone.transactionId !== transactionId) {
      throw new BadRequestException('Invalid current milestone for transaction');
    }

    const requiredTasksCount = await prismaClient.task.aggregate({
      where: { milestoneId: currentMilestone.id, isRequired: true },
      _count: { _all: true },
    });

    const completedRequiredTasksCount = await prismaClient.task.aggregate({
      where: {
        milestoneId: currentMilestone.id,
        isRequired: true,
        status: TaskStatus.completed,
      },
      _count: { _all: true },
    });

    const allRequiredCompleted =
      requiredTasksCount._count._all === completedRequiredTasksCount._count._all;

    if (!allRequiredCompleted) {
      throw new BadRequestException(
        'Cannot advance milestone while required tasks are incomplete',
      );
    }

    const nextMilestone = await prismaClient.milestone.findFirst({
      where: {
        transactionId,
        stageOrder: { gt: currentMilestone.stageOrder },
      },
      orderBy: { stageOrder: 'asc' },
      select: { id: true, stageName: true },
    });

    await prismaClient.milestone.update({
      where: { id: currentMilestone.id },
      data: {
        status: MilestoneStatus.completed,
        completedAt: new Date(),
      },
    });

    await this.notificationsService.createNotification(
      transaction.userId,
      'milestone_advanced',
      `${this.formatStageName(currentMilestone.stageName)} milestone completed.`,
      prismaClient,
    );
    await this.jobsService.queueNotification({
      userId: transaction.userId,
      type: 'milestone_advanced',
      message: `${this.formatStageName(currentMilestone.stageName)} milestone completed.`,
    });

    if (!nextMilestone) {
      return;
    }

    await prismaClient.milestone.update({
      where: { id: nextMilestone.id },
      data: {
        status: MilestoneStatus.active,
        startedAt: new Date(),
      },
    });

    await prismaClient.transaction.update({
      where: { id: transactionId },
      data: { currentMilestoneId: nextMilestone.id },
    });

    await this.notificationsService.createNotification(
      transaction.userId,
      'milestone_advanced',
      `Next step: ${this.formatStageName(nextMilestone.stageName)}.`,
      prismaClient,
    );
    await this.jobsService.queueNotification({
      userId: transaction.userId,
      type: 'milestone_advanced',
      message: `Next step: ${this.formatStageName(nextMilestone.stageName)}.`,
    });
  }

  async getProgress(transactionId: string): Promise<{
    transactionId: string;
    currentMilestoneId: string | null;
    progressPercentage: number;
  }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        currentMilestoneId: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const allTasks = await this.prisma.task.aggregate({
      where: { milestone: { transactionId } },
      _count: { _all: true },
    });

    const completedTasks = await this.prisma.task.aggregate({
      where: {
        milestone: { transactionId },
        status: TaskStatus.completed,
      },
      _count: { _all: true },
    });

    const progressPercentage =
      allTasks._count._all === 0
        ? 0
        : Math.round((completedTasks._count._all / allTasks._count._all) * 100);

    return {
      transactionId: transaction.id,
      currentMilestoneId: transaction.currentMilestoneId,
      progressPercentage,
    };
  }

  async getWorkflow(transactionId: string): Promise<{
    transactionId: string;
    currentMilestoneId: string | null;
    milestones: Array<{
      id: string;
      stageName: WorkflowStage;
      status: MilestoneStatus;
      tasks: Array<{
        id: string;
        taskName: string;
        status: TaskStatus;
        taskOrder: number;
        isRequired: boolean;
        dueDate: Date | null;
        completedAt: Date | null;
        blockedReason: string | null;
      }>;
    }>;
    progressPercentage: number;
  }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        currentMilestoneId: true,
        milestones: {
          select: {
            id: true,
            stageName: true,
            status: true,
            tasks: {
              select: {
                id: true,
                taskName: true,
                status: true,
                taskOrder: true,
                isRequired: true,
                dueDate: true,
                completedAt: true,
                blockedReason: true,
              },
              orderBy: { taskOrder: 'asc' },
            },
          },
          orderBy: { stageOrder: 'asc' },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const allTasksCount = transaction.milestones.reduce(
      (sum, milestone) => sum + milestone.tasks.length,
      0,
    );
    const completedTasksCount = transaction.milestones.reduce(
      (sum, milestone) =>
        sum + milestone.tasks.filter((task) => task.status === TaskStatus.completed).length,
      0,
    );

    const progressPercentage =
      allTasksCount === 0 ? 0 : Math.round((completedTasksCount / allTasksCount) * 100);

    return {
      transactionId: transaction.id,
      currentMilestoneId: transaction.currentMilestoneId,
      milestones: transaction.milestones,
      progressPercentage,
    };
  }

  async getNextStep(transactionId: string): Promise<{
    taskId: string;
    taskTitle: string;
    milestone: string;
    dueDate: Date | null;
    reason: string;
  } | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const pendingTasks = await this.prisma.task.findMany({
      where: {
        milestone: { transactionId },
        status: { not: TaskStatus.completed },
      },
      select: {
        id: true,
        taskName: true,
        dueDate: true,
        taskOrder: true,
        milestone: {
          select: {
            stageName: true,
            stageOrder: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { milestone: { stageOrder: 'asc' } },
        { taskOrder: 'asc' },
      ],
    });

    if (pendingTasks.length === 0) {
      return null;
    }

    const prioritized = [...pendingTasks].sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.milestone.stageOrder !== b.milestone.stageOrder) {
        return a.milestone.stageOrder - b.milestone.stageOrder;
      }
      return a.taskOrder - b.taskOrder;
    });

    const nextTask = prioritized[0];

    return {
      taskId: nextTask.id,
      taskTitle: nextTask.taskName,
      milestone: this.formatStageName(nextTask.milestone.stageName),
      dueDate: nextTask.dueDate,
      reason: 'This is the next required step in your transaction workflow.',
    };
  }

  async getDealHealth(transactionId: string): Promise<{
    score: number;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    status: 'healthy' | 'warning' | 'at_risk';
  }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const tasks = await this.prisma.task.findMany({
      where: { milestone: { transactionId } },
      select: {
        status: true,
        dueDate: true,
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === TaskStatus.completed).length;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (task) =>
        task.status !== TaskStatus.completed && task.dueDate && task.dueDate.getTime() < now.getTime(),
    ).length;

    const baseScore = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    const penalty = overdueTasks * 10;
    const score = Math.max(0, Math.round(baseScore - penalty));

    const status: 'healthy' | 'warning' | 'at_risk' =
      score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'at_risk';

    await this.jobsService.queueTransactionHealthCalculation({ transactionId });

    return {
      score,
      completedTasks,
      totalTasks,
      overdueTasks,
      status,
    };
  }

  async getUpcomingDeadlines(transactionId: string): Promise<
    Array<{
      taskId: string;
      title: string;
      dueDate: Date;
      daysRemaining: number;
    }>
  > {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        milestone: { transactionId },
        status: { not: TaskStatus.completed },
        dueDate: { gte: startOfToday },
      },
      select: {
        id: true,
        taskName: true,
        dueDate: true,
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    return tasks
      .filter((task): task is { id: string; taskName: string; dueDate: Date } => !!task.dueDate)
      .map((task) => {
        const millisecondsRemaining = task.dueDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24)));

        return {
          taskId: task.id,
          title: task.taskName,
          dueDate: task.dueDate,
          daysRemaining,
        };
      });
  }

  async getTransactionContext(transactionId: string): Promise<{
    transaction: {
      id: string;
      transactionType: TransactionType;
      createdAt: Date;
    };
    currentMilestone: {
      id: string;
      stageName: WorkflowStage;
      status: MilestoneStatus;
      stageOrder: number;
    } | null;
    dealHealth: {
      score: number;
      completedTasks: number;
      totalTasks: number;
      overdueTasks: number;
      status: 'healthy' | 'warning' | 'at_risk';
    };
    nextStep: {
      taskId: string;
      taskTitle: string;
      milestone: string;
      dueDate: Date | null;
      reason: string;
    } | null;
    upcomingDeadlines: Array<{
      taskId: string;
      title: string;
      dueDate: Date;
      daysRemaining: number;
    }>;
    pendingTasks: Array<{
      id: string;
      taskName: string;
      status: TaskStatus;
      dueDate: Date | null;
      milestoneId: string;
      milestoneStageName: WorkflowStage;
      milestoneStageOrder: number;
    }>;
  }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        transactionType: true,
        createdAt: true,
        currentMilestone: {
          select: {
            id: true,
            stageName: true,
            status: true,
            stageOrder: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const [dealHealth, nextStep, upcomingDeadlines, pendingTasks] = await Promise.all([
      this.getDealHealth(transactionId),
      this.getNextStep(transactionId),
      this.getUpcomingDeadlines(transactionId),
      this.prisma.task.findMany({
        where: {
          milestone: { transactionId },
          status: { not: TaskStatus.completed },
        },
        select: {
          id: true,
          taskName: true,
          status: true,
          dueDate: true,
          milestoneId: true,
          milestone: {
            select: {
              stageName: true,
              stageOrder: true,
            },
          },
        },
        orderBy: [
          { milestone: { stageOrder: 'asc' } },
          { taskOrder: 'asc' },
        ],
      }),
    ]);

    return {
      transaction: {
        id: transaction.id,
        transactionType: transaction.transactionType,
        createdAt: transaction.createdAt,
      },
      currentMilestone: transaction.currentMilestone,
      dealHealth,
      nextStep,
      upcomingDeadlines,
      pendingTasks: pendingTasks.map((task) => ({
        id: task.id,
        taskName: task.taskName,
        status: task.status,
        dueDate: task.dueDate,
        milestoneId: task.milestoneId,
        milestoneStageName: task.milestone.stageName,
        milestoneStageOrder: task.milestone.stageOrder,
      })),
    };
  }
}
