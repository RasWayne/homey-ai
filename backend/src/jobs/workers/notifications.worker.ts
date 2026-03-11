import { Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';

export class NotificationsWorker {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly worker: Worker | null;

  constructor(redisUrl: string | undefined) {
    if (!redisUrl) {
      this.worker = null;
      return;
    }

    try {
      this.worker = new Worker(
        'notifications',
        async (job: Job) => {
          this.logger.debug(
            `Processing notifications job ${job.name} (${job.id ?? 'n/a'})`,
          );
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
