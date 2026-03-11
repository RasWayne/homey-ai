import { IsEnum, IsUUID } from 'class-validator';
import { TransactionTypeDto } from './create-transaction.dto';

export class ImportTransactionMilestoneDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  propertyId!: string;

  @IsEnum(TransactionTypeDto)
  transactionType!: TransactionTypeDto;

  @IsUUID()
  currentMilestoneId!: string;
}
