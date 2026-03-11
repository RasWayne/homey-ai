import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ImportTransactionMilestoneDto } from './dto/import-transaction-milestone.dto';
import { UpdateCurrentMilestoneDto } from './dto/update-current-milestone.dto';
import { TransactionsService } from './transactions.service';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly workflowService: WorkflowService,
  ) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Post('import-milestone')
  importMilestone(@Body() dto: ImportTransactionMilestoneDto) {
    return this.transactionsService.importMilestone(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/current-milestone')
  updateCurrentMilestone(
    @Param('id') id: string,
    @Body() dto: UpdateCurrentMilestoneDto,
  ) {
    return this.transactionsService.updateCurrentMilestone(id, dto);
  }

  @Get(':id/next-step')
  getNextStep(@Param('id') id: string) {
    return this.workflowService.getNextStep(id);
  }

  @Get(':id/health')
  getDealHealth(@Param('id') id: string) {
    return this.workflowService.getDealHealth(id);
  }

  @Get(':id/deadlines')
  getUpcomingDeadlines(@Param('id') id: string) {
    return this.workflowService.getUpcomingDeadlines(id);
  }

  @Get(':id/context')
  getTransactionContext(@Param('id') id: string) {
    return this.workflowService.getTransactionContext(id);
  }
}
