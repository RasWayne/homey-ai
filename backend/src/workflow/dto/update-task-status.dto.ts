import { IsEnum } from 'class-validator';

export enum TaskStatusDto {
  PENDING = 'pending',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatusDto)
  status!: TaskStatusDto;
}
