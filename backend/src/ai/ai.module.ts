import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [JobsModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
