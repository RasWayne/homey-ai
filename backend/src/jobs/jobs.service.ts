import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiMessageJobPayload,
  AiQueueProvider,
  DocumentExplanationJobPayload,
} from './queues/ai.queue';
import {
  NotificationJobPayload,
  NotificationsQueueProvider,
  TransactionHealthJobPayload,
} from './queues/notifications.queue';
import { AiWorker } from './workers/ai.worker';
import { NotificationsWorker } from './workers/notifications.worker';

@Injectable()
export class JobsService implements OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private readonly aiQueue: AiQueueProvider;
  private readonly notificationsQueue: NotificationsQueueProvider;
  private readonly aiWorker: AiWorker;
  private readonly notificationsWorker: NotificationsWorker;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('queue.redisUrl');

    this.aiQueue = new AiQueueProvider(redisUrl);
    this.notificationsQueue = new NotificationsQueueProvider(redisUrl);
    this.aiWorker = new AiWorker(redisUrl);
    this.notificationsWorker = new NotificationsWorker(redisUrl);
  }

  async queueAiMessageGeneration(payload: AiMessageJobPayload): Promise<void> {
    try {
      await this.aiQueue.enqueueMessageGeneration(payload);
    } catch (error) {
      this.logger.warn('Failed to enqueue AI message generation job.');
    }
  }

  async queueDocumentExplanation(payload: DocumentExplanationJobPayload): Promise<void> {
    try {
      await this.aiQueue.enqueueDocumentExplanation(payload);
    } catch {
      this.logger.warn('Failed to enqueue document explanation job.');
    }
  }

  async queueNotification(payload: NotificationJobPayload): Promise<void> {
    try {
      await this.notificationsQueue.enqueueNotification(payload);
    } catch {
      this.logger.warn('Failed to enqueue notification job.');
    }
  }

  async queueTransactionHealthCalculation(
    payload: TransactionHealthJobPayload,
  ): Promise<void> {
    try {
      await this.notificationsQueue.enqueueHealthCalculation(payload);
    } catch {
      this.logger.warn('Failed to enqueue transaction health job.');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.aiWorker.instance?.close(),
      this.notificationsWorker.instance?.close(),
    ]);
  }
}
