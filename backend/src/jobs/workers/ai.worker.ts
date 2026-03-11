import { Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';

export class AiWorker {
  private readonly logger = new Logger(AiWorker.name);
  private readonly worker: Worker | null;

  constructor(redisUrl: string | undefined) {
    if (!redisUrl) {
      this.worker = null;
      return;
    }

    try {
      this.worker = new Worker(
        'ai',
        async (job: Job) => {
          this.logger.debug(`Processing AI job ${job.name} (${job.id ?? 'n/a'})`);
          return job.data;
        },
        {
          connection: {
            url: redisUrl,
          },
        },
      );
    } catch {
      this.worker = null;
    }
  }

  get instance(): Worker | null {
    return this.worker;
  }
}
