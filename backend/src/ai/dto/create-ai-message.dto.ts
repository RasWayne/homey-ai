import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiMessageDto {
  @IsString()
  @IsNotEmpty()
  messageText!: string;
}
