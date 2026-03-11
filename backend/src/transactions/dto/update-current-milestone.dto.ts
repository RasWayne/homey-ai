import { IsUUID } from 'class-validator';

export class UpdateCurrentMilestoneDto {
  @IsUUID()
  currentMilestoneId!: string;
}
