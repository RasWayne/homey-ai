import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat/chat.controller';
import configuration from './config/configuration';
import { AiModule } from './ai/ai.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthController } from './health/health.controller';
import { JobsModule } from './jobs/jobs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  controllers: [ChatController, HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    UsersModule,
    PropertiesModule,
    TransactionsModule,
    WorkflowModule,
    DocumentsModule,
    AiModule,
    NotificationsModule,
    JobsModule,
  ],
})
export class AppModule {}
