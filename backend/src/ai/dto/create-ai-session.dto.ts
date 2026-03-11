import { IsOptional, IsUUID } from 'class-validator';

export class CreateAiSessionDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  transactionId?: string;
}
