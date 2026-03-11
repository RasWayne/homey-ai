import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface NotificationJobPayload {
  userId: string;
  type: string;
  message: string;
}

export interface TransactionHealthJobPayload {
  transactionId: string;
}

export class NotificationsQueueProvider {
  private readonly logger = new Logger(NotificationsQueueProvider.name);
  private readonly queue: Queue | null;

  constructor(redisUrl: string | undefined) {
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not configured; Notifications queue is disabled.');
      this.queue = null;
      return;
    }

    try {
      this.queue = new Queue('notifications', {
        connection: {
          url: redisUrl,
        },
      });
    } catch {
      this.logger.warn(
        'Failed to initialize Notifications queue; running without background queue.',
      );
      this.queue = null;
    }
  }

  async enqueueNotification(payload: NotificationJobPayload): Promise<void> {
    if (!this.queue) {
      return;
    }

    await this.queue.add('create-notification', payload, {
      removeOnComplete: 200,
      removeOnFail: 500,
    });
  }

  async enqueueHealthCalculation(payload: TransactionHealthJobPayload): Promise<void> {
    if (!this.queue) {
      return;
    }

    await this.queue.add('calculate-transaction-health', payload, {
      removeOnComplete: 200,
      removeOnFail: 500,
    });
  }
}
