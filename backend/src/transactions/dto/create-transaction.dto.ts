import { IsEnum, IsUUID } from 'class-validator';

export enum TransactionTypeDto {
  BUY = 'buy',
  SELL = 'sell',
}

export class CreateTransactionDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  propertyId!: string;

  @IsEnum(TransactionTypeDto)
  transactionType!: TransactionTypeDto;
}
