import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export type AiQueueName = 'ai';

export interface AiMessageJobPayload {
  sessionId: string;
  messageText: string;
}

export interface DocumentExplanationJobPayload {
  documentId: string;
  prompt?: string;
}

export class AiQueueProvider {
  private readonly logger = new Logger(AiQueueProvider.name);
  private readonly queue: Queue | null;

  constructor(redisUrl: string | undefined) {
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not configured; AI queue is disabled.');
      this.queue = null;
      return;
    }

    try {
      this.queue = new Queue('ai', {
        connection: {
          url: redisUrl,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to initialize AI queue; running without background queue.');
      this.queue = null;
    }
  }

  async enqueueMessageGeneration(payload: AiMessageJobPayload): Promise<void> {
    if (!this.queue) {
      return;
    }

    await this.queue.add('generate-message', payload, {
      removeOnComplete: 200,
      removeOnFail: 500,
    });
  }

  async enqueueDocumentExplanation(payload: DocumentExplanationJobPayload): Promise<void> {
    if (!this.queue) {
      return;
    }

    await this.queue.add('explain-document', payload, {
      removeOnComplete: 200,
      removeOnFail: 500,
    });
  }
}
