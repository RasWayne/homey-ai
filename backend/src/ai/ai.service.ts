import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiMessageRole, TaskStatus } from '@prisma/client';
import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import { ExplainDocumentDto } from './dto/explain-document.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jobsService: JobsService,
  ) {}

  private readonly placeholderResponse =
    'This is a placeholder AI response. OpenAI integration will be added later.';

  private formatStageName(stageName: string): string {
    return stageName
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private async requestOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = this.configService.get<string>('ai.openAiApiKey') ?? process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      return this.placeholderResponse;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    return content;
  }

  async createSession(
    dto: CreateAiSessionDto,
  ): Promise<{ sessionId: string; createdAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.transactionId) {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: dto.transactionId },
        select: { id: true },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
    }

    const session = await this.prisma.aiChatSession.create({
      data: {
        userId: dto.userId,
        transactionId: dto.transactionId ?? null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return {
      sessionId: session.id,
      createdAt: session.createdAt,
    };
  }

  async createMessage(
    sessionId: string,
  dto: CreateAiMessageDto,
  ): Promise<{ role: AiMessageRole; messageText: string; createdAt: Date }> {
    const messageText = dto.messageText.trim();
    if (!messageText) {
      throw new BadRequestException('messageText cannot be empty');
    }

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.aiChatSession.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          transactionId: true,
          transaction: {
            select: {
              transactionType: true,
              currentMilestone: {
                select: {
                  stageName: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      await tx.aiChatMessage.create({
        data: {
          sessionId,
          role: AiMessageRole.user,
          messageText,
        },
      });

      await this.jobsService.queueAiMessageGeneration({
        sessionId,
        messageText,
      });

      const pendingTasks = session.transactionId
        ? await tx.task.findMany({
            where: {
              milestone: { transactionId: session.transactionId },
              status: { not: TaskStatus.completed },
            },
            select: {
              taskName: true,
            },
            take: 8,
            orderBy: [{ dueDate: 'asc' }, { taskOrder: 'asc' }],
          })
        : [];

      const upcomingDeadlines = session.transactionId
        ? await tx.task.findMany({
            where: {
              milestone: { transactionId: session.transactionId },
              status: { not: TaskStatus.completed },
              dueDate: { gte: new Date() },
            },
            select: {
              taskName: true,
              dueDate: true,
            },
            take: 5,
            orderBy: { dueDate: 'asc' },
          })
        : [];

      const transactionType = session.transaction?.transactionType ?? 'unknown';
      const currentMilestone = session.transaction?.currentMilestone?.stageName
        ? this.formatStageName(session.transaction.currentMilestone.stageName)
        : 'Not set';
      const pendingTaskNames =
        pendingTasks.length > 0 ? pendingTasks.map((task) => task.taskName).join(', ') : 'None';
      const deadlineText =
        upcomingDeadlines.length > 0
          ? upcomingDeadlines
              .map((task) =>
                task.dueDate
                  ? `${task.taskName} (${Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)`
                  : task.taskName,
              )
              .join(', ')
          : 'None';

      const systemPrompt = [
        'You are an AI assistant helping a homebuyer manage their real estate transaction.',
        'You are not a licensed real estate agent.',
        'Provide informational guidance only.',
        `Transaction Type: ${transactionType}`,
        `Current Milestone: ${currentMilestone}`,
        `Pending Tasks: ${pendingTaskNames}`,
        `Upcoming Deadlines: ${deadlineText}`,
      ].join('\\n');

      let assistantText = this.placeholderResponse;
      try {
        assistantText = await this.requestOpenAI(systemPrompt, messageText);
      } catch {
        assistantText = this.placeholderResponse;
      }

      const assistantMessage = await tx.aiChatMessage.create({
        data: {
          sessionId,
          role: AiMessageRole.assistant,
          messageText: assistantText,
        },
        select: {
          role: true,
          messageText: true,
          createdAt: true,
        },
      });

      return assistantMessage;
    });
  }

  async listMessages(
    sessionId: string,
  ): Promise<Array<{ role: AiMessageRole; messageText: string; createdAt: Date }>> {
    const session = await this.prisma.aiChatSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.aiChatMessage.findMany({
      where: { sessionId },
      select: {
        role: true,
        messageText: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async explainDocument(
    documentId: string,
    dto: ExplainDocumentDto,
  ): Promise<{
    documentId: string;
    summary: string;
    keyPoints: string[];
    risks: string[];
    disclaimer: string;
    explanation: string;
  }> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, fileUrl: true, documentType: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const systemPrompt =
      'Explain the following real estate document in simple terms for a first-time home buyer. Highlight important clauses and risks. Return strict JSON with keys: summary (string), keyPoints (string array), risks (string array).';
    const userPrompt = [
      `Document ID: ${document.id}`,
      `Document Type: ${document.documentType}`,
      `File URL: ${document.fileUrl}`,
      `User Prompt: ${dto.prompt ?? 'Explain this document for a first-time home buyer.'}`,
    ].join('\\n');

    let summary =
      'This document appears to be a purchase agreement. In a real estate transaction this defines the terms of the property purchase.';
    let keyPoints: string[] = [
      'Review purchase price and financing terms.',
      'Confirm contingencies and deadlines.',
      'Verify responsibilities for repairs and closing costs.',
    ];
    let risks: string[] = [
      'Missing contingency deadlines can reduce negotiation leverage.',
      'Unclear repair terms can lead to disputes before closing.',
    ];

    try {
      const aiResponse = await this.requestOpenAI(systemPrompt, userPrompt);
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(aiResponse.slice(jsonStart, jsonEnd + 1)) as {
          summary?: string;
          keyPoints?: string[];
          risks?: string[];
        };
        if (parsed.summary?.trim()) summary = parsed.summary.trim();
        if (Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0) {
          keyPoints = parsed.keyPoints.map((item) => String(item));
        }
        if (Array.isArray(parsed.risks) && parsed.risks.length > 0) {
          risks = parsed.risks.map((item) => String(item));
        }
      } else if (aiResponse.trim()) {
        summary = aiResponse.trim();
      }
    } catch {
      // Keep placeholder structured response.
    }

    const disclaimer =
      'This explanation is for informational purposes only and does not constitute legal or real estate advice.';

    await this.jobsService.queueDocumentExplanation({
      documentId,
      prompt: dto.prompt,
    });

    return {
      documentId,
      summary,
      keyPoints,
      risks,
      disclaimer,
      explanation: summary,
    };
  }
}
