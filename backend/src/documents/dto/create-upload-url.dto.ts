import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUploadUrlDto {
  @IsUUID()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}
