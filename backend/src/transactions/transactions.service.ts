import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MilestoneStatus, TaskStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ImportTransactionMilestoneDto } from './dto/import-transaction-milestone.dto';
import { UpdateCurrentMilestoneDto } from './dto/update-current-milestone.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
  ) {}

  async create(dto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: dto.userId,
          propertyId: dto.propertyId,
          transactionType: dto.transactionType as TransactionType,
        },
        select: {
          id: true,
          userId: true,
          propertyId: true,
          transactionType: true,
          currentMilestoneId: true,
          createdAt: true,
        },
      });

      const firstMilestoneId = await this.workflowService.generateWorkflowForTransaction(
        transaction.id,
        tx,
      );

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { currentMilestoneId: firstMilestoneId },
      });

      return tx.transaction.findUnique({
        where: { id: transaction.id },
        select: {
          id: true,
          userId: true,
          propertyId: true,
          transactionType: true,
          currentMilestoneId: true,
          createdAt: true,
          milestones: {
            select: {
              id: true,
              stageName: true,
              stageOrder: true,
              status: true,
              startedAt: true,
              completedAt: true,
              tasks: {
                select: {
                  id: true,
                  taskName: true,
                  taskOrder: true,
                  isRequired: true,
                  status: true,
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
    });
  }

  async importMilestone(dto: ImportTransactionMilestoneDto) {
    return this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        propertyId: dto.propertyId,
        transactionType: dto.transactionType as TransactionType,
        currentMilestoneId: dto.currentMilestoneId,
      },
      select: {
        id: true,
        userId: true,
        propertyId: true,
        transactionType: true,
        currentMilestoneId: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        propertyId: true,
        transactionType: true,
        currentMilestoneId: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  updateCurrentMilestone(
    id: string,
    dto: UpdateCurrentMilestoneDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        select: { id: true, currentMilestoneId: true },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      const targetMilestone = await tx.milestone.findUnique({
        where: { id: dto.currentMilestoneId },
        select: { id: true, transactionId: true, stageOrder: true },
      });

      if (!targetMilestone || targetMilestone.transactionId !== id) {
        throw new BadRequestException('Target milestone is invalid for transaction');
      }

      if (!transaction.currentMilestoneId) {
        throw new BadRequestException('Transaction has no current milestone');
      }

      const currentMilestone = await tx.milestone.findUnique({
        where: { id: transaction.currentMilestoneId },
        select: { id: true, stageOrder: true },
      });

      if (!currentMilestone) {
        throw new BadRequestException('Current milestone not found');
      }

      if (targetMilestone.stageOrder > currentMilestone.stageOrder + 1) {
        throw new BadRequestException('Cannot skip milestones');
      }

      if (targetMilestone.stageOrder === currentMilestone.stageOrder + 1) {
        const incompleteRequiredTasks = await tx.task.count({
          where: {
            milestoneId: currentMilestone.id,
            isRequired: true,
            status: { not: TaskStatus.completed },
          },
        });

        if (incompleteRequiredTasks > 0) {
          throw new BadRequestException(
            'Cannot advance milestone while required tasks are incomplete',
          );
        }

        await tx.milestone.update({
          where: { id: currentMilestone.id },
          data: {
            status: MilestoneStatus.completed,
            completedAt: new Date(),
          },
        });

        await tx.milestone.update({
          where: { id: targetMilestone.id },
          data: {
            status: MilestoneStatus.active,
            startedAt: new Date(),
          },
        });
      }

      return tx.transaction.update({
        where: { id },
        data: { currentMilestoneId: dto.currentMilestoneId },
        select: {
          id: true,
          currentMilestoneId: true,
        },
      });
    });
  }
}
