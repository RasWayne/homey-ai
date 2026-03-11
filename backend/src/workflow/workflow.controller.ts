import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { WorkflowService } from './workflow.service';

@Controller()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('transactions/:id/milestones')
  listMilestones(@Param('id') id: string) {
    return this.workflowService.listMilestones(id);
  }

  @Get('milestones/:id/tasks')
  listTasks(@Param('id') id: string) {
    return this.workflowService.listTasks(id);
  }

  @Patch('tasks/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.workflowService.updateTaskStatus(id, dto);
  }

  @Get('transactions/:id/progress')
  getProgress(@Param('id') id: string) {
    return this.workflowService.getProgress(id);
  }

  @Get('transactions/:id/workflow')
  getWorkflow(@Param('id') id: string) {
    return this.workflowService.getWorkflow(id);
  }
}
